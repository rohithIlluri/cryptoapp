import React, { useMemo, useState } from 'react';
import useAsync from '../../hooks/useAsync';
import { fetchNews } from '../../services/api';
import { formatTimeAgo } from '../../utils/formatters';

function NewsList({ items }) {
  return (
    <div className="grid cols-3">
      {items.map((a) => (
        <a key={a.id} className="card news-card" href={a.url} target="_blank" rel="noreferrer">
          {a.image && <img className="media media-lg" src={a.image} alt="" onError={(e)=>{ e.currentTarget.style.display='none'; }} />}
          <div className="card-title line-clamp-2">{a.title}</div>
          <div className="news-meta">{a.source} · {formatTimeAgo(typeof a.time === 'number' ? a.time : Math.floor(new Date(a.time).getTime()/1000))}</div>
          {a.body && <div className="muted line-clamp-3">{a.body}</div>}
        </a>
      ))}
    </div>
  );
}

const MemoNewsList = React.memo(NewsList);

export default function News() {
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
          <MemoNewsList items={filtered} />
          <div className="row" style={{ justifyContent: 'center', marginTop: 12 }}>
            <button className="btn" onClick={() => setLimit((n) => n + 9)}>Load more</button>
          </div>
        </>
      )}
    </div>
  );
}

