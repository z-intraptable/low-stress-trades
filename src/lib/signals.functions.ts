import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { QceSignal } from "./lst-types";

const recentSignalsSchema = z.object({ limit: z.number().int().min(1).max(100).default(50) });

export const getRecentSignals = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data) => recentSignalsSchema.parse(data))
  .handler(async ({ context, data }): Promise<QceSignal[]> => {
    const { data: rows, error } = await context.supabase
      .from("qce_signals")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(data.limit);

    if (error) {
      throw new Error(error.message);
    }

    return (rows ?? []) as QceSignal[];
  });

export const getLatestSignal = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<QceSignal | null> => {
    const { data, error } = await context.supabase
      .from("qce_signals")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      throw new Error(error.message);
    }

    return (data ?? null) as QceSignal | null;
  });

const markProcessedSchema = z.object({ signalId: z.string().uuid() });

export const markSignalProcessed = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) => markProcessedSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("qce_signals")
      .update({ processed: true })
      .eq("id", data.signalId)
      .eq("user_id", context.userId);

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  });
