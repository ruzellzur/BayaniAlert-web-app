import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

/**
 * Home Page
 *
 * Markup matches the prototype's `#screen-home`:
 *   .topbar > .brand + .topbar-right
 *   .dash-grid > .dash-col (alert-card, quick-grid, section-label, card.res-card)
 *   .dash-col (role-swap resident/official blocks)
 *
 * All visual rules live in src/styles/prototype.css.
 */
export default function Home() {
  const navigate = useNavigate();
  const { user, households } = useApp();

  const residentInitials = (user?.name || 'Ruzel G.')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const officialInitials = (user?.officialName || user?.name || 'Kagawad Mario Reyes')
    .split(' ')
    .filter((w) => /[A-Za-z]/.test(w[0]))
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const safeCount = households.filter((h) => h.status === 'safe').length;
  const helpCount = households.filter((h) => h.status === 'help').length;
  const respondedCount = safeCount + helpCount;
  const totalHouseholds = households.length || 24;
  const respondedPct = (respondedCount / totalHouseholds) * 100;

  return (
    <section className="screen active" id="screen-home">
      {/* Topbar */}
      <div className="topbar">
        <div className="brand">
          <span className="word">
            Bayani<em>Alert</em>
          </span>
        </div>
        <div className="topbar-right">
          <span className="brgy-pill">Brgy. San Isidro</span>
          <button
            className="icon-btn"
            onClick={() => alert('No new notifications')}
            aria-label="Notifications"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.7 21a2 2 0 0 1-3.4 0" />
            </svg>
          </button>
          <div className="top-avatar" onClick={() => navigate('/profile')}>
            <span className="role-swap" data-role="resident">
              {residentInitials}
            </span>
            <span className="role-swap" data-role="official">
              {officialInitials}
            </span>
          </div>
        </div>
      </div>

      <div className="dash-grid">
        <div className="dash-col">
          {/* Weather advisory */}
          <div
            className="alert-card"
            onClick={() => navigate('/weather-history')}
            style={{ cursor: 'pointer' }}
          >
            <div className="alert-top">
              <div>
                <div className="small" style={{ color: '#B9C4DA' }}>
                  Weather advisory
                </div>
                <h3>Signal No. 2 — Heavy rain expected tonight</h3>
              </div>
              <span className="signal-badge">SIG 2</span>
            </div>
            <div className="alert-meta">
              <div>
                Rainfall<strong>42mm/hr</strong>
              </div>
              <div>
                Wind<strong>65 km/h</strong>
              </div>
              <div>
                Updated<strong>6:40 PM</strong>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="quick-grid">
            <div className="quick" onClick={() => navigate('/checkin')}>
              <span className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
              <span className="role-swap" data-role="resident">
                Check in
              </span>
              <span className="role-swap" data-role="official">
                Check-ins
              </span>
            </div>
            <div className="quick" onClick={() => navigate('/board')}>
              <span className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 7H4v13h16z" />
                  <path d="M16 3v8M8 3v8M4 11h16" />
                </svg>
              </span>
              Resources
            </div>
            <div className="quick" onClick={() => navigate('/map')}>
              <span className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 20 3 17V4l6 3 6-3 6 3v13l-6-3-6 3Z" />
                  <path d="M9 4v13M15 7v13" />
                </svg>
              </span>
              Map
            </div>
            <div className="quick" onClick={() => navigate('/announcements')}>
              <span className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 11v3a1 1 0 0 0 1 1h2l4 4V6L6 10H4a1 1 0 0 0-1 1Z" />
                  <path d="M16 8a4 4 0 0 1 0 8" />
                </svg>
              </span>
              <span className="role-swap" data-role="resident">
                Notices
              </span>
              <span className="role-swap" data-role="official">
                Post notice
              </span>
            </div>
          </div>

          {/* Nearby resources */}
          <div className="section-label">
            <h3>Nearby on the resource board</h3>
            <a onClick={() => navigate('/board')}>See all</a>
          </div>
          <div
            className="card res-card"
            onClick={() => navigate('/board')}
            style={{ cursor: 'pointer' }}
          >
            <span className="res-ic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16v4H4zM6 8v12h12V8" />
              </svg>
            </span>
            <div className="res-body">
              <div className="name">Gasoline-powered generator</div>
              <div className="owner">Shared by Mang Tonio · Purok 3</div>
            </div>
          </div>
        </div>

        <div className="dash-col">
          {/* Resident announcements */}
          <div className="role-swap" data-role="resident">
            <div className="section-label" style={{ marginTop: 0 }}>
              <h3>Barangay announcements</h3>
              <a onClick={() => navigate('/announcements')}>See all</a>
            </div>
            <div className="card stack" style={{ gap: 0 }}>
              <div className="ann-preview">
                <span className="ann-dot" style={{ background: 'var(--danger)' }} />
                <div>
                  <div className="t">Evacuation center at San Isidro Elementary now open</div>
                  <div className="time">Kagawad Reyes · 25 min ago</div>
                </div>
              </div>
              <div className="ann-preview">
                <span className="ann-dot" style={{ background: 'var(--accent)' }} />
                <div>
                  <div className="t">Free rubber boots at the covered court, while supplies last</div>
                  <div className="time">Brgy. Captain Lira · 2 hr ago</div>
                </div>
              </div>
              <div className="ann-preview">
                <span className="ann-dot" style={{ background: 'var(--safe)' }} />
                <div>
                  <div className="t">Drainage clearing ends Friday — thank you, Purok 3!</div>
                  <div className="time">Kagawad Reyes · Yesterday</div>
                </div>
              </div>
            </div>
          </div>

          {/* Official check-in overview */}
          <div className="role-swap" data-role="official">
            <div className="section-label" style={{ marginTop: 0 }}>
              <h3>Check-in overview</h3>
              <a onClick={() => navigate('/checkin')}>View board</a>
            </div>
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="row between">
                <span style={{ fontWeight: 600, fontSize: 13.5 }}>Purok 3 households</span>
                <span className="small muted">
                  {respondedCount} / {totalHouseholds} responded
                </span>
              </div>
              <div className="cap-bar" style={{ marginTop: 10 }}>
                <div className="cap-fill" style={{ width: `${respondedPct}%` }} />
              </div>
              <div className="row between" style={{ marginTop: 14 }}>
                <span className="small" style={{ color: 'var(--danger)', fontWeight: 600 }}>
                  {helpCount} households need help
                </span>
                <button className="btn btn-danger btn-sm" onClick={() => navigate('/checkin')}>
                  Respond
                </button>
              </div>
            </div>
            <div className="section-label" style={{ marginTop: 0 }}>
              <h3>Your announcements</h3>
              <a onClick={() => navigate('/announcements')}>Manage</a>
            </div>
            <div className="card stack" style={{ gap: 0 }}>
              <div className="ann-preview">
                <span className="ann-dot" style={{ background: 'var(--danger)' }} />
                <div>
                  <div className="t">Evacuation center at San Isidro Elementary now open</div>
                  <div className="time">Posted 25 min ago</div>
                </div>
              </div>
              <div className="ann-preview">
                <span className="ann-dot" style={{ background: 'var(--safe)' }} />
                <div>
                  <div className="t">Drainage clearing ends Friday — thank you, Purok 3!</div>
                  <div className="time">Posted yesterday</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
