import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const BinanceDepthResponse = z.object({
  lastUpdateId: z.number(),
  bids: z.array(z.tuple([z.string(), z.string()])),
  asks: z.array(z.tuple([z.string(), z.string()])),
});

export interface OrderbookLevel {
  price: number;
  qty: number;
  total: number;
  side: "bid" | "ask";
  intensity: number;
}

export interface OrderbookHeatmap {
  midPrice: number;
  spreadPct: number;
  levels: OrderbookLevel[];
}

export const getOrderbookHeatmap = createServerFn({ method: "GET" })
  .validator((data) => z.object({ symbol: z.string() }).parse(data))
  .handler(async ({ data }): Promise<OrderbookHeatmap> => {
    const clean = data.symbol.replace("/", "").replace("USDT", "") + "USDT";
    const url = `https://api.binance.com/api/v3/depth?symbol=${clean}&limit=50`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Binance depth fetch failed: ${res.status}`);
    }

    const json = await res.json();
    const parsed = BinanceDepthResponse.parse(json);

    const bids: OrderbookLevel[] = parsed.bids
      .map(([p, q]) => ({
        price: parseFloat(p),
        qty: parseFloat(q),
        total: parseFloat(p) * parseFloat(q),
        side: "bid" as const,
        intensity: 0,
      }))
      .sort((a, b) => b.price - a.price);

    const asks: OrderbookLevel[] = parsed.asks
      .map(([p, q]) => ({
        price: parseFloat(p),
        qty: parseFloat(q),
        total: parseFloat(p) * parseFloat(q),
        side: "ask" as const,
        intensity: 0,
      }))
      .sort((a, b) => a.price - b.price);

    const bestBid = bids[0]?.price ?? 0;
    const bestAsk = asks[0]?.price ?? 0;
    const midPrice = bestBid && bestAsk ? (bestBid + bestAsk) / 2 : 0;
    const spreadPct = midPrice ? ((bestAsk - bestBid) / midPrice) * 100 : 0;

    const maxTotal = Math.max(
      ...bids.map((b) => b.total),
      ...asks.map((a) => a.total),
      1
    );

    const levels = [...bids.slice(-20), ...asks.slice(0, 20)].map((level) => ({
      ...level,
      intensity: level.total / maxTotal,
    }));

    return {
      midPrice,
      spreadPct,
      levels,
    };
  });
