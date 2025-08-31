import React from 'react';
import useAsync from '../../hooks/useAsync';
import { fetchGlobalStats, fetchCoins } from '../../services/api';
import Sparkline from '../charts/Sparkline';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatUSD, formatPct, filterUsefulCoin } from '../../utils/formatters';

export default function Overview({ onSelectCoin }) {
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
                  <button key={c.id} className="card mini-card" onClick={() => onSelectCoin(c.id)} style={{ textAlign: 'left', overflow: 'hidden' }}>
                    <div className="mini-header min-w-0">
                      <img alt={c.symbol} src={c.image} width={28} height={28} style={{ borderRadius: 6 }} />
                      <div className="mini-title min-w-0">
                        <div className="card-title truncate" style={{ maxWidth: '6rem' }}>{c.symbol.toUpperCase()}</div>
                      </div>
                      <div style={{ marginLeft: 'auto' }} className="mini-price card-title">{formatUSD(c.current_price)}</div>
                    </div>
                    <div className="spark">
                      <Sparkline data={c.sparkline_in_7d?.price || []} stroke={'#059669'} />
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
                  <button key={c.id} className="card mini-card" onClick={() => onSelectCoin(c.id)} style={{ textAlign: 'left', overflow: 'hidden' }}>
                    <div className="mini-header">
                      <img alt={c.symbol} src={c.image} width={28} height={28} style={{ borderRadius: 6 }} />
                      <div className="mini-title">
                        <div className="card-title truncate" style={{ maxWidth: '6rem' }}>{c.symbol.toUpperCase()}</div>
                      </div>
                      <div style={{ marginLeft: 'auto' }} className="mini-price card-title">{formatUSD(c.current_price)}</div>
                    </div>
                    <div className="spark">
                      <Sparkline data={c.sparkline_in_7d?.price || []} stroke={'#dc2626'} />
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
    </div>
  );
}

