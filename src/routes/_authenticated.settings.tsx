import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { getUserSettings, upsertUserSettings } from "@/lib/settings.functions";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { UserSettings } from "@/lib/lst-types";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — LST" },
      { name: "description", content: "Configure your LST trading parameters." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const fetchSettings = useServerFn(getUserSettings);
  const saveSettings = useServerFn(upsertUserSettings);

  const { data: settings } = useQuery({
    queryKey: ["userSettings"],
    queryFn: () => fetchSettings(),
  });

  const [form, setForm] = useState<Partial<UserSettings>>({
    account_balance: 10000,
    risk_pct_per_trade: 0.01,
    daily_loss_limit_pct: 0.03,
    taker_fee_pct: 0.0005,
    slippage_estimate_pct: 0.0003,
    auto_accept_min_score: 75,
    max_open_positions: 3,
    enable_sound_alerts: true,
    enable_telegram_alerts: false,
  });

  useEffect(() => {
    if (settings) {
      setForm(settings);
    }
  }, [settings]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await saveSettings({ data: form as UserSettings });
      queryClient.invalidateQueries({ queryKey: ["userSettings"] });
      toast.success("Settings saved.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save settings");
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.navigate({ to: "/auth/login" });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold tracking-tight">LST Terminal</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Dashboard
            </Link>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl p-6">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Trading Settings</CardTitle>
            <CardDescription>
              These values are used to compute position sizing, cost-adjusted R:R, and
              daily risk limits.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="account_balance">Account balance (USD)</Label>
                  <Input
                    id="account_balance"
                    type="number"
                    value={form.account_balance ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, account_balance: parseFloat(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="risk_pct_per_trade">Risk per trade (%)</Label>
                  <Input
                    id="risk_pct_per_trade"
                    type="number"
                    step="0.001"
                    value={((form.risk_pct_per_trade ?? 0) * 100).toFixed(2)}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        risk_pct_per_trade: parseFloat(e.target.value) / 100,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="daily_loss_limit_pct">Daily loss limit (%)</Label>
                  <Input
                    id="daily_loss_limit_pct"
                    type="number"
                    step="0.001"
                    value={((form.daily_loss_limit_pct ?? 0) * 100).toFixed(2)}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        daily_loss_limit_pct: parseFloat(e.target.value) / 100,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taker_fee_pct">Taker fee (%)</Label>
                  <Input
                    id="taker_fee_pct"
                    type="number"
                    step="0.0001"
                    value={((form.taker_fee_pct ?? 0) * 100).toFixed(4)}
                    onChange={(e) =>
                      setForm({ ...form, taker_fee_pct: parseFloat(e.target.value) / 100 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slippage_estimate_pct">Slippage estimate (%)</Label>
                  <Input
                    id="slippage_estimate_pct"
                    type="number"
                    step="0.0001"
                    value={((form.slippage_estimate_pct ?? 0) * 100).toFixed(4)}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        slippage_estimate_pct: parseFloat(e.target.value) / 100,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="auto_accept_min_score">Auto-accept min score</Label>
                  <Input
                    id="auto_accept_min_score"
                    type="number"
                    value={form.auto_accept_min_score ?? ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        auto_accept_min_score: parseInt(e.target.value, 10),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_open_positions">Max open positions</Label>
                  <Input
                    id="max_open_positions"
                    type="number"
                    value={form.max_open_positions ?? ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        max_open_positions: parseInt(e.target.value, 10),
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-4 rounded-md bg-muted p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Sound alerts</p>
                    <p className="text-sm text-muted-foreground">
                      Play a sound when a new signal arrives.
                    </p>
                  </div>
                  <Switch
                    checked={form.enable_sound_alerts ?? false}
                    onCheckedChange={(checked) =>
                      setForm({ ...form, enable_sound_alerts: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Telegram alerts</p>
                    <p className="text-sm text-muted-foreground">
                      Forward high-confluence signals to Telegram (configure bot later).
                    </p>
                  </div>
                  <Switch
                    checked={form.enable_telegram_alerts ?? false}
                    onCheckedChange={(checked) =>
                      setForm({ ...form, enable_telegram_alerts: checked })
                    }
                  />
                </div>
              </div>

              <Button type="submit" className="w-full md:w-auto">
                Save settings
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
