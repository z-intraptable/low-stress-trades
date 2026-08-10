import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Trade } from "@/lib/lst-types";
import { updateTrade, deleteTrade } from "@/lib/trades.functions";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/trading-math";

interface TradeJournalProps {
  trades: Trade[];
  onChange?: () => void;
}

export function TradeJournal({ trades, onChange }: TradeJournalProps) {
  const updateTradeFn = useServerFn(updateTrade);
  const deleteTradeFn = useServerFn(deleteTrade);
  const [closingId, setClosingId] = useState<string | null>(null);
  const [exitPrice, setExitPrice] = useState("");

  async function handleClose(trade: Trade) {
    if (!exitPrice) return;
    const exit = Number(exitPrice);
    const pnl =
      trade.side === "LONG"
        ? (exit - trade.entry_price) * trade.size
        : (trade.entry_price - exit) * trade.size;
    try {
      await updateTradeFn({
        data: {
          id: trade.id,
          exit_price: exit,
          pnl,
          slippage: trade.slippage,
          closed_at: new Date().toISOString(),
        },
      });
      toast.success("Trade closed");
      setClosingId(null);
      setExitPrice("");
      onChange?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to close trade");
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteTradeFn({ data: { id } });
      toast.success("Trade deleted");
      onChange?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete trade");
    }
  }

  const openTrades = trades.filter((t) => t.closed_at == null);
  const closedTrades = trades.filter((t) => t.closed_at != null);
  const totalPnl = closedTrades.reduce((sum, t) => sum + (t.pnl ?? 0), 0);
  const winCount = closedTrades.filter((t) => (t.pnl ?? 0) > 0).length;
  const winRate = closedTrades.length > 0 ? winCount / closedTrades.length : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Closed P&L</p>
            <p className={`text-2xl font-bold ${totalPnl >= 0 ? "text-long" : "text-short"}`}>
              {formatCurrency(totalPnl)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Win rate</p>
            <p className="text-2xl font-bold">{formatPercent(winRate)}</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Open positions</p>
            <p className="text-2xl font-bold">{openTrades.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Open positions</CardTitle>
        </CardHeader>
        <CardContent>
          {openTrades.length === 0 ? (
            <p className="text-sm text-muted-foreground">No open positions.</p>
          ) : (
            <ul className="space-y-3">
              {openTrades.map((trade) => (
                <li
                  key={trade.id}
                  className="flex flex-col gap-2 rounded-md border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{trade.pair}</span>
                      <Badge
                        variant="outline"
                        className={
                          trade.side === "LONG"
                            ? "border-long text-long"
                            : "border-short text-short"
                        }
                      >
                        {trade.side}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Entry {formatNumber(trade.entry_price)} · Size {formatNumber(trade.size)}
                    </p>
                  </div>
                  {closingId === trade.id ? (
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`exit-${trade.id}`} className="sr-only">
                        Exit price
                      </Label>
                      <Input
                        id={`exit-${trade.id}`}
                        type="number"
                        step="any"
                        placeholder="Exit price"
                        value={exitPrice}
                        onChange={(e) => setExitPrice(e.target.value)}
                        className="w-32"
                      />
                      <Button size="sm" onClick={() => handleClose(trade)}>
                        Close
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setClosingId(null);
                          setExitPrice("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => setClosingId(trade.id)}>
                        Close
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-short hover:text-short"
                        onClick={() => handleDelete(trade.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Closed trades</CardTitle>
        </CardHeader>
        <CardContent>
          {closedTrades.length === 0 ? (
            <p className="text-sm text-muted-foreground">No closed trades yet.</p>
          ) : (
            <ul className="space-y-2">
              {closedTrades.slice(0, 20).map((trade) => (
                <li
                  key={trade.id}
                  className="flex items-center justify-between border-b border-border pb-2 last:border-0 last:pb-0"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{trade.pair}</span>
                      <Badge
                        variant="outline"
                        className={
                          trade.side === "LONG"
                            ? "border-long text-long"
                            : "border-short text-short"
                        }
                      >
                        {trade.side}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(trade.closed_at!).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-medium ${
                        (trade.pnl ?? 0) >= 0 ? "text-long" : "text-short"
                      }`}
                    >
                      {formatCurrency(trade.pnl)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatNumber(trade.entry_price)} → {formatNumber(trade.exit_price)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
