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
    <div className="screen-enter" style={{ padding: '2px 20px 100px' }}>
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
      <div className="forecast-strip" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: 6,
        marginBottom: 18
      }}>
        {forecast.map((f, i) => (
          <div key={i} className="fcell" style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '10px 4px',
            textAlign: 'center'
          }}>
            <div className="t small muted" style={{ marginBottom: 4 }}>{f.time}</div>
            <div className="v" style={{ fontWeight: 600, fontSize: 15 }}>{f.temp}</div>
          </div>
        ))}
      </div>

      {/* Advisory History */}
      <div className="section-label" style={{ marginTop: 0 }}>
        <h3>Advisory history</h3>
      </div>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {history.map((item, i) => (
          <div key={i} className="hist-item" style={{
            display: 'flex',
            gap: 12,
            padding: '12px 0',
            borderTop: i > 0 ? '1px solid var(--border)' : 'none'
          }}>
            <span className="hist-dot" style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 700,
              flexShrink: 0,
              background: item.active ? 'var(--accent)' : 'var(--surface-alt)',
              color: item.active ? 'var(--accent-ink)' : 'var(--ink-soft)'
            }}>
              {item.badge}
            </span>
            <div>
              <div style={{ fontWeight: 600, fontSize: '13.5px' }}>{item.label}</div>
              <div className="muted small" style={{ marginTop: 2 }}>{item.time}</div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 18px 20px 14px;
        }

        @media (min-width: 900px) {
          .mobile-back {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
