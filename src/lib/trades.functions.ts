import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Trade } from "./lst-types";

export const getTrades = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Trade[]> => {
    const { data, error } = await context.supabase
      .from("trades")
      .select("*")
      .eq("user_id", context.userId)
      .order("opened_at", { ascending: false })
      .limit(200);

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []) as Trade[];
  });

const tradeInsertSchema = z.object({
  pair: z.string().min(1),
  side: z.enum(["LONG", "SHORT"]),
  entry_price: z.number().positive(),
  exit_price: z.number().nullable(),
  size: z.number().positive(),
  pnl: z.number().nullable(),
  slippage: z.number().nullable(),
  opened_at: z.string().datetime(),
  closed_at: z.string().datetime().nullable(),
  signal_id: z.string().uuid().nullable(),
});

export const createTrade = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) => tradeInsertSchema.parse(data))
  .handler(async ({ context, data }): Promise<Trade> => {
    const { data: result, error } = await context.supabase
      .from("trades")
      .insert({ ...data, user_id: context.userId })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return result as Trade;
  });

const tradeUpdateSchema = z.object({
  id: z.string().uuid(),
  exit_price: z.number().nullable(),
  pnl: z.number().nullable(),
  slippage: z.number().nullable(),
  closed_at: z.string().datetime().nullable(),
});

export const updateTrade = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => tradeUpdateSchema.parse(data))
  .handler(async ({ context, data }): Promise<Trade> => {
    const { id, ...payload } = data;
    const { data: result, error } = await context.supabase
      .from("trades")
      .update(payload)
      .eq("id", id)
      .eq("user_id", context.userId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return result as Trade;
  });

const tradeDeleteSchema = z.object({ id: z.string().uuid() });

export const deleteTrade = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => tradeDeleteSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("trades")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  });
