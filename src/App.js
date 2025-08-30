import React, { useEffect, useMemo, useState } from 'react';
import { fetchCoins, fetchGlobalStats, fetchNews, fetchCoinDetails, fetchCoinHistory } from './services/api';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, Tooltip, YAxis, XAxis, CartesianGrid } from 'recharts';

function formatUSD(value) {
  if (value == null || Number.isNaN(value)) return '-';
  const abs = Math.abs(value);
  if (abs >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  return `$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function formatPct(value) {
  if (value == null || Number.isNaN(value)) return '-';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

// Heuristic stablecoin filter and usefulness screening
const STABLE_SYMBOLS = new Set(['usdt','usdc','busd','dai','tusd','usdd','gusd','lusd','susd','frax','ustc','eurt','usdp','fei','mim']);
function filterUsefulCoin(c) {
  if (!c) return false;
  const sym = (c.symbol || '').toLowerCase();
  if (STABLE_SYMBOLS.has(sym)) return false;
  if ((c.market_cap || 0) < 5_000_000) return false; // tiny caps are noisy
  return true;
}

function useAsync(asyncFn, deps = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    asyncFn()
      .then((d) => { if (!cancelled) setData(d); })
      .catch((e) => { if (!cancelled) setError(e); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  return { data, error, loading };
}

function Header({ active, onChange }) {
  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'coins', label: 'Coins' },
    { key: 'news', label: 'News' },
  ];
  return (
    <header className="header">
      <div className="header-inner container">
        <div className="brand">Cryptoverse</div>
        <nav className="tabs">
          {tabs.map((t) => (
            <button key={t.key} className={`tab ${active === t.key ? 'active' : ''}`} onClick={() => onChange(t.key)}>
              {t.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}

function Sparkline({ data, stroke = '#111827' }) {
  if (!Array.isArray(data) || data.length === 0) return <div className="skeleton" style={{ height: 40 }} />;
  const points = data.map((y, i) => ({ i, y }));
  return (
    <div style={{ width: 140, height: 40 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
          <Line type="monotone" dataKey="y" stroke={stroke} dot={false} strokeWidth={1.5} />
          <Tooltip formatter={(value) => formatUSD(value)} labelFormatter={() => ''} contentStyle={{ borderRadius: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function formatTimeAgo(tsSeconds) {
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

function Overview({ onSelectCoin }) {
  const { data: stats, error: statsErr, loading: statsLoad } = useAsync(async () => fetchGlobalStats(), []);
  const { data: coins, error: coinsErr, loading: coinsLoad } = useAsync(async () => fetchCoins(1, 50), []);

        return (
    <div className="container">
      {statsLoad ? (
        <div className="grid cols-4">
          {Array.from({ length: 4 }).map((_, i) => <div className="card skeleton" key={i} style={{ height: 88 }} />)}
        </div>
      ) : statsErr ? (
        <div className="error">{String(statsErr.message || statsErr)}</div>
      ) : (
        <div className="grid cols-4">
          {[{ label: 'Active Cryptos', value: stats?.data?.active_cryptocurrencies },
            { label: 'Markets', value: stats?.data?.markets },
            { label: 'Total Market Cap', value: stats?.data?.total_market_cap?.usd, format: formatUSD },
            { label: '24h Volume', value: stats?.data?.total_volume?.usd, format: formatUSD }]
            .map((s) => (
              <div className="card stat" key={s.label}>
                <div>
                  <div className="muted">{s.label}</div>
                  <div className="card-title">{s.format ? s.format(s.value) : (s.value ?? '-')}</div>
                </div>
              </div>
            ))}
        </div>
      )}

      <div className="row" style={{ justifyContent: 'space-between', marginTop: 16 }}>
        <h2 className="card-title" style={{ margin: 0 }}>Top Movers</h2>
        <button className="tab" onClick={() => {
          const filtered = (coins||[]).filter(filterUsefulCoin);
          const pick = filtered[Math.floor(Math.random()*Math.max(1, filtered.length||1))];
          if (pick) onSelectCoin(pick.id);
        }}>Random Coin</button>
      </div>

      {coinsLoad ? (
        <div className="grid cols-4" style={{ marginTop: 8 }}>
          {Array.from({ length: 8 }).map((_, i) => <div className="card skeleton" key={i} style={{ height: 120 }} />)}
        </div>
      ) : coinsErr ? (
        <div className="error">{String(coinsErr.message || coinsErr)}</div>
      ) : (
        <div className="grid cols-4" style={{ marginTop: 8 }}>
          <div className="card" style={{ gridColumn: 'span 2' }}>
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
              <h3 className="card-title" style={{ margin: 0 }}>Top Gainers (24h)</h3>
            </div>
            <div className="grid cols-3">
              {[...(coins || [])]
                .filter(filterUsefulCoin)
                .filter((c) => typeof c.price_change_percentage_24h === 'number')
                .sort((a, b) => (b.price_change_percentage_24h) - (a.price_change_percentage_24h))
                .slice(0, 6)
                .map((c) => (
                  <button key={c.id} className="card mini-card" onClick={() => onSelectCoin(c.id)} style={{ textAlign: 'left' }}>
                    <div className="mini-header">
                      <img alt={c.symbol} src={c.image} width={28} height={28} style={{ borderRadius: 6 }} />
                      <div className="mini-title">
                        <div className="card-title line-clamp-1">{c.name}</div>
                        <div className="muted mini-symbol">{c.symbol.toUpperCase()}</div>
                      </div>
                      <div style={{ marginLeft: 'auto' }} className="mini-price card-title">{formatUSD(c.current_price)}</div>
                    </div>
                    <div className="spark">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={(c.sparkline_in_7d?.price || []).map((y, i) => ({ i, y }))} margin={{ top: 2, right: 2, bottom: 0, left: 2 }}>
                          <Line type="monotone" dataKey="y" stroke={'#059669'} dot={false} strokeWidth={1.2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div>
                      <span className={`chip up`}>
                        <ArrowUpRight size={14} />
                        {formatPct(c.price_change_percentage_24h)}
                      </span>
                    </div>
                  </button>
                ))}
            </div>
          </div>
          <div className="card" style={{ gridColumn: 'span 2' }}>
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
              <h3 className="card-title" style={{ margin: 0 }}>Top Losers (24h)</h3>
            </div>
            <div className="grid cols-3">
              {[...(coins || [])]
                .filter(filterUsefulCoin)
                .filter((c) => typeof c.price_change_percentage_24h === 'number')
                .sort((a, b) => (a.price_change_percentage_24h) - (b.price_change_percentage_24h))
                .slice(0, 6)
                .map((c) => (
                  <button key={c.id} className="card mini-card" onClick={() => onSelectCoin(c.id)} style={{ textAlign: 'left' }}>
                    <div className="mini-header">
                      <img alt={c.symbol} src={c.image} width={28} height={28} style={{ borderRadius: 6 }} />
                      <div className="mini-title">
                        <div className="card-title line-clamp-1">{c.name}</div>
                        <div className="muted mini-symbol">{c.symbol.toUpperCase()}</div>
                      </div>
                      <div style={{ marginLeft: 'auto' }} className="mini-price card-title">{formatUSD(c.current_price)}</div>
                    </div>
                    <div className="spark">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={(c.sparkline_in_7d?.price || []).map((y, i) => ({ i, y }))} margin={{ top: 2, right: 2, bottom: 0, left: 2 }}>
                          <Line type="monotone" dataKey="y" stroke={'#dc2626'} dot={false} strokeWidth={1.2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div>
                      <span className={`chip down`}>
                        <ArrowDownRight size={14} />
                        {formatPct(c.price_change_percentage_24h)}
                      </span>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
      <div className="row" style={{ justifyContent: 'space-between', marginTop: 16 }}>
        <h2 className="card-title" style={{ margin: 0 }}>Latest News</h2>
      </div>
      <DashboardNews />
          </div>
        );
}

function Coins({ onSelect }) {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('market_cap_desc');
  const [watchlist, setWatchlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem('watchlist') || '[]'); } catch { return []; }
  });
  const { data, error, loading } = useAsync(async () => fetchCoins(page, 50), [page]);

  useEffect(() => { localStorage.setItem('watchlist', JSON.stringify(watchlist)); }, [watchlist]);

  const filtered = useMemo(() => {
    let rows = data || [];
    if (query) {
      const q = query.toLowerCase();
      rows = rows.filter((c) => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q));
    }
    switch (sort) {
      case 'price_desc': rows = [...rows].sort((a,b)=>b.current_price-a.current_price); break;
      case 'price_asc': rows = [...rows].sort((a,b)=>a.current_price-b.current_price); break;
      case 'change_desc': rows = [...rows].sort((a,b)=> (b.price_change_percentage_24h||-Infinity) - (a.price_change_percentage_24h||-Infinity)); break;
      case 'change_asc': rows = [...rows].sort((a,b)=> (a.price_change_percentage_24h||Infinity) - (b.price_change_percentage_24h||Infinity)); break;
      default: rows = [...rows].sort((a,b)=> (b.market_cap||0)-(a.market_cap||0));
    }
    return rows;
  }, [data, query, sort]);

  const toggleWatch = (id) => {
    setWatchlist((prev) => prev.includes(id) ? prev.filter((x)=>x!==id) : [...prev, id]);
  };

  return (
    <div className="container">
      <div className="toolbar" style={{ gap: 12 }}>
        <h2 className="card-title" style={{ margin: 0 }}>All Coins</h2>
        <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
          <input className="input" placeholder="Search name or symbol…" value={query} onChange={(e)=>setQuery(e.target.value)} style={{ width: 220 }} />
          <select className="input" value={sort} onChange={(e)=>setSort(e.target.value)} style={{ width: 180 }}>
            <option value="market_cap_desc">Market Cap desc</option>
            <option value="price_desc">Price desc</option>
            <option value="price_asc">Price asc</option>
            <option value="change_desc">24h change desc</option>
            <option value="change_asc">24h change asc</option>
          </select>
          <button className="btn" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
          <div className="muted">Page {page}</div>
          <button className="btn" onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      </div>
      {loading ? (
        <div className="grid cols-4">
          {Array.from({ length: 12 }).map((_, i) => <div className="card skeleton" key={i} style={{ height: 88 }} />)}
        </div>
      ) : error ? (
        <div className="error">{String(error.message || error)}</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 36 }}></th>
              <th>Name</th>
              <th>Price</th>
              <th>24h</th>
              <th>7d</th>
              <th>Market Cap</th>
            </tr>
          </thead>
          <tbody>
            {filtered?.map((c) => (
              <tr key={c.id}>
                <td>
                  <button className="btn ghost" onClick={() => toggleWatch(c.id)} title="Watchlist">
                    {watchlist.includes(c.id) ? '★' : '☆'}
                  </button>
                </td>
                <td className="row" onClick={() => onSelect(c.id)} style={{ cursor: 'pointer' }}>
                  <img alt={c.symbol} src={c.image} width={22} height={22} style={{ borderRadius: 4 }} />
                  {c.name}
                </td>
                <td>{formatUSD(c.current_price)}</td>
                <td>
                  <span className={`chip ${c.price_change_percentage_24h >= 0 ? 'up' : 'down'}`}>
                    {c.price_change_percentage_24h >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {formatPct(c.price_change_percentage_24h)}
                  </span>
                </td>
                <td>
                  <Sparkline data={c.sparkline_in_7d?.price || []} stroke={c.price_change_percentage_24h >= 0 ? '#059669' : '#dc2626'} />
                </td>
                <td>{formatUSD(c.market_cap)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function News() {
  const { data, error, loading } = useAsync(async () => fetchNews(), []);
  const [q, setQ] = useState('');
  const [source, setSource] = useState('all');
  const [limit, setLimit] = useState(12);
  const articles = useMemo(() => (data?.Data || data?.data || []).map((a) => ({
    id: a.id || a.url,
    url: a.url || a.guid,
    title: a.title || a.headline || 'Untitled',
    body: a.body || a.description || '',
    image: a.imageurl ? (a.imageurl.startsWith('http') ? a.imageurl : `https://www.cryptocompare.com${a.imageurl}`) : null,
    source: a.source || a.source_info?.name || 'Unknown',
    time: a.published_on || a.pubDate || a.createdOn || Date.now()/1000,
  })), [data]);

  const sources = useMemo(() => ['all', ...Array.from(new Set(articles.map(a => a.source)))], [articles]);

  const filtered = useMemo(() => {
    let rows = articles;
    if (q) {
      const s = q.toLowerCase();
      rows = rows.filter(a => a.title.toLowerCase().includes(s) || a.body.toLowerCase().includes(s));
    }
    if (source !== 'all') rows = rows.filter(a => a.source === source);
    rows = [...rows].sort((a,b) => (b.time||0) - (a.time||0));
    return rows.slice(0, limit);
  }, [articles, q, source, limit]);

  return (
    <div className="container">
      <div className="toolbar">
        <h2 className="card-title" style={{ margin: 0 }}>News</h2>
        <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
          <input className="input" placeholder="Search news…" value={q} onChange={(e)=>setQ(e.target.value)} style={{ width: 260 }} />
          <select className="input" value={source} onChange={(e)=>setSource(e.target.value)} style={{ width: 200 }}>
            {sources.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      {loading ? (
        <div className="grid cols-3">
          {Array.from({ length: 6 }).map((_, i) => <div className="card skeleton" key={i} style={{ height: 200 }} />)}
        </div>
      ) : error ? (
        <div className="error">{String(error.message || error)}</div>
      ) : filtered.length === 0 ? (
        <div className="card">No articles match your filters.</div>
      ) : (
        <>
          <div className="grid cols-3">
            {filtered.map((a) => (
              <a key={a.id} className="card news-card" href={a.url} target="_blank" rel="noreferrer">
                {a.image && <img className="media media-lg" src={a.image} alt="" onError={(e)=>{ e.currentTarget.style.display='none'; }} />}
                <div className="card-title line-clamp-2">{a.title}</div>
                <div className="news-meta">{a.source} · {formatTimeAgo(typeof a.time === 'number' ? a.time : Math.floor(new Date(a.time).getTime()/1000))}</div>
                {a.body && <div className="muted line-clamp-3">{a.body}</div>}
              </a>
            ))}
          </div>
          <div className="row" style={{ justifyContent: 'center', marginTop: 12 }}>
            <button className="btn" onClick={() => setLimit((n) => n + 9)}>Load more</button>
          </div>
        </>
      )}
    </div>
  );
}

function DashboardNews() {
  const { data, error, loading } = useAsync(async () => fetchNews(), []);
  const articles = useMemo(() => (data?.Data || data?.data || []).slice(0, 6), [data]);
  if (loading) {
    return (
      <div className="grid cols-3">
        {Array.from({ length: 6 }).map((_, i) => <div className="card skeleton" key={i} style={{ height: 140 }} />)}
      </div>
    );
  }
  if (error) return <div className="error">{String(error.message || error)}</div>;
  return (
    <div className="grid cols-3">
      {articles.map((a) => {
        const img = a.imageurl ? (a.imageurl.startsWith('http') ? a.imageurl : `https://www.cryptocompare.com${a.imageurl}`) : null;
        const source = a.source || a.source_info?.name;
        const time = a.published_on || a.pubDate || a.createdOn;
        return (
          <a key={a.id || a.url} className="card news-card" href={a.url || a.guid} target="_blank" rel="noreferrer">
            {img && <img className="media" src={img} alt="" onError={(e)=>{ e.currentTarget.style.display='none'; }} />}
            <div className="card-title line-clamp-2">{a.title}</div>
            <div className="news-meta">{source} · {formatTimeAgo(typeof time === 'number' ? time : Math.floor(new Date(time).getTime()/1000))}</div>
          </a>
        );
      })}
    </div>
  );
}

function Details({ coinId }) {
  const { data, error, loading } = useAsync(async () => fetchCoinDetails(coinId), [coinId]);
  const [range, setRange] = useState('7');
  const [interval, setInterval] = useState('');
  useEffect(() => {
    // CoinGecko market_chart only supports interval=daily (no hourly). Use daily for >= 30d, omit otherwise.
    if (range === '30' || range === '90' || range === '180' || range === '365' || range === 'max') setInterval('daily');
    else setInterval('');
  }, [range]);
  const { data: history, error: histErr, loading: histLoad } = useAsync(
    async () => fetchCoinHistory(coinId, range, interval),
    [coinId, range, interval]
  );
  if (!coinId) return null;
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
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={(history?.prices || []).map((p) => ({ t: p[0], y: p[1] }))}
                  margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
                >
                  <CartesianGrid stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="t" tickFormatter={(t) => {
                    const d = new Date(t);
                    return (range === '1' || range === '7') ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : d.toLocaleDateString();
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

export default function App() {
  const [tab, setTab] = useState('overview');
  const [detailsId, setDetailsId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setShowModal(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const openDetails = (id) => { setDetailsId(id); setShowModal(true); };

  return (
    <div className="app">
      <Header active={tab} onChange={(t) => { setTab(t); }} />
      <main style={{ padding: 20 }}>
        {tab === 'overview' && <Overview onSelectCoin={(id) => openDetails(id)} />}
        {tab === 'coins' && <Coins onSelect={(id) => openDetails(id)} />}
        {tab === 'news' && <News />}
      </main>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="row" style={{ justifyContent: 'space-between', padding: 14, borderBottom: '1px solid var(--border)', background: '#fff', position: 'sticky', top: 0, zIndex: 1 }}>
              <div className="card-title" style={{ margin: 0 }}>Coin Details</div>
              <button className="btn" onClick={() => setShowModal(false)}>Close</button>
            </div>
            <div style={{ padding: 18, background: '#fff' }}>
              <Details coinId={detailsId} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}