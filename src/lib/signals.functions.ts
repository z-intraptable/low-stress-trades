import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { QceSignal } from "./lst-types";

export const getRecentSignals = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<QceSignal[]> => {
    const { data, error } = await context.supabase
      .from("qce_signals")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []) as QceSignal[];
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
  .inputValidator((data) => markProcessedSchema.parse(data))
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
