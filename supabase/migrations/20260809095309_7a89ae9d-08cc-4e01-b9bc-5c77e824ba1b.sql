CREATE TABLE public.user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_balance numeric DEFAULT NULL,
  risk_pct_per_trade numeric DEFAULT 0.01,
  daily_loss_limit_pct numeric DEFAULT 0.03,
  taker_fee_pct numeric DEFAULT NULL,
  slippage_estimate_pct numeric DEFAULT NULL,
  max_trades_per_day integer DEFAULT 20,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_settings TO authenticated;
GRANT ALL ON public.user_settings TO service_role;

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own settings"
  ON public.user_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON public.user_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON public.user_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own settings"
  ON public.user_settings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE public.qce_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol text NOT NULL,
  timeframe text NOT NULL,
  signal text NOT NULL CHECK (signal IN ('LONG', 'SHORT')),
  type text NOT NULL CHECK (type IN ('STANDARD', 'DIAMOND')),
  price numeric NOT NULL,
  entry numeric NOT NULL,
  sl numeric NOT NULL,
  tp1 numeric NOT NULL,
  tp2 numeric NOT NULL,
  tp3 numeric NOT NULL,
  raw_score integer NOT NULL CHECK (raw_score >= 0 AND raw_score <= 100),
  confluence_score integer NOT NULL CHECK (confluence_score >= 0 AND confluence_score <= 100),
  orderbook_agreement text NOT NULL CHECK (orderbook_agreement IN ('AGREE', 'CONFLICT', 'NEUTRAL')),
  regime_state text NOT NULL CHECK (regime_state IN ('TRENDING', 'RANGING')),
  liquidity_state text NOT NULL CHECK (liquidity_state IN ('NORMAL', 'LOW')),
  correlation_flag boolean NOT NULL DEFAULT false,
  cost_adjusted_rr numeric DEFAULT NULL,
  suggested_position_size numeric DEFAULT NULL,
  atr14 numeric NOT NULL,
  adx14 numeric NOT NULL,
  volume_ratio numeric NOT NULL,
  processed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.qce_signals TO authenticated;
GRANT ALL ON public.qce_signals TO service_role;

ALTER TABLE public.qce_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own signals"
  ON public.qce_signals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert signals"
  ON public.qce_signals
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own signals"
  ON public.qce_signals
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own signals"
  ON public.qce_signals
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE public.trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pair text NOT NULL,
  side text NOT NULL CHECK (side IN ('LONG', 'SHORT')),
  entry_price numeric NOT NULL,
  exit_price numeric DEFAULT NULL,
  size numeric NOT NULL,
  pnl numeric DEFAULT NULL,
  slippage numeric DEFAULT NULL,
  opened_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz DEFAULT NULL,
  signal_id uuid DEFAULT NULL REFERENCES public.qce_signals(id) ON DELETE SET NULL
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.trades TO authenticated;
GRANT ALL ON public.trades TO service_role;

ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own trades"
  ON public.trades
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trades"
  ON public.trades
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trades"
  ON public.trades
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own trades"
  ON public.trades
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE public.bot_rankings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bot_name text NOT NULL,
  timeframe text NOT NULL,
  win_rate numeric NOT NULL,
  avg_yield numeric NOT NULL,
  volume_tier text NOT NULL,
  strategy_summary text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.bot_rankings TO authenticated;
GRANT ALL ON public.bot_rankings TO service_role;

ALTER TABLE public.bot_rankings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own bot rankings"
  ON public.bot_rankings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own bot rankings"
  ON public.bot_rankings
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.liquidation_clusters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pair text NOT NULL,
  size_bucket text NOT NULL CHECK (size_bucket IN ('100K', '500K', '1M')),
  price_level numeric NOT NULL,
  volume numeric NOT NULL,
  timestamp timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.liquidation_clusters TO authenticated;
GRANT ALL ON public.liquidation_clusters TO service_role;

ALTER TABLE public.liquidation_clusters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read liquidation clusters"
  ON public.liquidation_clusters
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage liquidation clusters"
  ON public.liquidation_clusters
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE TABLE public.data_source_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_name text NOT NULL UNIQUE,
  layer text NOT NULL CHECK (layer IN ('L1', 'L2')),
  status text NOT NULL CHECK (status IN ('ONLINE', 'DEGRADED', 'OFFLINE')),
  last_updated timestamptz NOT NULL DEFAULT now(),
  latency_ms integer DEFAULT NULL,
  error_message text DEFAULT NULL
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.data_source_status TO authenticated;
GRANT ALL ON public.data_source_status TO service_role;

ALTER TABLE public.data_source_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read data source status"
  ON public.data_source_status
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage data source status"
  ON public.data_source_status
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.qce_signals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trades;
ALTER PUBLICATION supabase_realtime ADD TABLE public.data_source_status;
ALTER PUBLICATION supabase_realtime ADD TABLE public.liquidation_clusters;

CREATE OR REPLACE FUNCTION public.daily_realized_pnl(_user_id uuid)
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(pnl), 0)
  FROM public.trades
  WHERE user_id = _user_id
    AND pnl IS NOT NULL
    AND closed_at >= DATE_TRUNC('day', now());
$$;

CREATE OR REPLACE FUNCTION public.trades_today(_user_id uuid)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)
  FROM public.trades
  WHERE user_id = _user_id
    AND opened_at >= DATE_TRUNC('day', now());
$$;

CREATE OR REPLACE FUNCTION public.consecutive_losing_trades(_user_id uuid, _limit int DEFAULT 3)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH ordered AS (
    SELECT pnl,
           ROW_NUMBER() OVER (ORDER BY closed_at DESC) AS rn
    FROM public.trades
    WHERE user_id = _user_id
      AND closed_at IS NOT NULL
    ORDER BY closed_at DESC
    LIMIT _limit
  )
  SELECT COUNT(*)
  FROM ordered
  WHERE rn <= _limit AND pnl < 0;
$$;
