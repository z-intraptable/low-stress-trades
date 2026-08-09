import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import type { QceSignal, Trade, BotRanking, LiquidationCluster } from "@/lib/lst-types";
import { getRecentSignals } from "@/lib/signals.functions";
import { getTrades } from "@/lib/trades.functions";
import { getBotRankings, getLiquidationClusters } from "@/lib/radar.functions";
import { getOrderbookHeatmap, type OrderbookHeatmap as OrderbookHeatmapData } from "@/lib/orderbook.functions";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { PriceChart } from "@/components/lst/price-chart";
import { TradeDialog } from "@/components/lst/trade-dialog";
import { TradeJournal } from "@/components/lst/trade-journal";
import { BotRadar } from "@/components/lst/bot-radar";
import { OrderbookHeatmap } from "@/components/lst/orderbook-heatmap";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — LST" },
      { name: "description", content: "Low Stress Trading terminal dashboard." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const fetchRecentSignals = useServerFn(getRecentSignals);
  const fetchTrades = useServerFn(getTrades);
  const fetchRankings = useServerFn(getBotRankings);
  const fetchClusters = useServerFn(getLiquidationClusters);

  const { data: rawSignals = [], refetch: refetchSignals } = useQuery({
    queryKey: ["recentSignals"],
    queryFn: () => fetchRecentSignals(),
    refetchInterval: 5000,
  });

  const { data: trades = [], refetch: refetchTrades } = useQuery({
    queryKey: ["trades"],
    queryFn: () => fetchTrades(),
    refetchInterval: 5000,
  });

  const { data: rankings = [] } = useQuery({
    queryKey: ["botRankings"],
    queryFn: () => fetchRankings(),
    refetchInterval: 30000,
  });

  const { data: clusters = [] } = useQuery({
    queryKey: ["liquidationClusters"],
    queryFn: () => fetchClusters(),
    refetchInterval: 30000,
  });

  const fetchOrderbook = useServerFn(getOrderbookHeatmap);
  const activeSymbol = latest?.symbol ?? "";
  const { data: orderbookData } = useQuery({
    queryKey: ["orderbook", activeSymbol],
    queryFn: () => fetchOrderbook({ symbol: activeSymbol }),
    enabled: activeSymbol.length > 0,
    refetchInterval: 5000,
  });

  const signals = rawSignals.slice(0, 20);
  const [liveSignal, setLiveSignal] = useState<QceSignal | null>(null);

  useEffect(() => {
    const channel = supabase
      .channel("qce_signals")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "qce_signals" },
        (payload) => {
          const signal = payload.new as QceSignal;
          setLiveSignal(signal);
          toast.info(`New ${signal.signal} signal on ${signal.symbol}`, {
            description: `Confluence score: ${signal.confluence_score}`,
          });
          refetchSignals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetchSignals]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/auth/login";
  }

  const latest = liveSignal ?? signals[0];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold tracking-tight">LST Terminal</h1>
            <Badge variant="outline" className="text-xs">
              Risk-first
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/settings"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Settings
            </Link>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-6">
        <Tabs defaultValue="signal" className="space-y-6">
          <TabsList>
            <TabsTrigger value="signal">Signal</TabsTrigger>
            <TabsTrigger value="journal">Journal</TabsTrigger>
            <TabsTrigger value="radar">Radar</TabsTrigger>
          </TabsList>

          <TabsContent value="signal" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="border-border bg-card lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Latest Signal</CardTitle>
                </CardHeader>
                <CardContent>
                  {latest ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-3xl font-bold">{latest.symbol}</p>
                          <p className="text-sm text-muted-foreground">
                            {latest.timeframe} · {latest.type}
                          </p>
                        </div>
                        <Badge
                          className={
                            latest.signal === "LONG"
                              ? "bg-long text-long-foreground"
                              : "bg-short text-short-foreground"
                          }
                        >
                          {latest.signal}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Entry</p>
                          <p className="font-medium">{latest.entry.toFixed(4)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">SL</p>
                          <p className="font-medium text-short">
                            {latest.sl.toFixed(4)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">TP1</p>
                          <p className="font-medium text-long">
                            {latest.tp1.toFixed(4)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Confluence</p>
                          <p className="font-medium">{latest.confluence_score}/100</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="rounded-md bg-muted p-3">
                          <p className="text-muted-foreground">Regime</p>
                          <p className="font-medium">{latest.regime_state}</p>
                        </div>
                        <div className="rounded-md bg-muted p-3">
                          <p className="text-muted-foreground">Liquidity</p>
                          <p className="font-medium">{latest.liquidity_state}</p>
                        </div>
                        <div className="rounded-md bg-muted p-3">
                          <p className="text-muted-foreground">Correlation</p>
                          <p className="font-medium">
                            {latest.correlation_flag ? "Flagged" : "OK"}
                          </p>
                        </div>
                      </div>

                      {latest.cost_adjusted_rr != null && (
                        <div className="text-sm">
                          <p className="text-muted-foreground">Cost-adjusted R:R</p>
                          <p className="font-medium">{latest.cost_adjusted_rr.toFixed(2)}</p>
                        </div>
                      )}

                      {latest.suggested_position_size != null && (
                        <div className="text-sm">
                          <p className="text-muted-foreground">Suggested size</p>
                          <p className="font-medium">{latest.suggested_position_size.toFixed(4)}</p>
                        </div>
                      )}

                      <TradeDialog
                        signal={latest}
                        onTradeCreated={() => {
                          refetchTrades();
                          toast.success("Trade logged");
                        }}
                      >
                        <Button className="w-full sm:w-auto">
                          Execute {latest.signal}
                        </Button>
                      </TradeDialog>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No signals yet. Send a test webhook to /api/public/qce-webhook.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-lg">Signal Feed</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {signals.slice(0, 8).map((signal) => (
                      <li
                        key={signal.id}
                        className="flex items-center justify-between border-b border-border pb-2 last:border-0 last:pb-0"
                      >
                        <div>
                          <p className="font-medium">{signal.symbol}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(signal.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            signal.signal === "LONG"
                              ? "border-long text-long"
                              : "border-short text-short"
                          }
                        >
                          {signal.signal}
                        </Badge>
                      </li>
                    ))}
                    {signals.length === 0 && (
                      <li className="text-sm text-muted-foreground">No recent signals.</li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <PriceChart signal={latest ?? null} />
          </TabsContent>

          <TabsContent value="journal">
            <TradeJournal trades={trades as Trade[]} onChange={() => refetchTrades()} />
          </TabsContent>

          <TabsContent value="radar">
            <BotRadar
              rankings={rankings as BotRanking[]}
              clusters={clusters as LiquidationCluster[]}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
