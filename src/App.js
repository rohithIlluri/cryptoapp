import React, { useEffect, useState } from 'react';
import Header from './components/layout/Header';
import Overview from './components/pages/Overview';
import Coins from './components/pages/Coins';
import News from './components/pages/News';
import DashboardNews from './components/pages/DashboardNews';
const Details = React.lazy(() => import('./components/pages/Details'));


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
      <main className="main" style={{ padding: 20 }}>
        {tab === 'overview' && (
          <>
            <Overview onSelectCoin={(id) => openDetails(id)} />
            <DashboardNews />
          </>
        )}
        {tab === 'coins' && <Coins onSelect={(id) => openDetails(id)} />}
        {tab === 'news' && <News />}
      </main>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-panel" role="dialog" aria-modal="true" aria-label="Coin details" onClick={(e) => e.stopPropagation()}>
            <div className="row" style={{ justifyContent: 'space-between', padding: 14, borderBottom: '1px solid var(--border)', background: '#fff', position: 'sticky', top: 0, zIndex: 1 }}>
              <div className="card-title" style={{ margin: 0 }}>Coin Details</div>
              <button className="btn" onClick={() => setShowModal(false)}>Close</button>
            </div>
            <div style={{ padding: 18, background: '#fff' }}>
              <React.Suspense fallback={<div className="skeleton" style={{ height: 200 }} />}> 
                <Details coinId={detailsId} />
              </React.Suspense>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

