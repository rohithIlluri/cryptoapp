import React, { useEffect, useMemo, useState } from 'react';
import useAsync from '../../hooks/useAsync';
import { fetchCoins } from '../../services/api';
import Sparkline from '../charts/Sparkline';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatUSD, formatPct } from '../../utils/formatters';

export default function Coins({ onSelect }) {
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
          <input className="input" placeholder="Search name or symbol…" value={query} onChange={(e)=>setQuery(e.target.value)} style={{ width: 260 }} />
          <select className="input" value={sort} onChange={(e)=>setSort(e.target.value)} style={{ width: 200 }}>
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
        <div className="table-wrap">
        <table className="table" role="table" aria-label="All coins">
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
              <tr key={c.id} role="row">
                <td>
                  <button className="btn ghost" onClick={() => toggleWatch(c.id)} title="Watchlist">
                    {watchlist.includes(c.id) ? '★' : '☆'}
                  </button>
                </td>
                <td className="row" onClick={() => onSelect(c.id)} style={{ cursor: 'pointer' }}>
                  <img alt={c.symbol} src={c.image} width={22} height={22} style={{ borderRadius: 4 }} />
                  <span className="truncate" style={{ maxWidth: 220 }}>{c.name}</span>
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
        </div>
      )}
    </div>
  );
}

