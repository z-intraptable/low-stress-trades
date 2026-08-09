import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { LiquidationCluster } from "./lst-types";

export const getLiquidationClusters = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<LiquidationCluster[]> => {
    const { data, error } = await context.supabase
      .from("liquidation_clusters")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(200);

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []) as LiquidationCluster[];
  });
