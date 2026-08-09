import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { BotRanking } from "./lst-types";

export const getBotRankings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<BotRanking[]> => {
    const { data, error } = await context.supabase
      .from("bot_rankings")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []) as BotRanking[];
  });

const botSchema = z.object({
  bot_name: z.string().min(1),
  timeframe: z.string().min(1),
  win_rate: z.number().min(0).max(1),
  avg_yield: z.number(),
  volume_tier: z.string().min(1),
  strategy_summary: z.string().min(1),
});

export const createBotRanking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => botSchema.parse(data))
  .handler(async ({ context, data }): Promise<BotRanking> => {
    const { data: result, error } = await context.supabase
      .from("bot_rankings")
      .insert({ ...data, user_id: context.userId })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return result as BotRanking;
  });

export const deleteBotRanking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("bot_rankings")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  });
