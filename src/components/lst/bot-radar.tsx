import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { BotRanking, LiquidationCluster } from "@/lib/lst-types";
import { formatPercent } from "@/lib/trading-math";

interface BotRadarProps {
  rankings: BotRanking[];
  clusters: LiquidationCluster[];
}

export function BotRadar({ rankings, clusters }: BotRadarProps) {
  const sortedClusters = [...clusters]
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 12);

  const maxVolume = sortedClusters[0]?.volume ?? 1;

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Bot Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          {rankings.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No bot rankings yet. Rankings are computed from your logged trades and signal outcomes.
            </p>
          ) : (
            <div className="space-y-4">
              {rankings.map((bot) => (
                <div
                  key={bot.id}
                  className="flex flex-col gap-2 rounded-md border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{bot.bot_name}</span>
                      <Badge variant="outline" className="text-xs">
                        {bot.timeframe}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {bot.strategy_summary}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm sm:text-right">
                    <div>
                      <p className="text-muted-foreground">Win rate</p>
                      <p className="font-medium">{formatPercent(bot.win_rate)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Avg yield</p>
                      <p className="font-medium">{formatPercent(bot.avg_yield)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Volume tier</p>
                      <p className="font-medium">{bot.volume_tier}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Liquidation Cluster Map</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedClusters.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No liquidation clusters loaded yet.
            </p>
          ) : (
            <div className="space-y-3">
              {sortedClusters.map((cluster) => (
                <div key={cluster.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{cluster.pair}</span>
                      <Badge variant="outline" className="text-xs">
                        {cluster.size_bucket}
                      </Badge>
                    </div>
                    <span className="text-muted-foreground">
                      {cluster.price_level.toFixed(2)}
                    </span>
                  </div>
                  <Progress
                    value={(cluster.volume / maxVolume) * 100}
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
