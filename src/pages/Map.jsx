import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button, Card } from '../components/ui';
import { PageContainer, Section } from '../components/layout/PageContainer';

export default function Map() {
  const navigate = useNavigate();
  const { evacCenters } = useApp();

  return (
    <PageContainer>
      {/* Topbar */}
      <div className="map-topbar">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/home')}
          aria-label="Go back"
        >
          ←
        </Button>
        <h2>Evacuation &amp; flood map</h2>
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
            <div className="legend-item">
              <span className="legend-swatch" style={{ background: '#C1443C' }}></span>
              Evacuation center
            </div>
            <div className="legend-item">
              <span className="legend-swatch" style={{ background: '#E29A3B' }}></span>
              Shared resource
            </div>
            <div className="legend-item">
              <span className="legend-swatch" style={{ background: '#1B2A4A' }}></span>
              You are here
            </div>
            <div className="legend-item">
              <span className="legend-swatch" style={{ background: '#A9CBDC' }}></span>
              Flood-prone area
            </div>
          </div>
        </div>

        <div>
          {/* Nearest Evacuation Centers */}
          <Section title="Nearest evacuation center">
            {evacCenters.map((center, i) => (
              <Card
                key={i}
                interactive
                onClick={() => navigate(`/evac/${i}`)}
                style={{ marginBottom: i < evacCenters.length - 1 ? 'var(--space-2)' : 0 }}
              >
                <div className="evac-card">
                  <div>
                    <div className="evac-name">{center.name}</div>
                    <div className="evac-meta">
                      {center.distLabel} · {center.cap} / {center.max} capacity
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      alert('Directions would open here');
                    }}
                  >
                    Directions
                  </Button>
                </div>
              </Card>
            ))}
          </Section>
        </div>
      </div>

      <style>{`
        .map-topbar {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-2) 0 var(--space-4);
        }

        .map-topbar h2 {
          font-size: var(--text-lg);
          font-weight: 600;
          margin: 0;
        }

        .map-grid {
          display: block;
        }
        .map-wrap {
          position: relative;
          border-radius: var(--radius-xl);
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
          gap: var(--space-3);
          margin-top: var(--space-3);
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--text-xs);
          color: var(--ink-soft);
          font-weight: 600;
        }
        .legend-swatch {
          width: 11px;
          height: 11px;
          border-radius: var(--radius-sm);
        }
        .evac-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .evac-name {
          font-weight: 600;
          font-size: var(--text-base);
        }
        .evac-meta {
          font-size: var(--text-sm);
          color: var(--ink-soft);
          margin-top: var(--space-1);
        }

        @media (min-width: 900px) {
          .map-grid {
            display: grid;
            grid-template-columns: 1.4fr 1fr;
            gap: var(--space-6);
            align-items: start;
          }
        }
      `}</style>
    </PageContainer>
  );
}
