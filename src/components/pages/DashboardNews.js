import React, { useMemo } from 'react';
import useAsync from '../../hooks/useAsync';
import { fetchNews } from '../../services/api';
import { formatTimeAgo } from '../../utils/formatters';

export default function DashboardNews() {
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
    <div className="news-grid-dashboard">
      {articles.map((a) => {
        const img = a.imageurl ? (a.imageurl.startsWith('http') ? a.imageurl : `https://www.cryptocompare.com${a.imageurl}`) : null;
        const source = a.source || a.source_info?.name;
        const time = a.published_on || a.pubDate || a.createdOn;
        return (
          <a key={a.id || a.url} className="card news-card news-card-dashboard" href={a.url || a.guid} target="_blank" rel="noreferrer">
            {img && <img className="media" src={img} alt="" onError={(e)=>{ e.currentTarget.style.display='none'; }} />}
            <div className="card-title line-clamp-2">{a.title}</div>
            <div className="news-meta">{source} · {formatTimeAgo(typeof time === 'number' ? time : Math.floor(new Date(time).getTime()/1000))}</div>
          </a>
        );
      })}
    </div>
  );
}

