import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { QceSignal, Trade } from "@/lib/lst-types";
import { createTrade } from "@/lib/trades.functions";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

interface TradeDialogProps {
  signal: QceSignal;
  onTradeCreated?: (trade: Trade) => void;
  children: React.ReactNode;
}

export function TradeDialog({ signal, onTradeCreated, children }: TradeDialogProps) {
  const createTradeFn = useServerFn(createTrade);
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState(
    signal.suggested_position_size ? signal.suggested_position_size.toFixed(4) : "",
  );
  const [entry, setEntry] = useState(signal.entry.toFixed(4));
  const [slippage, setSlippage] = useState("0.02");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const trade = await createTradeFn({
        data: {
          pair: signal.symbol,
          side: signal.signal,
          entry_price: Number(entry),
          exit_price: null,
          size: Number(size),
          pnl: null,
          slippage: Number(slippage),
          opened_at: new Date().toISOString(),
          closed_at: null,
          signal_id: signal.id,
        },
      });
      toast.success("Trade logged");
      onTradeCreated?.(trade);
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to log trade");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="border-border bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle>Execute Trade</DialogTitle>
          <DialogDescription>
            Log a {signal.signal} position on {signal.symbol}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entry">Entry price</Label>
              <Input
                id="entry"
                type="number"
                step="any"
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="size">Size</Label>
              <Input
                id="size"
                type="number"
                step="any"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="slippage">Slippage %</Label>
            <Input
              id="slippage"
              type="number"
              step="any"
              value={slippage}
              onChange={(e) => setSlippage(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Logging…" : "Log trade"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
