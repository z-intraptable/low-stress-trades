import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { DataSourceStatusRow } from "./lst-types";

export const getDataSourceStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<DataSourceStatusRow[]> => {
    const { data, error } = await context.supabase
      .from("data_source_status")
      .select("*")
      .order("source_name", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []) as DataSourceStatusRow[];
  });
