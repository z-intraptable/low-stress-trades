export interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  openTime: number;
  closeTime: number;
}

export async function fetchBinanceKlines(
  symbol: string,
  interval: string,
  limit = 50,
): Promise<Candle[]> {
  const pair = `${symbol.toUpperCase()}USDT`;
  const url = `https://api.binance.com/api/v3/klines?symbol=${pair}&interval=${interval}&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Binance API error: ${res.status} ${res.statusText}`);
  }
  const data = (await res.json()) as [
    number,
    string,
    string,
    string,
    string,
    string,
    number,
    string,
    number,
    string,
    string,
    string,
  ][];

  return data.map((k) => ({
    openTime: k[0],
    open: parseFloat(k[1]),
    high: parseFloat(k[2]),
    low: parseFloat(k[3]),
    close: parseFloat(k[4]),
    volume: parseFloat(k[5]),
    closeTime: k[6],
  }));
}

function wilderSmooth(values: number[], period: number): number[] {
  const result: number[] = [];
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    const value = values[i] ?? 0;
    sum += value;
    if (i === period - 1) {
      result.push(sum / period);
    } else if (i >= period) {
      const prevSmooth = result[result.length - 1] ?? 0;
      result.push((prevSmooth * (period - 1) + value) / period);
    }
  }
  return result;
}

export function computeATR(candles: Candle[], period = 14): number {
  if (candles.length < period + 1) return 0;
  const trs: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    const prev = candles[i - 1];
    const curr = candles[i];
    if (!prev || !curr) continue;
    const tr = Math.max(
      curr.high - curr.low,
      Math.abs(curr.high - prev.close),
      Math.abs(curr.low - prev.close),
    );
    trs.push(tr);
  }
  const smoothed = wilderSmooth(trs, period);
  return smoothed[smoothed.length - 1] ?? 0;
}

export function computeADX(candles: Candle[], period = 14): number {
  if (candles.length < period * 2 + 1) return 0;
  const plusDM: number[] = [];
  const minusDM: number[] = [];
  const trs: number[] = [];

  for (let i = 1; i < candles.length; i++) {
    const prev = candles[i - 1];
    const curr = candles[i];
    if (!prev || !curr) continue;
    const upMove = curr.high - prev.high;
    const downMove = prev.low - curr.low;
    plusDM.push(upMove > downMove && upMove > 0 ? upMove : 0);
    minusDM.push(downMove > upMove && downMove > 0 ? downMove : 0);
    trs.push(
      Math.max(
        curr.high - curr.low,
        Math.abs(curr.high - prev.close),
        Math.abs(curr.low - prev.close),
      ),
    );
  }

  const atr = wilderSmooth(trs, period);
  const plusDI = wilderSmooth(plusDM, period).map((v, i) => {
    const atrValue = atr[i] ?? 0;
    return atrValue ? (v / atrValue) * 100 : 0;
  });
  const minusDI = wilderSmooth(minusDM, period).map((v, i) => {
    const atrValue = atr[i] ?? 0;
    return atrValue ? (v / atrValue) * 100 : 0;
  });

  const dx: number[] = [];
  for (let i = 0; i < plusDI.length; i++) {
    const plus = plusDI[i] ?? 0;
    const minus = minusDI[i] ?? 0;
    const sum = plus + minus;
    dx.push(sum === 0 ? 0 : (Math.abs(plus - minus) / sum) * 100);
  }

  const adx = wilderSmooth(dx, period);
  return adx[adx.length - 1] ?? 0;
}

export function computeVolumeRatio(candles: Candle[]): number {
  if (candles.length < 2) return 1;
  const current = candles[candles.length - 1]?.volume ?? 0;
  const avg = candles.reduce((sum, c) => sum + c.volume, 0) / candles.length;
  if (avg === 0) return 1;
  return current / avg;
}
