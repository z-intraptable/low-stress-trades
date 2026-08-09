import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { BotRanking, LiquidationCluster } from "@/lib/lst-types";

export const getBotRankings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<BotRanking[]> => {
    const { data, error } = await context.supabase
      .from("bot_rankings")
      .select("*")
      .eq("user_id", context.userId)
      .order("avg_yield", { ascending: false })
      .limit(50);

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []) as BotRanking[];
  });

export const getLiquidationClusters = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<LiquidationCluster[]> => {
    const { data, error } = await context.supabase
      .from("liquidation_clusters")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(100);

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []) as LiquidationCluster[];
  });
