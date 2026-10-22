import { useNavigate } from 'react-router-dom';

export default function WeatherHistory() {
  const navigate = useNavigate();

  const forecast = [
    { time: 'Now', temp: '28°' },
    { time: '7PM', temp: '27°' },
    { time: '8PM', temp: '26°' },
    { time: '9PM', temp: '26°' },
    { time: '10PM', temp: '25°' },
    { time: '11PM', temp: '25°' },
  ];

  const history = [
    { badge: 'S2', label: 'Signal No. 2 raised', time: 'Today · 6:40 PM — 65 km/h winds', active: true },
    { badge: 'S1', label: 'Signal No. 1 raised', time: 'Today · 2:15 PM — 45 km/h winds', active: false },
    { badge: 'ADV', label: 'Heavy rainfall advisory', time: 'Yesterday · 9:00 AM', active: false },
  ];

  return (
    <div className="screen-enter">
      {/* Topbar */}
      <div className="topbar">
        <div className="row" style={{ gap: 12 }}>
          <button className="btn-ghost btn btn-sm mobile-back" onClick={() => navigate('/home')} aria-label="Go back" style={{ padding: '8px 10px' }}>←</button>
          <h2 style={{ fontSize: 17 }}>Weather & alerts</h2>
        </div>
      </div>

      {/* Next 6 Hours Forecast */}
      <div className="section-label" style={{ marginTop: 0 }}>
        <h3>Next 6 hours</h3>
      </div>
      <div className="forecast-strip">
        {forecast.map((f, i) => (
          <div key={i} className="fcell">
            <div className="ic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3s6 7 6 11a6 6 0 1 1-12 0c0-4 6-11 6-11Z"/>
              </svg>
            </div>
            <div className="t">{f.time}</div>
            <div className="v">{f.temp}</div>
          </div>
        ))}
      </div>

      {/* Advisory History */}
      <div className="section-label" style={{ marginTop: 0 }}>
        <h3>Advisory history</h3>
      </div>
      <div className="card" style={{ padding: '4px 16px' }}>
        {history.map((item, i) => (
          <div key={i} className={`hist-item ${item.active ? 'is-active' : ''}`}>
            <span className="hist-badge">{item.badge}</span>
            <div>
              <div className="hist-label">{item.label}</div>
              <div className="muted small" style={{ marginTop: 2 }}>{item.time}</div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .forecast-strip {
          margin-bottom: 20px;
        }
        .fcell .ic {
          width: 30px;
          height: 30px;
          margin: 0 auto 4px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--accent-soft);
          color: var(--accent);
        }
        .fcell .ic svg { width: 17px; height: 17px; }
        .hist-item {
          display: flex;
          gap: 13px;
          align-items: center;
          padding: 13px 0;
          border-top: 1px solid var(--border);
        }
        .hist-item:first-child { border-top: none; padding-top: 0; }
        .hist-badge {
          width: 40px;
          height: 40px;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11.5px;
          font-weight: 700;
          flex-shrink: 0;
          background: var(--surface-alt);
          color: var(--ink-soft);
          transition: transform 0.24s var(--ease);
        }
        .hist-item.is-active .hist-badge {
          background: var(--grad-accent);
          color: var(--accent-ink);
          box-shadow: var(--glow-accent);
        }
        .hist-item.is-active .hist-badge::after {
          content: "";
          position: absolute;
          inset: 0;
        }
        .hist-label { font-weight: 600; font-size: 13.5px; }

      `}</style>
    </div>
  );
}
