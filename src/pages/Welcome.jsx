import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Welcome() {
  const navigate = useNavigate();
  const { evacCenters } = useApp();

  return (
    <div className="screen-enter welcome" style={{ padding: 0 }}>
      {/* Hero Section */}
      <div className="hero">
        <div className="hero-text">
          <span className="hero-badge">Barangay San Isidro</span>
          <h1>Kapag may bagyo,<br /><i>magkasama tayo.</i></h1>
          <p>Weather alerts, shared supplies, and safety check-ins for every household in the barangay — in one place.</p>
        </div>
        <div className="hero-art">
          <svg className="sky" viewBox="0 0 100 100" fill="none">
            <circle cx="66" cy="30" r="16" fill="#E29A3B"/>
            <path d="M18 55c0-8 6.5-14 14.5-14 5 0 9.4 2.6 12 6.6C48 45 51 44 54.3 44c8 0 14.4 6.2 14.7 14H18z" fill="#3A4E78"/>
            <path d="M14 66c0-6.6 5.3-12 12-12 4.1 0 7.7 2 9.9 5.2 2.6-2 5.9-3.2 9.5-3.2 7.9 0 14.3 6 14.6 13.6H14z" fill="#24365C"/>
          </svg>
        </div>
      </div>

      <div className="welcome-body">
        {/* Value Props */}
        <div className="value-row">
          <div className="value">
            <div className="num">Live</div>
            <div className="lbl">Weather alerts</div>
          </div>
          <div className="value">
            <div className="num">1-tap</div>
            <div className="lbl">Safety check-in</div>
          </div>
          <div className="value">
            <div className="num">Shared</div>
            <div className="lbl">Supplies board</div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="welcome-cta-row" style={{ flexDirection: 'column', display: 'flex', gap: 12 }}>
          <button className="btn btn-accent btn-block" onClick={() => navigate('/register')}>Get started</button>
          <button className="btn btn-ghost btn-block" onClick={() => navigate('/login')}>I already have an account</button>
        </div>

        {/* Guest Info Section */}
        <div className="guest-info">
          <div className="section-label" style={{ marginTop: 26 }}>
            <h3>Right now in Barangay San Isidro</h3>
            <span className="muted small">Guest view — no account needed</span>
          </div>

          {/* Weather Alert Card */}
          <div className="alert-card" style={{ cursor: 'default' }}>
            <div className="alert-top">
              <div>
                <div className="small" style={{ color: '#B9C4DA' }}>Weather advisory</div>
                <h3>Signal No. 2 — Heavy rain expected tonight</h3>
              </div>
              <span className="signal-badge">SIG 2</span>
            </div>
            <div className="alert-meta">
              <div>Rainfall<strong>42mm/hr</strong></div>
              <div>Wind<strong>65 km/h</strong></div>
              <div>Updated<strong>6:40 PM</strong></div>
            </div>
          </div>

          {/* Guest Info Grid */}
          <div className="guest-info-grid">
            {/* Evacuation Centers */}
            <div>
              <div className="section-label">
                <h3>Evacuation centers</h3>
              </div>
              {evacCenters.map((center, i) => (
                <div key={i} className="card row between" style={{ marginBottom: i < evacCenters.length - 1 ? '10px' : 0 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{center.name}</div>
                    <div className="muted small" style={{ marginTop: 3 }}>
                      {center.distLabel} · {center.cap} / {center.max} capacity
                    </div>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => alert('Directions would open here')}>
                    Directions
                  </button>
                </div>
              ))}
            </div>

            {/* Emergency Hotlines */}
            <div>
              <div className="section-label">
                <h3>Emergency hotlines</h3>
              </div>
              <div className="card" style={{ marginBottom: 6 }}>
                <div className="dir-item">
                  <span className="avatar" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>FR</span>
                  <div className="info">
                    <div className="nm">Fire & Rescue</div>
                    <div className="role">24/7 hotline</div>
                  </div>
                  <button className="dir-call" onClick={() => alert('Would dial 911')} aria-label="Call 911">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 2 .7 3a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.2-1.3a2 2 0 0 1 2.1-.5c1 .4 2 .6 3 .7a2 2 0 0 1 1.7 2Z"/>
                    </svg>
                  </button>
                </div>
                <div className="dir-item">
                  <span className="avatar">EL</span>
                  <div className="info">
                    <div className="nm">Brgy. Captain Elena Lira</div>
                    <div className="role">Barangay hotline</div>
                  </div>
                  <button className="dir-call" onClick={() => alert('Would dial 0917 500 1001')} aria-label="Call 0917 500 1001">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 2 .7 3a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.2-1.3a2 2 0 0 1 2.1-.5c1 .4 2 .6 3 .7a2 2 0 0 1 1.7 2Z"/>
                    </svg>
                  </button>
                </div>
                <div className="dir-item">
                  <span className="avatar" style={{ background: 'var(--surface-alt)', color: 'var(--ink-soft)' }}>PN</span>
                  <div className="info">
                    <div className="nm">PNP Community Precinct</div>
                    <div className="role">Police assistance</div>
                  </div>
                  <button className="dir-call" onClick={() => alert('Would dial 117')} aria-label="Call 117">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 2 .7 3a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.2-1.3a2 2 0 0 1 2.1-.5c1 .4 2 .6 3 .7a2 2 0 0 1 1.7 2Z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <p className="small muted" style={{ textAlign: 'center', marginBottom: 18 }}>
            Sign in for the resource board, safety check-in, and neighbor messaging.
          </p>
        </div>
      </div>

      <style>{`
        .welcome {
          padding: 0;
        }
        .hero {
          padding: 54px 26px 30px;
          background: var(--grad-primary);
          color: #fff;
          position: relative;
          min-height: 340px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }
        .hero-badge {
          align-self: flex-start;
          background: rgba(255,255,255,0.14);
          color: #fff;
          font-size: 11.5px;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 999px;
          margin-bottom: 20px;
        }
        .hero svg.sky {
          position: absolute;
          top: 20px;
          right: 18px;
          width: 96px;
          height: 96px;
          opacity: 0.9;
        }
        .hero h1 {
          font-size: 32px;
          line-height: 1.12;
          color: #fff;
          font-weight: 600;
          max-width: 15ch;
        }
        .hero h1 i {
          font-style: italic;
          color: #F0B95E;
        }
        .hero p {
          color: #C9D3E3;
          font-size: 14.5px;
          margin-top: 12px;
          max-width: 34ch;
          line-height: 1.5;
        }
        .hero-text {
          max-width: 480px;
        }
        .hero-art {
          display: none;
        }
        .welcome-body {
          padding: 26px 24px 40px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .value-row {
          display: flex;
          gap: 12px;
          margin: 6px 0 10px;
        }
        .value {
          flex: 1;
          text-align: center;
        }
        .value .num {
          font-family: var(--font-display);
          font-size: 20px;
          font-weight: 600;
          color: var(--accent);
        }
        .value .lbl {
          font-size: 11px;
          color: var(--ink-soft);
          margin-top: 2px;
        }
        .welcome-cta-row {
          display: flex;
          gap: 12px;
        }
        .guest-info-grid {
          display: block;
        }
        .dir-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 13px 0;
          border-top: 1px solid var(--border);
        }
        .dir-item:first-child {
          border-top: none;
          padding-top: 0;
        }
        .dir-item .avatar {
          width: 40px;
          height: 40px;
          border-radius: 11px;
          background: var(--grad-cool);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 13.5px;
          flex-shrink: 0;
        }
        .dir-item .info {
          flex: 1;
          min-width: 0;
        }
        .dir-item .info .nm {
          font-weight: 600;
          font-size: 13.5px;
        }
        .dir-item .info .role {
          font-size: 11.5px;
          color: var(--ink-soft);
          margin-top: 1px;
        }
        .dir-call {
          width: 36px;
          height: 36px;
          border-radius: 11px;
          border: 1px solid var(--border);
          background: var(--surface);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--safe);
          flex-shrink: 0;
        }
        .dir-call svg {
          width: 16px;
          height: 16px;
        }

        @media (min-width: 560px) {
          .welcome-body {
            max-width: 720px;
            margin: 0 auto;
          }
          .value-row {
            max-width: 640px;
            margin: 0 0 6px;
          }
          .welcome-cta-row {
            max-width: 420px;
          }
          .guest-info {
            max-width: 640px;
          }
        }

        @media (min-width: 900px) {
          .hero {
            min-height: 560px;
            padding: 20px 60px 60px;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            gap: 40px;
          }
          .hero-badge {
            margin-bottom: 22px;
          }
          .hero h1 {
            font-size: 46px;
            max-width: 14ch;
          }
          .hero p {
            font-size: 16px;
            max-width: 38ch;
          }
          .hero svg.sky {
            position: static;
            width: 120px;
            height: 120px;
          }
          .hero-art {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          .welcome-body {
            max-width: 1280px;
            margin: 0 auto;
            padding: 40px 60px 70px;
          }
          .value-row {
            max-width: 640px;
            margin: 0 0 6px;
          }
          .welcome-cta-row {
            max-width: 420px;
          }
          .guest-info {
            max-width: 960px;
          }
          .guest-info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 28px;
            align-items: start;
          }
        }
      `}</style>
    </div>
  );
}
