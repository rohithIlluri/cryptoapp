import React, { useEffect, useMemo, useState } from 'react';
import useAsync from '../../hooks/useAsync';
import { fetchCoinDetails, fetchCoinHistory } from '../../services/api';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, Tooltip, YAxis, XAxis, CartesianGrid } from 'recharts';
import { formatUSD, formatPct } from '../../utils/formatters';

export default function Details({ coinId }) {
  const { data, error, loading } = useAsync(async () => fetchCoinDetails(coinId), [coinId]);
  const [range, setRange] = useState('7');
  const [debouncedRange, setDebouncedRange] = useState('7');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedRange(range), 300);
    return () => clearTimeout(t);
  }, [range]);
  const samplingInterval = useMemo(() => (['30','90','180','365','max'].includes(debouncedRange) ? 'daily' : ''), [debouncedRange]);
  const { data: history, error: histErr, loading: histLoad } = useAsync(
    async () => fetchCoinHistory(coinId, debouncedRange, samplingInterval),
    [coinId, debouncedRange, samplingInterval]
  );
  if (!coinId) return null;
  const hasSeries = Array.isArray(history?.prices) && history.prices.length > 1;
  return (
    <div className="container">
      {loading ? (
        <div className="card skeleton" style={{ height: 160 }} />
      ) : error ? (
        <div className="error">{String(error.message || error)}</div>
      ) : (
        <div className="card">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div className="row">
              <img alt={data?.symbol} src={data?.image?.small} width={28} height={28} style={{ borderRadius: 6 }} />
              <div>
                <div className="card-title">{data?.name}</div>
                <div className="muted">{data?.symbol?.toUpperCase()}</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="card-title">{formatUSD(data?.market_data?.current_price?.usd)}</div>
              <span className={`chip ${data?.market_data?.price_change_percentage_24h >= 0 ? 'up' : 'down'}`}>
                {data?.market_data?.price_change_percentage_24h >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {formatPct(data?.market_data?.price_change_percentage_24h)}
              </span>
            </div>
          </div>

          <div className="grid cols-4" style={{ marginTop: 12 }}>
            {[
              { k: 'Market Cap', v: formatUSD(data?.market_data?.market_cap?.usd) },
              { k: '24h Volume', v: formatUSD(data?.market_data?.total_volume?.usd) },
              { k: 'Circulating Supply', v: (data?.market_data?.circulating_supply ? Intl.NumberFormat().format(Math.round(data.market_data.circulating_supply)) : '-') },
              { k: 'Max Supply', v: (data?.market_data?.max_supply ? Intl.NumberFormat().format(Math.round(data.market_data.max_supply)) : '-') },
            ].map((s)=> (
              <div className="card stat" key={s.k}>
                <div>
                  <div className="muted">{s.k}</div>
                  <div className="card-title">{s.v}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="toolbar" style={{ marginTop: 12 }}>
            <div className="muted">Price (USD)</div>
            <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
              {['1','7','30','90','180','365','max'].map((r) => (
                <button key={r} className={`tab ${range === r ? 'active' : ''}`} onClick={() => setRange(r)}>{r === '1' ? '1D' : r === '7' ? '7D' : r === '30' ? '1M' : r === '90' ? '3M' : r === '180' ? '6M' : r === '365' ? '1Y' : 'MAX'}</button>
              ))}
            </div>
          </div>

          <div style={{ width: '100%', height: 320 }}>
            {histLoad ? (
              <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: 8 }} />
            ) : histErr ? (
              <div className="error">{String(histErr.message || histErr)}</div>
            ) : !hasSeries ? (
              <div className="muted" style={{ padding: 12 }}>No chart data available for this period.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={(history?.prices || []).map((p) => ({ t: p[0], y: p[1] }))}
                  margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
                >
                  <CartesianGrid stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="t" tickFormatter={(t) => {
                    const d = new Date(t);
                    return (debouncedRange === '1' || debouncedRange === '7') ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : d.toLocaleDateString();
                  }} minTickGap={56} stroke="#9ca3af" />
                  <YAxis tickFormatter={(v) => `$${Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 2 }).format(v)}`} width={64} stroke="#9ca3af" />
                  <Tooltip
                    labelFormatter={(t) => new Date(t).toLocaleString()}
                    formatter={(v) => [formatUSD(v), 'Price']}
                    contentStyle={{ borderRadius: 8 }}
                  />
                  <Line type="monotone" dataKey="y" stroke="#111827" dot={false} strokeWidth={1.8} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {data?.description?.en && (
            <p className="muted" style={{ marginTop: 12 }} dangerouslySetInnerHTML={{ __html: data.description.en.slice(0, 600) + '…' }} />
          )}
          <div className="row" style={{ justifyContent: 'flex-start', gap: 8, marginTop: 12 }}>
            {data?.links?.homepage?.[0] && <a className="btn" href={data.links.homepage[0]} target="_blank" rel="noreferrer">Website</a>}
            {data?.links?.subreddit_url && <a className="btn" href={data.links.subreddit_url} target="_blank" rel="noreferrer">Reddit</a>}
            {data?.links?.repos_url?.github?.[0] && <a className="btn" href={data.links.repos_url.github[0]} target="_blank" rel="noreferrer">GitHub</a>}
          </div>
        </div>
      )}
    </div>
  );
}

