import React, { useRef } from 'react';

export default function Header({ active, onChange }) {
  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'coins', label: 'Coins' },
    { key: 'news', label: 'News' },
  ];
  const btnRefs = useRef([]);
  const onKeyDown = (e, idx) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const dir = e.key === 'ArrowRight' ? 1 : -1;
    const next = (idx + dir + tabs.length) % tabs.length;
    btnRefs.current[next]?.focus();
  };
  return (
    <header className="header">
      <div className="header-inner container">
        <div className="brand">Chain Stream</div>
        <nav className="tabs" role="tablist" aria-label="Primary">
          {tabs.map((t, i) => (
            <button
              key={t.key}
              ref={(el) => (btnRefs.current[i] = el)}
              role="tab"
              aria-selected={active === t.key}
              aria-current={active === t.key ? 'page' : undefined}
              tabIndex={active === t.key ? 0 : -1}
              className={`tab ${active === t.key ? 'active' : ''}`}
              onKeyDown={(e) => onKeyDown(e, i)}
              onClick={() => onChange(t.key)}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}

