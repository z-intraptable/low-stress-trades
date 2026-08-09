import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { UserSettings } from "./lst-types";

const settingsSchema = z.object({
  account_balance: z.number().nullable(),
  risk_pct_per_trade: z.number().min(0).max(0.5),
  daily_loss_limit_pct: z.number().min(0).max(1),
  taker_fee_pct: z.number().nullable(),
  slippage_estimate_pct: z.number().nullable(),
  max_trades_per_day: z.number().int().min(1),
});

export const getUserSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<UserSettings | null> => {
    const { data, error } = await context.supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", context.userId)
      .single();

    if (error && error.code !== "PGRST116") {
      throw new Error(error.message);
    }

    return data as UserSettings | null;
  });

export const upsertUserSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => settingsSchema.parse(data))
  .handler(async ({ context, data }): Promise<UserSettings> => {
    const { data: existing } = await context.supabase
      .from("user_settings")
      .select("id")
      .eq("user_id", context.userId)
      .single();

    const payload = {
      ...data,
      user_id: context.userId,
      updated_at: new Date().toISOString(),
    };

    const { data: result, error } = existing
      ? await context.supabase
          .from("user_settings")
          .update(payload)
          .eq("id", existing.id)
          .select()
          .single()
      : await context.supabase
          .from("user_settings")
          .insert({ ...payload, created_at: new Date().toISOString() })
          .select()
          .single();

    if (error) {
      throw new Error(error.message);
    }

    return result as UserSettings;
  });
