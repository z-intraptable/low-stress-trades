import { useEffect, useRef, useState } from "react";
import { createChart, type IChartApi, type ISeriesApi, type CandlestickData, type LineStyle } from "lightweight-charts";
import type { QceSignal } from "@/lib/lst-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PriceChartProps {
  signal: QceSignal | null;
}

async function fetchKlines(symbol: string, timeframe: string): Promise<CandlestickData[]> {
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
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
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

    const series = chart.addCandlestickSeries({
      upColor: "#B8E986",
      downColor: "#FF8A80",
      borderUpColor: "#B8E986",
      borderDownColor: "#FF8A80",
      wickUpColor: "#B8E986",
      wickDownColor: "#FF8A80",
    });

    chartRef.current = chart;
    seriesRef.current = series;

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    const series = seriesRef.current;
    if (!series) return;

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
          if (last) {
            const entryLine = chartRef.current?.addLineSeries({
              color: "#22D3EE",
              lineStyle: 2 as LineStyle,
              lineWidth: 2,
              title: "Entry",
            });
            entryLine?.setData([
              { time: last.time, value: signal.entry },
              { time: (last.time as unknown as number) + 60 * 5 as unknown as string, value: signal.entry },
            ]);

            const slLine = chartRef.current?.addLineSeries({
              color: "#FF8A80",
              lineStyle: 2 as LineStyle,
              lineWidth: 2,
              title: "SL",
            });
            slLine?.setData([
              { time: last.time, value: signal.sl },
              { time: (last.time as unknown as number) + 60 * 5 as unknown as string, value: signal.sl },
            ]);

            const tpLine = chartRef.current?.addLineSeries({
              color: "#B8E986",
              lineStyle: 2 as LineStyle,
              lineWidth: 2,
              title: "TP1",
            });
            tpLine?.setData([
              { time: last.time, value: signal.tp1 },
              { time: (last.time as unknown as number) + 60 * 5 as unknown as string, value: signal.tp1 },
            ]);
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
