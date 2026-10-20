import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button, Card } from '../components/ui';
import { PageContainer } from '../components/layout/PageContainer';

/**
 * Welcome Page - Refactored with new UI components
 *
 * Landing page for unauthenticated users.
 * Displays hero section, value props, and guest information.
 */
export default function Welcome() {
  const navigate = useNavigate();
  const { evacCenters } = useApp();

  return (
    <div className="welcome-page">
      {/* Hero Section */}
      <div className="hero">
        <div className="hero-text">
          <span className="hero-badge">Barangay San Isidro</span>
          <h1>
            Kapag may bagyo,<br /><i>magkasama tayo.</i>
          </h1>
          <p>
            Weather alerts, shared supplies, and safety check-ins for every household in the barangay — in one place.
          </p>
        </div>
        <div className="hero-art">
          <svg className="sky" viewBox="0 0 100 100" fill="none" aria-hidden="true">
            <circle cx="66" cy="30" r="16" fill="#E29A3B"/>
            <path d="M18 55c0-8 6.5-14 14.5-14 5 0 9.4 2.6 12 6.6C48 45 51 44 54.3 44c8 0 14.4 6.2 14.7 14H18z" fill="#3A4E78"/>
            <path d="M14 66c0-6.6 5.3-12 12-12 4.1 0 7.7 2 9.9 5.2 2.6-2 5.9-3.2 9.5-3.2 7.9 0 14.3 6 14.6 13.6H14z" fill="#24365C"/>
          </svg>
        </div>
      </div>

      {/* Main Content */}
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
        <div className="welcome-cta-row">
          <Button variant="accent" block onClick={() => navigate('/register')}>
            Get started
          </Button>
          <Button variant="ghost" block onClick={() => navigate('/login')}>
            I already have an account
          </Button>
        </div>

        {/* Guest Info Section */}
        <div className="guest-info">
          <div className="section-label" style={{ marginTop: 'var(--space-6)' }}>
            <h3>Right now in Barangay San Isidro</h3>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-soft)' }}>
              Guest view — no account needed
            </span>
          </div>

          {/* Weather Alert Card */}
          <Card
            interactive
            onClick={() => alert('Sign in to view weather history')}
            style={{
              background: 'var(--grad-primary)',
              color: '#fff',
              position: 'relative',
              overflow: 'hidden',
              marginBottom: 'var(--space-4)',
            }}
          >
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 'var(--text-sm)', color: '#B9C4DA' }}>Weather advisory</div>
                  <h3 style={{ margin: 'var(--space-3) 0 0', color: '#fff', fontSize: 'var(--text-2xl)' }}>
                    Signal No. 2 — Heavy rain expected tonight
                  </h3>
                </div>
                <span className="signal-badge" style={{
                  background: 'var(--grad-accent)',
                  color: 'var(--accent-ink)',
                  fontWeight: 700,
                  fontSize: 'var(--text-sm)',
                  padding: '6px 11px',
                  borderRadius: '10px',
                  boxShadow: '0 4px 12px rgba(226,154,59,0.35)',
                }}>
                  SIG 2
                </span>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
                <div style={{ fontSize: 'var(--text-xs)', color: '#B9C4DA' }}>
                  Rainfall<strong style={{ display: 'block', fontSize: 'var(--text-md)', color: '#fff' }}>42mm/hr</strong>
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: '#B9C4DA' }}>
                  Wind<strong style={{ display: 'block', fontSize: 'var(--text-md)', color: '#fff' }}>65 km/h</strong>
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: '#B9C4DA' }}>
                  Updated<strong style={{ display: 'block', fontSize: 'var(--text-md)', color: '#fff' }}>6:40 PM</strong>
                </div>
              </div>
            </div>
            {/* Decorative gradients */}
            <div style={{
              position: 'absolute',
              right: '-30px',
              top: '-30px',
              width: '140px',
              height: '140px',
              background: 'radial-gradient(circle, rgba(226,154,59,0.35), transparent 70%)',
            }} />
          </Card>

          {/* Guest Info Grid */}
          <div className="guest-info-grid">
            {/* Evacuation Centers */}
            <div>
              <div className="section-label">
                <h3>Evacuation centers</h3>
              </div>
              {evacCenters.map((center, i) => (
                <Card
                  key={i}
                  variant="default"
                  padding="md"
                  style={{ marginBottom: i < evacCenters.length - 1 ? 'var(--space-3)' : 0 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 'var(--text-md)' }}>{center.name}</div>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-soft)', marginTop: 'var(--space-1)' }}>
                        {center.distLabel} · {center.cap} / {center.max} capacity
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => alert('Directions would open here')}
                    >
                      Directions
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Emergency Hotlines */}
            <div>
              <div className="section-label">
                <h3>Emergency hotlines</h3>
              </div>
              <Card padding="md">
                <div className="dir-item">
                  <span className="avatar" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>FR</span>
                  <div className="info">
                    <div className="nm">Fire & Rescue</div>
                    <div className="role">24/7 hotline</div>
                  </div>
                  <button
                    className="dir-call"
                    onClick={() => alert('Would dial 911')}
                    aria-label="Call 911"
                  >
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
                  <button
                    className="dir-call"
                    onClick={() => alert('Would dial 0917 500 1001')}
                    aria-label="Call 0917 500 1001"
                  >
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
                  <button
                    className="dir-call"
                    onClick={() => alert('Would dial 117')}
                    aria-label="Call 117"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 2 .7 3a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.2-1.3a2 2 0 0 1 2.1-.5c1 .4 2 .6 3 .7a2 2 0 0 1 1.7 2Z"/>
                    </svg>
                  </button>
                </div>
              </Card>
            </div>
          </div>

          <p style={{
            textAlign: 'center',
            fontSize: 'var(--text-sm)',
            color: 'var(--ink-soft)',
            marginTop: 'var(--space-5)',
            marginBottom: 'var(--space-5)',
          }}>
            Sign in for the resource board, safety check-in, and neighbor messaging.
          </p>
        </div>
      </div>

      <style>{`
        .welcome-page {
          padding: 0;
        }

        .hero {
          padding: 54px 26px 30px;
          background: radial-gradient(120% 90% at 15% -10%, rgba(226,154,59,0.35), transparent 60%),
                      radial-gradient(80% 60% at 100% 100%, rgba(110,143,199,0.22), transparent 60%),
                      var(--grad-primary);
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
          font-size: var(--text-sm);
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 999px;
          margin-bottom: var(--space-5);
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
          line-height: var(--leading-tight);
          color: #fff;
          font-weight: 600;
          max-width: 15ch;
          margin: 0;
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
          font-size: var(--text-lg);
          margin-top: var(--space-3);
          max-width: 34ch;
          line-height: var(--leading-normal);
        }

        .hero-text {
          max-width: 480px;
        }

        .hero-art {
          display: none;
        }

        .welcome-body {
          padding: var(--space-6) var(--space-5) var(--space-10);
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .value-row {
          display: flex;
          gap: var(--space-3);
          margin: var(--space-2) 0 var(--space-3);
        }

        .value {
          flex: 1;
          text-align: center;
        }

        .value .num {
          font-family: var(--font-display);
          font-size: var(--text-3xl);
          font-weight: 600;
          background: linear-gradient(120deg, var(--accent-2), var(--cool));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .value .lbl {
          font-size: var(--text-xs);
          color: var(--ink-soft);
          margin-top: var(--space-1);
        }

        .welcome-cta-row {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .guest-info-grid {
          display: block;
        }

        .dir-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) 0;
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
          font-size: var(--text-base);
          flex-shrink: 0;
        }

        .dir-item .info {
          flex: 1;
          min-width: 0;
        }

        .dir-item .info .nm {
          font-weight: 600;
          font-size: var(--text-base);
        }

        .dir-item .info .role {
          font-size: var(--text-sm);
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
          transition: all 0.15s ease;
        }

        .dir-call:hover {
          background: var(--safe-bg);
          border-color: var(--safe);
        }

        .dir-call svg {
          width: 16px;
          height: 16px;
        }

        .section-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: var(--space-6) 0 var(--space-3);
        }

        .section-label h3 {
          font-size: var(--text-md);
          font-weight: 600;
          margin: 0;
        }

        @media (min-width: 560px) {
          .welcome-body {
            max-width: 720px;
            margin: 0 auto;
          }

          .value-row {
            max-width: 640px;
            margin: 0 0 var(--space-2);
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
            margin-bottom: var(--space-5);
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
            padding: var(--space-10) 60px 70px;
          }

          .value-row {
            max-width: 640px;
            margin: 0 0 var(--space-2);
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
