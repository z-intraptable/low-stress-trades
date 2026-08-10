import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { computeATR, computeADX, computeVolumeRatio, fetchBinanceKlines } from "@/lib/market-data";
import {
  computeAtrBasedLevels,
  computeConfluenceScore,
  computeRegimeState,
  computeLiquidityState,
  computeCostAdjustedRR,
  computePositionSize,
} from "@/lib/trading-math";
import type { SignalSide } from "@/lib/lst-types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Type-only, so it is erased at build time and never pulls the service-role
// client into the browser bundle.
type SupabaseAdminClient = SupabaseClient<Database>;

const payloadSchema = z.object({
  symbol: z.string().min(1),
  timeframe: z.string().min(1),
  signal: z.enum(["LONG", "SHORT"]),
  type: z.enum(["STANDARD", "DIAMOND"]),
  price: z.number().positive(),
  score: z.number().int().min(0).max(100),
  secret: z.string().min(1),
});

async function findSingleTenantUserId(supabaseAdmin: SupabaseAdminClient): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from("user_settings")
    .select("user_id")
    .limit(1)
    .single();

  if (error || !data) return null;
  return data.user_id as string;
}

async function hasRecentSameDirectionSignal(
  supabaseAdmin: SupabaseAdminClient,
  userId: string,
  symbol: string,
  signal: SignalSide,
): Promise<boolean> {
  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
  const { data, error } = await supabaseAdmin
    .from("qce_signals")
    .select("id")
    .eq("user_id", userId)
    .eq("symbol", symbol)
    .eq("signal", signal)
    .gte("created_at", twoMinutesAgo)
    .limit(1);

  if (error || !data) return false;
  return data.length > 0;
}

async function checkCorrelationFlag(
  supabaseAdmin: SupabaseAdminClient,
  userId: string,
  signal: SignalSide,
): Promise<boolean> {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const { count, error } = await supabaseAdmin
    .from("qce_signals")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("signal", signal)
    .gte("created_at", fiveMinutesAgo);

  if (error || count == null) return false;
  return count >= 2; // this signal will make it 3
}

export const Route = createFileRoute("/api/public/qce-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["QCE_WEBHOOK_SECRET"];
        if (!secret) {
          return new Response(JSON.stringify({ error: "Webhook secret not configured" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const parsed = payloadSchema.safeParse(body);
        if (!parsed.success) {
          return new Response(
            JSON.stringify({ error: "Invalid payload", details: parsed.error.format() }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }

        const payload = parsed.data;

        if (payload.secret !== secret) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const userId = await findSingleTenantUserId(supabaseAdmin);
        if (!userId) {
          return new Response(JSON.stringify({ error: "No user configured for this deployment" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        let candles;
        try {
          candles = await fetchBinanceKlines(payload.symbol, payload.timeframe, 50);
        } catch (err) {
          return new Response(
            JSON.stringify({
              error: "Failed to fetch market data",
              message: err instanceof Error ? err.message : String(err),
            }),
            { status: 502, headers: { "Content-Type": "application/json" } },
          );
        }

        const atr = computeATR(candles, 14);
        const adx = computeADX(candles, 14);
        const volumeRatio = computeVolumeRatio(candles);
        const levels = computeAtrBasedLevels(payload.price, atr, payload.signal);
        const regimeState = computeRegimeState(adx);
        const liquidityState = computeLiquidityState(volumeRatio);

        const orderbookAgreement: "AGREE" | "CONFLICT" | "NEUTRAL" = "NEUTRAL";
        const multiTimeframeBoost = await hasRecentSameDirectionSignal(
          supabaseAdmin,
          userId,
          payload.symbol,
          payload.signal,
        );

        const confluenceScore = computeConfluenceScore(
          payload.score,
          adx,
          orderbookAgreement,
          multiTimeframeBoost,
        );

        const correlationFlag = await checkCorrelationFlag(supabaseAdmin, userId, payload.signal);

        const { data: settings } = await supabaseAdmin
          .from("user_settings")
          .select("*")
          .eq("user_id", userId)
          .single();

        let costAdjustedRR: number | null = null;
        let suggestedPositionSize: number | null = null;

        if (
          settings &&
          settings.account_balance != null &&
          settings.risk_pct_per_trade != null &&
          settings.taker_fee_pct != null &&
          settings.slippage_estimate_pct != null
        ) {
          suggestedPositionSize = computePositionSize(
            settings.account_balance,
            settings.risk_pct_per_trade,
            levels.entry,
            levels.sl,
          );
          costAdjustedRR = computeCostAdjustedRR(
            levels.entry,
            levels.sl,
            levels.tp1,
            settings.taker_fee_pct,
            settings.slippage_estimate_pct,
          );
        }

        const { error: insertError } = await supabaseAdmin.from("qce_signals").insert({
          user_id: userId,
          symbol: payload.symbol,
          timeframe: payload.timeframe,
          signal: payload.signal,
          type: payload.type,
          price: payload.price,
          entry: levels.entry,
          sl: levels.sl,
          tp1: levels.tp1,
          tp2: levels.tp2,
          tp3: levels.tp3,
          raw_score: payload.score,
          confluence_score: confluenceScore,
          orderbook_agreement: orderbookAgreement,
          regime_state: regimeState,
          liquidity_state: liquidityState,
          correlation_flag: correlationFlag,
          cost_adjusted_rr: costAdjustedRR,
          suggested_position_size: suggestedPositionSize,
          atr14: atr,
          adx14: adx,
          volume_ratio: volumeRatio,
        });

        if (insertError) {
          return new Response(JSON.stringify({ error: insertError.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(
          JSON.stringify({
            success: true,
            confluence_score: confluenceScore,
            regime_state: regimeState,
            liquidity_state: liquidityState,
            correlation_flag: correlationFlag,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      },
    },
  },
});
