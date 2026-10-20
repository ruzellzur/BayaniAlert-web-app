import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Map() {
  const navigate = useNavigate();
  const { evacCenters } = useApp();

  return (
    <div className="screen-enter" style={{ padding: '2px 20px 100px' }}>
      {/* Topbar */}
      <div className="topbar">
        <div className="row" style={{ gap: 12 }}>
          <button className="btn-ghost btn btn-sm mobile-back" onClick={() => navigate('/home')} aria-label="Go back" style={{ padding: '8px 10px' }}>←</button>
          <h2 style={{ fontSize: 17 }}>Evacuation & flood map</h2>
        </div>
      </div>

      <div className="map-grid">
        <div>
          {/* SVG Map */}
          <div className="map-wrap">
            <svg viewBox="0 0 300 320">
              <defs>
                <linearGradient id="mapDanger" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#DB6A55"/>
                  <stop offset="100%" stopColor="#C1443C"/>
                </linearGradient>
                <linearGradient id="mapAccent" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F0B84A"/>
                  <stop offset="100%" stopColor="#E29A3B"/>
                </linearGradient>
                <linearGradient id="mapInk" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2C4470"/>
                  <stop offset="100%" stopColor="#1B2A4A"/>
                </linearGradient>
              </defs>
              <rect width="300" height="320" fill="#DCE9E0"/>
              <path d="M0 210 L60 200 L120 225 L180 205 L240 230 L300 215 L300 320 L0 320 Z" fill="#BFD9E6" opacity="0.85"/>
              <path d="M0 235 L70 222 L140 244 L210 226 L300 240 L300 320 L0 320 Z" fill="#A9CBDC"/>
              <g stroke="#C9D6C9" strokeWidth="3">
                <line x1="0" y1="90" x2="300" y2="70"/>
                <line x1="20" y1="0" x2="60" y2="320"/>
                <line x1="180" y1="0" x2="150" y2="320"/>
                <line x1="0" y1="150" x2="300" y2="160"/>
              </g>
              <rect x="80" y="98" width="26" height="20" rx="2" fill="#C7D2CB"/>
              <rect x="150" y="115" width="22" height="18" rx="2" fill="#C7D2CB"/>
              <rect x="200" y="85" width="30" height="22" rx="2" fill="#C7D2CB"/>
              <rect x="40" y="60" width="24" height="18" rx="2" fill="#C7D2CB"/>
              <circle cx="95" cy="107" r="9" fill="url(#mapDanger)"/>
              <text x="95" y="111" fontSize="10" fill="#fff" textAnchor="middle" fontFamily="Work Sans, sans-serif" fontWeight="700">E</text>
              <circle cx="215" cy="94" r="9" fill="url(#mapDanger)"/>
              <text x="215" y="98" fontSize="10" fill="#fff" textAnchor="middle" fontFamily="Work Sans, sans-serif" fontWeight="700">E</text>
              <circle cx="150" cy="180" r="7" fill="url(#mapAccent)"/>
              <circle cx="60" cy="150" r="7" fill="url(#mapAccent)"/>
              <circle cx="230" cy="170" r="7" fill="url(#mapAccent)"/>
              <circle cx="130" cy="60" r="6" fill="url(#mapInk)" stroke="#fff" strokeWidth="2"/>
            </svg>
          </div>

          {/* Legend */}
          <div className="legend">
            <div className="item">
              <span className="sw" style={{ background: '#C1443C' }}></span>
              Evacuation center
            </div>
            <div className="item">
              <span className="sw" style={{ background: '#E29A3B' }}></span>
              Shared resource
            </div>
            <div className="item">
              <span className="sw" style={{ background: '#1B2A4A' }}></span>
              You are here
            </div>
            <div className="item">
              <span className="sw" style={{ background: '#A9CBDC' }}></span>
              Flood-prone area
            </div>
          </div>
        </div>

        <div>
          {/* Nearest Evacuation Center */}
          <div className="section-label" style={{ marginTop: 0 }}>
            <h3>Nearest evacuation center</h3>
          </div>
          {evacCenters.map((center, i) => (
            <div
              key={i}
              className="card row between"
              onClick={() => navigate(`/evac/${i}`)}
              style={{ cursor: 'pointer', marginBottom: i < evacCenters.length - 1 ? '10px' : 0 }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{center.name}</div>
                <div className="muted small" style={{ marginTop: 3 }}>
                  {center.distLabel} · {center.cap} / {center.max} capacity
                </div>
              </div>
              <button
                className="btn btn-primary btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  alert('Directions would open here');
                }}
              >
                Directions
              </button>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 18px 20px 14px;
        }
        .map-grid {
          display: block;
        }
        .map-wrap {
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid var(--border);
          background: #DCE9E0;
          aspect-ratio: 1/1.05;
        }
        .map-wrap svg {
          width: 100%;
          height: 100%;
          display: block;
        }
        .legend {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          margin-top: 14px;
        }
        .legend .item {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 12px;
          color: var(--ink-soft);
          font-weight: 600;
        }
        .legend .sw {
          width: 11px;
          height: 11px;
          border-radius: 4px;
        }

        @media (min-width: 900px) {
          .topbar {
            padding: 26px 0 20px;
          }
          .map-grid {
            display: grid;
            grid-template-columns: 1.4fr 1fr;
            gap: 26px;
            align-items: start;
          }
        }
      `}</style>
    </div>
  );
}
