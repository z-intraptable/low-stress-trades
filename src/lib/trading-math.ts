import type { SignalSide, UserSettings } from "./lst-types";

export function computeAtrBasedLevels(price: number, atr: number, side: SignalSide) {
  const multiplier = side === "LONG" ? 1 : -1;
  return {
    entry: price,
    sl: price - 1.5 * atr * multiplier,
    tp1: price + 1.0 * atr * multiplier,
    tp2: price + 2.0 * atr * multiplier,
    tp3: price + 3.0 * atr * multiplier,
  };
}

export function computeConfluenceScore(
  rawScore: number,
  adx: number,
  orderbookAgreement: "AGREE" | "CONFLICT" | "NEUTRAL",
  multiTimeframeBoost: boolean,
) {
  let score = rawScore;
  if (adx < 20) score -= 15;
  if (orderbookAgreement === "AGREE") score += 10;
  if (orderbookAgreement === "CONFLICT") score -= 15;
  if (multiTimeframeBoost) score += 5;
  return Math.max(0, Math.min(100, score));
}

export function computeRegimeState(adx: number): "TRENDING" | "RANGING" {
  if (adx > 25) return "TRENDING";
  return "RANGING";
}

export function computeLiquidityState(volumeRatio: number): "NORMAL" | "LOW" {
  return volumeRatio < 0.4 ? "LOW" : "NORMAL";
}

export function computeCostAdjustedRR(
  entry: number,
  sl: number,
  tp1: number,
  takerFeePct: number,
  slippageEstimatePct: number,
): number {
  const roundTripCost = 2 * (takerFeePct + slippageEstimatePct);
  const tpDistance = Math.abs(tp1 - entry);
  const slDistance = Math.abs(entry - sl);
  if (slDistance + roundTripCost === 0) return 0;
  return (tpDistance - roundTripCost) / (slDistance + roundTripCost);
}

export function computePositionSize(
  accountBalance: number,
  riskPct: number,
  entry: number,
  sl: number,
): number {
  const riskAmount = accountBalance * riskPct;
  const slDistance = Math.abs(entry - sl);
  if (slDistance === 0) return 0;
  return riskAmount / slDistance;
}

export function canSuggestNewEntry(
  dailyRealizedPnl: number,
  accountBalance: number,
  dailyLossLimitPct: number,
): boolean {
  const limit = -accountBalance * dailyLossLimitPct;
  return dailyRealizedPnl > limit;
}

export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number | null | undefined, digits = 2): string {
  if (value == null) return "—";
  return `${(value * 100).toFixed(digits)}%`;
}

export function formatNumber(value: number | null | undefined, digits = 2): string {
  if (value == null) return "—";
  return value.toFixed(digits);
}

export function settingsAreComplete(settings: Partial<UserSettings>): boolean {
  return (
    settings.account_balance != null &&
    settings.risk_pct_per_trade != null &&
    settings.taker_fee_pct != null &&
    settings.slippage_estimate_pct != null
  );
}
