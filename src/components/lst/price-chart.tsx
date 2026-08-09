import { useEffect, useRef, useState } from "react";
import type { QceSignal } from "@/lib/lst-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PriceChartProps {
  signal: QceSignal | null;
}

async function fetchKlines(symbol: string, timeframe: string): Promise<
  { time: string; open: number; high: number; low: number; close: number }[]
> {
  const pair = symbol.toUpperCase().replace(/\/$/, "").replace(/\/(?=\s*$)/, "");
  const cleanSymbol = pair.includes("USDT") ? pair : `${pair}USDT`;
  const interval = timeframe.toLowerCase();
  const res = await fetch(
    `https://api.binance.com/api/v3/klines?symbol=${cleanSymbol}&interval=${interval}&limit=150`
  );
  if (!res.ok) throw new Error("Failed to fetch market data");
  const data = (await res.json()) as [number, string, string, string, string, string][];
  return data.map((row) => ({
    time: (row[0] / 1000) as unknown as string,
    open: parseFloat(row[1]),
    high: parseFloat(row[2]),
    low: parseFloat(row[3]),
    close: parseFloat(row[4]),
  }));
}

export function PriceChart({ signal }: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof import("lightweight-charts").createChart> | null>(null);
  const seriesRef = useRef<ReturnType<
    ReturnType<typeof import("lightweight-charts").createChart>["addSeries"]
  > | null>(null);
  const overlayRefs = useRef<ReturnType<
    ReturnType<typeof import("lightweight-charts").createChart>["addSeries"]
  >[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    let cancelled = false;

    import("lightweight-charts").then((lw) => {
      if (cancelled || !containerRef.current) return;

      const chart = lw.createChart(containerRef.current!, {
        layout: {
          background: { color: "transparent" },
          textColor: "rgba(255,255,255,0.6)",
        },
        grid: {
          vertLines: { color: "rgba(255,255,255,0.05)" },
          horzLines: { color: "rgba(255,255,255,0.05)" },
        },
        rightPriceScale: {
          borderColor: "rgba(255,255,255,0.1)",
        },
        timeScale: {
          borderColor: "rgba(255,255,255,0.1)",
          timeVisible: true,
        },
        autoSize: true,
      });

      const series = chart.addSeries(lw.CandlestickSeries, {
        upColor: "#B8E986",
        downColor: "#FF8A80",
        borderUpColor: "#B8E986",
        borderDownColor: "#FF8A80",
        wickUpColor: "#B8E986",
        wickDownColor: "#FF8A80",
      });

      chartRef.current = chart;
      seriesRef.current = series;
    });

    return () => {
      cancelled = true;
      chartRef.current?.remove();
      chartRef.current = null;
      seriesRef.current = null;
      overlayRefs.current = [];
    };
  }, []);

  useEffect(() => {
    const series = seriesRef.current;
    if (!series) return;

    // remove previous overlays
    overlayRefs.current.forEach((s) => chartRef.current?.removeSeries(s));
    overlayRefs.current = [];

    setError(null);
    setLoaded(false);

    const symbol = signal?.symbol ?? "BTC";
    const timeframe = signal?.timeframe ?? "5m";

    fetchKlines(symbol, timeframe)
      .then((data) => {
        series.setData(data);
        chartRef.current?.timeScale().fitContent();
        setLoaded(true);

        if (signal) {
          const last = data[data.length - 1];
          if (last && chartRef.current) {
            import("lightweight-charts").then((lw) => {
              if (!chartRef.current) return;
              const nextTime = (Number(last.time) + 60 * 5) as unknown as string;

              const entryLine = chartRef.current.addSeries(lw.LineSeries, {
                lineStyle: 2,
                lineWidth: 2,
                color: "#22D3EE",
                title: "Entry",
              });
              entryLine.setData([
                { time: last.time, value: signal.entry },
                { time: nextTime, value: signal.entry },
              ]);
              overlayRefs.current.push(entryLine);

              const slLine = chartRef.current.addSeries(lw.LineSeries, {
                lineStyle: 2,
                lineWidth: 2,
                color: "#FF8A80",
                title: "SL",
              });
              slLine.setData([
                { time: last.time, value: signal.sl },
                { time: nextTime, value: signal.sl },
              ]);
              overlayRefs.current.push(slLine);

              const tpLine = chartRef.current.addSeries(lw.LineSeries, {
                lineStyle: 2,
                lineWidth: 2,
                color: "#B8E986",
                title: "TP1",
              });
              tpLine.setData([
                { time: last.time, value: signal.tp1 },
                { time: nextTime, value: signal.tp1 },
              ]);
              overlayRefs.current.push(tpLine);
            });
          }
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Chart load failed");
      });
  }, [signal]);

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-lg">
          Price Action {signal ? `· ${signal.symbol} ${signal.timeframe}` : ""}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-80 w-full">
          {!loaded && !error && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
              Loading chart…
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-short">
              {error}
            </div>
          )}
          <div ref={containerRef} className="h-full w-full" />
        </div>
      </CardContent>
    </Card>
  );
}
