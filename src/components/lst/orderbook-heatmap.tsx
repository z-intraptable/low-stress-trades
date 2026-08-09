import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { OrderbookHeatmap as OrderbookHeatmapData } from "@/lib/orderbook.functions";

interface OrderbookHeatmapProps {
  data: OrderbookHeatmapData | null;
  symbol: string;
}

export function OrderbookHeatmap({ data, symbol }: OrderbookHeatmapProps) {
  if (!data) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg">OrderFlow Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Select an active signal to load Binance depth data for {symbol || "the active pair"}.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { levels, midPrice, spreadPct } = data;

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">OrderFlow Heatmap</CardTitle>
        <div className="flex items-center gap-2 text-sm">
          <Badge variant="outline">{symbol}</Badge>
          <span className="text-muted-foreground">Mid</span>
          <span className="font-mono">{midPrice.toFixed(2)}</span>
          <span className="text-muted-foreground">Spread</span>
          <span className="font-mono">{spreadPct.toFixed(4)}%</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {levels.map((level) => {
            const isAsk = level.side === "ask";
            const color = isAsk
              ? "oklch(0.68 0.19 30 / 0.35)"
              : "oklch(0.84 0.22 120 / 0.35)";
            return (
              <div
                key={`${level.side}-${level.price}`}
                className="relative flex items-center justify-between rounded px-2 py-1 text-sm"
              >
                <div
                  className="absolute inset-y-0 rounded"
                  style={{
                    width: `${Math.max(level.intensity * 100, 2)}%`,
                    backgroundColor: color,
                    right: isAsk ? 0 : "auto",
                    left: isAsk ? "auto" : 0,
                  }}
                />
                <span className="relative z-10 font-mono">
                  {level.price.toFixed(2)}
                </span>
                <span className="relative z-10 text-muted-foreground">
                  {level.qty.toFixed(4)}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
