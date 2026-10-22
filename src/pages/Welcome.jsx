import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/app-context';

export default function Welcome() {
  const navigate = useNavigate();
  const { evacCenters } = useApp();

  return (
    <div className="screen-enter welcome">
      {/* Hero Section */}
      <div className="hero">
        <span className="hero-orb orb-a" aria-hidden="true" />
        <span className="hero-orb orb-b" aria-hidden="true" />
        <span className="hero-orb orb-c" aria-hidden="true" />
        <div className="hero-rain" aria-hidden="true">
          {Array.from({ length: 14 }).map((_, i) => (
            <span key={i} style={{ '--i': i }} />
          ))}
        </div>

        <div className="hero-text">
          <span className="hero-badge">
            <span className="live-dot" aria-hidden="true" /> Barangay San Isidro
          </span>
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
            <span className="value-ic ic-accent">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.7 21a2 2 0 0 1-3.4 0"/>
              </svg>
            </span>
            <div className="num">Live</div>
            <div className="lbl">Weather alerts</div>
          </div>
          <div className="value">
            <span className="value-ic ic-safe">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6 9 17l-5-5"/>
              </svg>
            </span>
            <div className="num">1-tap</div>
            <div className="lbl">Safety check-in</div>
          </div>
          <div className="value">
            <span className="value-ic ic-cool">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 7H4v13h16z"/>
                <path d="M16 3v8M8 3v8M4 11h16"/>
              </svg>
            </span>
            <div className="num">Shared</div>
            <div className="lbl">Supplies board</div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="welcome-cta-row">
          <button className="btn btn-accent btn-block btn-lg" onClick={() => navigate('/register')}>Get started</button>
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
        .welcome { padding: 0; }

        .hero {
          padding: 54px 26px 34px;
          background:
            radial-gradient(120% 90% at 15% -10%, rgba(232,155,54,0.42), transparent 60%),
            radial-gradient(80% 60% at 100% 100%, rgba(123,99,204,0.32), transparent 60%),
            var(--grad-primary);
          background-size: 200% 200%;
          animation: gradientPan 16s ease infinite;
          color: #fff;
          position: relative;
          min-height: 340px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          overflow: hidden;
        }
        .hero-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(30px);
          pointer-events: none;
        }
        .hero-orb.orb-a {
          width: 190px; height: 190px;
          top: -50px; right: -40px;
          background: radial-gradient(circle, rgba(232,155,54,0.65), transparent 70%);
          animation: floaty 7s ease-in-out infinite;
        }
        .hero-orb.orb-b {
          width: 150px; height: 150px;
          bottom: -40px; left: -40px;
          background: radial-gradient(circle, rgba(123,99,204,0.6), transparent 70%);
          animation: floaty 9s ease-in-out infinite reverse;
        }
        .hero-orb.orb-c {
          width: 110px; height: 110px;
          top: 40%; left: 42%;
          background: radial-gradient(circle, rgba(61,138,97,0.45), transparent 70%);
          animation: floaty 11s ease-in-out infinite;
        }
        .hero-rain {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }
        .hero-rain span {
          position: absolute;
          top: -14%;
          width: 1.5px;
          height: 26px;
          border-radius: 2px;
          background: linear-gradient(180deg, transparent, rgba(255,255,255,0.45));
          left: calc(var(--i) * 7.4% + 2%);
          animation: rainFall 2.4s linear infinite;
          animation-delay: calc(var(--i) * -0.34s);
          opacity: 0.55;
        }
        @keyframes rainFall {
          0% { transform: translateY(-30px); opacity: 0; }
          15% { opacity: 0.6; }
          100% { transform: translateY(420px); opacity: 0; }
        }

        .hero-badge {
          align-self: flex-start;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.16);
          color: #fff;
          font-size: 11.5px;
          font-weight: 600;
          padding: 7px 14px;
          border-radius: 999px;
          margin-bottom: 20px;
          backdrop-filter: blur(6px);
          position: relative;
          z-index: 1;
        }
        .hero-badge .live-dot { background: #6FE39C; }
        .hero-badge .live-dot::after { background: #6FE39C; }

        .hero svg.sky {
          position: absolute;
          top: 18px;
          right: 18px;
          width: 96px;
          height: 96px;
          opacity: 0.92;
          animation: floaty 6s ease-in-out infinite;
          z-index: 1;
        }
        .hero h1 {
          font-size: 32px;
          line-height: 1.12;
          color: #fff;
          font-weight: 600;
          max-width: 15ch;
          position: relative;
          z-index: 1;
        }
        .hero h1 i {
          font-style: italic;
          background: linear-gradient(120deg, var(--accent-2), var(--accent) 70%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .hero p {
          color: #C9D3E3;
          font-size: 14.5px;
          margin-top: 12px;
          max-width: 34ch;
          line-height: 1.5;
          position: relative;
          z-index: 1;
        }
        .hero-text { position: relative; z-index: 1; }

        .welcome-body {
          padding: 30px 20px 60px;
        }
        .value-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin: 0 0 22px;
        }
        .value {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 18px;
          padding: 18px 10px 16px;
          text-align: center;
          box-shadow: var(--card-shadow);
          transition: transform 0.22s var(--ease), box-shadow 0.22s ease;
        }
        .value-ic {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 10px;
          color: #fff;
          transition: transform 0.24s var(--ease);
        }
        .value-ic svg { width: 21px; height: 21px; }
        .value-ic.ic-accent { background: var(--grad-accent); box-shadow: 0 6px 16px -6px rgba(232,155,54,0.8); }
        .value-ic.ic-safe { background: var(--grad-safe); box-shadow: 0 6px 16px -6px rgba(61,138,97,0.8); }
        .value-ic.ic-cool { background: var(--grad-cool); box-shadow: 0 6px 16px -6px rgba(69,115,174,0.8); }
        .value .num {
          font-family: var(--font-display);
          font-size: 18px;
          font-weight: 600;
          background: linear-gradient(120deg, var(--accent-2), var(--accent) 75%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .value .lbl {
          font-size: 11.5px;
          color: var(--ink-soft);
          font-weight: 600;
          margin-top: 3px;
          line-height: 1.3;
        }
        @media (hover: hover) {
          .value:hover {
            transform: translateY(-4px);
            box-shadow: 0 16px 32px -14px rgba(21,35,61,0.32);
          }
          .value:hover .value-ic { transform: scale(1.12) rotate(-6deg); }
        }

        .welcome-cta-row {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-width: 420px;
          margin: 0 auto 6px;
        }

        .guest-info { margin: 26px auto 0; max-width: 640px; }
        .guest-info-grid { display: block; }

        @media (min-width: 560px) {
          .welcome-body { padding: 36px 24px 70px; }
          .value-row { max-width: 640px; margin: 0 auto 22px; }
          .guest-info { max-width: 640px; margin: 26px auto 0; }
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
          .hero-badge { margin-bottom: 22px; }
          .hero h1 { font-size: 46px; max-width: 14ch; }
          .hero p { font-size: 16px; max-width: 38ch; }
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
            position: relative;
            z-index: 1;
          }
          .welcome-body {
            max-width: 1280px;
            margin: 0 auto;
            padding: 44px 60px 80px;
          }
          .value-row { max-width: 760px; margin: 0 auto 26px; gap: 18px; }
          .value { padding: 22px 14px 20px; }
          .value-ic { width: 48px; height: 48px; }
          .value .num { font-size: 21px; }
          .welcome-cta-row { max-width: 420px; }
          .guest-info { max-width: 960px; margin: 34px auto 0; }
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
