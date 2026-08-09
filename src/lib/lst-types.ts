export type SignalSide = "LONG" | "SHORT";
export type SignalType = "STANDARD" | "DIAMOND";
export type RegimeState = "TRENDING" | "RANGING";
export type LiquidityState = "NORMAL" | "LOW";
export type OrderbookAgreement = "AGREE" | "CONFLICT" | "NEUTRAL";
export type DataSourceStatus = "ONLINE" | "DEGRADED" | "OFFLINE";

export interface UserSettings {
  id: string;
  user_id: string;
  account_balance: number | null;
  risk_pct_per_trade: number;
  daily_loss_limit_pct: number;
  taker_fee_pct: number | null;
  slippage_estimate_pct: number | null;
  max_trades_per_day: number;
  created_at: string;
  updated_at: string;
}

export interface QceSignal {
  id: string;
  user_id: string;
  symbol: string;
  timeframe: string;
  signal: SignalSide;
  type: SignalType;
  price: number;
  entry: number;
  sl: number;
  tp1: number;
  tp2: number;
  tp3: number;
  raw_score: number;
  confluence_score: number;
  orderbook_agreement: OrderbookAgreement;
  regime_state: RegimeState;
  liquidity_state: LiquidityState;
  correlation_flag: boolean;
  cost_adjusted_rr: number | null;
  suggested_position_size: number | null;
  atr14: number;
  adx14: number;
  volume_ratio: number;
  processed: boolean;
  created_at: string;
}

export interface Trade {
  id: string;
  user_id: string;
  pair: string;
  side: SignalSide;
  entry_price: number;
  exit_price: number | null;
  size: number;
  pnl: number | null;
  slippage: number | null;
  opened_at: string;
  closed_at: string | null;
  signal_id: string | null;
}

export interface BotRanking {
  id: string;
  user_id: string;
  bot_name: string;
  timeframe: string;
  win_rate: number;
  avg_yield: number;
  volume_tier: string;
  strategy_summary: string;
  created_at: string;
  updated_at: string;
}

export interface LiquidationCluster {
  id: string;
  pair: string;
  size_bucket: "100K" | "500K" | "1M";
  price_level: number;
  volume: number;
  timestamp: string;
}

export interface DataSourceStatusRow {
  id: string;
  source_name: string;
  layer: "L1" | "L2";
  status: DataSourceStatus;
  last_updated: string;
  latency_ms: number | null;
  error_message: string | null;
}

export interface QceWebhookPayload {
  symbol: string;
  timeframe: string;
  signal: SignalSide;
  type: SignalType;
  price: number;
  score: number;
  secret: string;
}
