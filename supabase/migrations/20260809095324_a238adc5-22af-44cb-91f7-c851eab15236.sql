REVOKE ALL ON FUNCTION public.daily_realized_pnl(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.daily_realized_pnl(uuid) FROM authenticated;
REVOKE ALL ON FUNCTION public.daily_realized_pnl(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.daily_realized_pnl(uuid) TO service_role;

REVOKE ALL ON FUNCTION public.trades_today(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.trades_today(uuid) FROM authenticated;
REVOKE ALL ON FUNCTION public.trades_today(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.trades_today(uuid) TO service_role;

REVOKE ALL ON FUNCTION public.consecutive_losing_trades(uuid, int) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.consecutive_losing_trades(uuid, int) FROM authenticated;
REVOKE ALL ON FUNCTION public.consecutive_losing_trades(uuid, int) FROM anon;
GRANT EXECUTE ON FUNCTION public.consecutive_losing_trades(uuid, int) TO service_role;