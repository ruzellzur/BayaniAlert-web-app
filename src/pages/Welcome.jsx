import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

/**
 * Welcome Page
 *
 * Landing screen for unauthenticated visitors.
 * Markup matches the prototype's `#screen-welcome`:
 *   .hero > .hero-text + .hero-art
 *   .welcome-body > .value-row + .welcome-cta-row + .guest-info
 *
 * All visual rules (.hero, .welcome-body, .value-row, .alert-card,
 * .dir-item, .guest-info-grid) live in src/styles/prototype.css.
 */
export default function Welcome() {
  const navigate = useNavigate();
  const { evacCenters } = useApp();

  return (
    <section className="screen active welcome">
      {/* Hero */}
      <div className="hero">
        <div className="hero-text">
          <span className="hero-badge">Barangay San Isidro</span>
          <h1>Kapag may bagyo,<br /><i>magkasama tayo.</i></h1>
          <p>Weather alerts, shared supplies, and safety check-ins for every household in the barangay — in one place.</p>
        </div>
        <div className="hero-art">
          <svg className="sky" viewBox="0 0 100 100" fill="none">
            <circle cx="66" cy="30" r="16" fill="#E29A3B" />
            <path d="M18 55c0-8 6.5-14 14.5-14 5 0 9.4 2.6 12 6.6C48 45 51 44 54.3 44c8 0 14.4 6.2 14.7 14H18z" fill="#3A4E78" />
            <path d="M14 66c0-6.6 5.3-12 12-12 4.1 0 7.7 2 9.9 5.2 2.6-2 5.9-3.2 9.5-3.2 7.9 0 14.3 6 14.6 13.6H14z" fill="#24365C" />
          </svg>
        </div>
      </div>

      {/* Body */}
      <div className="welcome-body">
        {/* Value props */}
        <div className="value-row">
          <div className="value"><div className="num">Live</div><div className="lbl">Weather alerts</div></div>
          <div className="value"><div className="num">1-tap</div><div className="lbl">Safety check-in</div></div>
          <div className="value"><div className="num">Shared</div><div className="lbl">Supplies board</div></div>
        </div>

        {/* CTA */}
        <div className="welcome-cta-row" style={{ flexDirection: 'column', display: 'flex', gap: 12 }}>
          <button className="btn btn-accent btn-block" onClick={() => navigate('/register')}>Get started</button>
          <button className="btn btn-ghost btn-block" onClick={() => navigate('/login')}>I already have an account</button>
        </div>

        {/* Guest info */}
        <div className="guest-info">
          <div className="section-label" style={{ marginTop: 26 }}>
            <h3>Right now in Barangay San Isidro</h3>
            <span className="muted small">Guest view — no account needed</span>
          </div>

          {/* Weather advisory — prototype .alert-card */}
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

          {/* Two-column grid */}
          <div className="guest-info-grid">
            {/* Evacuation centers */}
            <div>
              <div className="section-label"><h3>Evacuation centers</h3></div>
              <div id="guestEvacListWrap" style={{ marginBottom: 6 }}>
                {evacCenters.map((center, i) => (
                  <div
                    key={i}
                    className="card row between"
                    style={i > 0 ? { marginTop: 10 } : {}}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{center.name}</div>
                      <div className="muted small" style={{ marginTop: 3 }}>
                        {center.distLabel} · {center.cap} / {center.max} capacity
                      </div>
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => alert('Directions would open here')}
                    >
                      Directions
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency hotlines */}
            <div>
              <div className="section-label"><h3>Emergency hotlines</h3></div>
              <div className="card" style={{ marginBottom: 6 }}>
                <div className="dir-item">
                  <span className="avatar" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>FR</span>
                  <div className="info">
                    <div className="nm">Fire &amp; Rescue</div>
                    <div className="role">24/7 hotline</div>
                  </div>
                  <button
                    className="dir-call"
                    onClick={() => alert('Would dial 911')}
                    aria-label="Call 911"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 2 .7 3a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.2-1.3a2 2 0 0 1 2.1-.5c1 .4 2 .6 3 .7a2 2 0 0 1 1.7 2Z" />
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
                      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 2 .7 3a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.2-1.3a2 2 0 0 1 2.1-.5c1 .4 2 .6 3 .7a2 2 0 0 1 1.7 2Z" />
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
                      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 2 .7 3a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.2-1.3a2 2 0 0 1 2.1-.5c1 .4 2 .6 3 .7a2 2 0 0 1 1.7 2Z" />
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
    </section>
  );
}
