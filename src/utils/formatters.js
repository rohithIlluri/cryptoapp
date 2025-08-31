export function formatUSD(value) {
  if (value == null || Number.isNaN(value)) return '-';
  const abs = Math.abs(value);
  if (abs >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  return `$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export function formatPct(value) {
  if (value == null || Number.isNaN(value)) return '-';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function formatTimeAgo(tsSeconds) {
  if (!tsSeconds) return '';
  const diff = Math.max(1, Math.floor((Date.now() - tsSeconds * 1000) / 1000));
  if (diff < 60) return `${diff}s ago`;
  const m = Math.floor(diff / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export const STABLE_SYMBOLS = new Set(['usdt','usdc','busd','dai','tusd','usdd','gusd','lusd','susd','frax','ustc','eurt','usdp','fei','mim']);
export function filterUsefulCoin(c) {
  if (!c) return false;
  const sym = (c.symbol || '').toLowerCase();
  if (STABLE_SYMBOLS.has(sym)) return false;
  if ((c.market_cap || 0) < 5_000_000) return false;
  return true;
}

