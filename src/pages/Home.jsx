import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/app-context';
import Brand from '../components/Brand';

export default function Home() {
  const navigate = useNavigate();
  const { user, resources, announcements, evacCenters, households } = useApp();

  const isOfficial = user?.role === 'official';

  // Filter announcements for display
  const allAnnouncements = announcements.slice(0, 3);

  // Household stats for officials
  const safeCount = households.filter(h => h.status === 'safe').length;
  const helpCount = households.filter(h => h.status === 'help').length;
  const noResponseCount = households.filter(h => h.status === 'none').length;
  const respondedCount = safeCount + helpCount;

  // Time-of-day greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const fullName = user?.officialName || user?.name || '';
  const firstName = fullName.split(' ').filter(Boolean).slice(-1)[0] || 'neighbor';

  const getCategoryIcon = (cat) => {
    const icons = {
      power: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2 3 14h7l-1 8 11-14h-8z"/></svg>,
      water: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3s6 7 6 11a6 6 0 1 1-12 0c0-4 6-11 6-11Z"/></svg>,
      tools: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 7l3 3-8 8-3.5.5.5-3.5 8-8Z"/><path d="M17 4l3 3"/></svg>,
      firstaid: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="7" width="18" height="12" rx="2"/><path d="M12 10v6M9 13h6"/></svg>,
      transport: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="10" width="18" height="7" rx="2"/><circle cx="7.5" cy="18.5" r="1.5"/><circle cx="16.5" cy="18.5" r="1.5"/></svg>,
    };
    return icons[cat] || icons.tools;
  };

  return (
    <div className="screen-enter">
      {/* Topbar */}
      <div className="topbar">
        <Brand />
        <div className="topbar-right">
          <span className="brgy-pill">Brgy. San Isidro</span>
          <button className="icon-btn" onClick={() => alert('No new notifications')} aria-label="Notifications">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.7 21a2 2 0 0 1-3.4 0"/>
            </svg>
          </button>
          <div className="top-avatar" onClick={() => navigate('/profile')}>
            <span>{user?.initials || 'RG'}</span>
          </div>
        </div>
      </div>

      {/* Greeting */}
      <div className="home-greeting">
        <h1>{greeting}, {firstName}</h1>
        <p className="muted">
          <span className="live-dot" aria-hidden="true" /> Live updates for Barangay San Isidro
        </p>
      </div>

      <div className="dash-grid">
        <div className="dash-col">
          {/* Weather Alert */}
          <div className="alert-card" onClick={() => navigate('/weather-history')} style={{ cursor: 'pointer' }}>
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

          {/* Quick Actions */}
          <div className="quick-grid">
            <div className="quick" onClick={() => navigate('/checkin')}>
              <span className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
              </span>
              <span>{isOfficial ? 'Check-ins' : 'Check in'}</span>
            </div>
            <div className="quick" onClick={() => navigate('/board')}>
              <span className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 7H4v13h16z"/>
                  <path d="M16 3v8M8 3v8M4 11h16"/>
                </svg>
              </span>
              <span>Resources</span>
            </div>
            <div className="quick" onClick={() => navigate('/map')}>
              <span className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 20 3 17V4l6 3 6-3 6 3v13l-6-3-6 3Z"/>
                  <path d="M9 4v13M15 7v13"/>
                </svg>
              </span>
              <span>Map</span>
            </div>
            <div className="quick" onClick={() => navigate('/announcements')}>
              <span className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 11v3a1 1 0 0 0 1 1h2l4 4V6L6 10H4a1 1 0 0 0-1 1Z"/>
                  <path d="M16 8a4 4 0 0 1 0 8"/>
                </svg>
              </span>
              <span>{isOfficial ? 'Post notice' : 'Notices'}</span>
            </div>
          </div>

          {/* Barangay pulse */}
          <div className="section-label">
            <h3>Barangay pulse</h3>
            <a onClick={() => navigate('/checkin')}>Details</a>
          </div>
          <div className="stat-grid">
            <div className="stat-card sc-safe">
              <div className="n">{safeCount}</div>
              <div className="l">Checked in safe</div>
            </div>
            <div className="stat-card sc-danger">
              <div className="n">{helpCount}</div>
              <div className="l">Need assistance</div>
            </div>
            <div className="stat-card sc-muted">
              <div className="n">{noResponseCount}</div>
              <div className="l">No response</div>
            </div>
            <div className="stat-card sc-accent">
              <div className="n">{resources.length}</div>
              <div className="l">Items shared</div>
            </div>
            <div className="stat-card sc-cool">
              <div className="n">{evacCenters.length}</div>
              <div className="l">Evac centers</div>
            </div>
          </div>

          {/* Nearby Resources */}
          <div className="section-label">
            <h3>Nearby on the resource board</h3>
            <a onClick={() => navigate('/board')}>See all</a>
          </div>
          <div className="card card-hover res-card" onClick={() => navigate('/board')}>
            <span className="res-ic cat-power">
              {getCategoryIcon('power')}
            </span>
            <div className="res-body">
              <div className="name">Gasoline-powered generator</div>
              <div className="owner">Shared by Mang Tonio · Purok 3</div>
            </div>
          </div>
        </div>

        <div className="dash-col">
          {isOfficial ? (
            <>
              {/* Check-in Overview for Officials */}
              <div className="section-label" style={{ marginTop: 0 }}>
                <h3>Check-in overview</h3>
                <a onClick={() => navigate('/checkin')}>View board</a>
              </div>
              <div className="card" style={{ marginBottom: 16 }}>
                <div className="row between">
                  <span style={{ fontWeight: 600, fontSize: '13.5px' }}>Purok 3 households</span>
                  <span className="small muted">{respondedCount} / {households.length} responded</span>
                </div>
                <div className="cap-bar" style={{ marginTop: 10 }}>
                  <div className="cap-fill" style={{ width: `${(respondedCount / households.length) * 100}%` }}></div>
                </div>
                <div className="row between" style={{ marginTop: 14 }}>
                  <span className="small" style={{ color: 'var(--danger)', fontWeight: 600 }}>{helpCount} households need help</span>
                  <button className="btn btn-danger btn-sm" onClick={() => navigate('/checkin')}>Respond</button>
                </div>
              </div>

              {/* Your Announcements */}
              <div className="section-label" style={{ marginTop: 0 }}>
                <h3>Your announcements</h3>
                <a onClick={() => navigate('/announcements')}>Manage</a>
              </div>
              <div className="card stack" style={{ gap: 0 }}>
                {allAnnouncements.slice(0, 2).map((ann, i) => (
                  <div key={i} className="ann-preview">
                    <span className="ann-dot" style={{ background: `var(--${ann.color})` }}></span>
                    <div>
                      <div className="t">{ann.text}</div>
                      <div className="time">Posted {ann.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Announcements for Residents */}
              <div className="section-label" style={{ marginTop: 0 }}>
                <h3>Barangay announcements</h3>
                <a onClick={() => navigate('/announcements')}>See all</a>
              </div>
              <div className="card stack" style={{ gap: 0 }}>
                {allAnnouncements.map((ann, i) => (
                  <div key={i} className="ann-preview">
                    <span className="ann-dot" style={{ background: `var(--${ann.color})` }}></span>
                    <div>
                      <div className="t">{ann.text}</div>
                      <div className="time">{ann.who} · {ann.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        .home-greeting {
          margin: 4px 0 18px;
          text-align: center;
        }
        .home-greeting h1 {
          font-size: 25px;
          font-weight: 600;
          line-height: 1.2;
          background: linear-gradient(115deg, var(--ink) 25%, var(--cool) 70%, var(--cool-2));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .home-greeting p {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 12.5px;
          font-weight: 600;
          margin-top: 7px;
        }

        .stat-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 6px;
        }
        .stat-card {
          position: relative;
          overflow: hidden;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 18px;
          padding: 16px 14px;
          text-align: center;
          box-shadow: var(--card-shadow);
          transition: transform 0.22s var(--ease), box-shadow 0.22s ease;
        }
        .stat-card::after {
          content: "";
          position: absolute;
          top: -26px;
          right: -26px;
          width: 78px;
          height: 78px;
          border-radius: 50%;
          opacity: 0.16;
        }
        .stat-card.sc-safe::after { background: var(--safe); }
        .stat-card.sc-danger::after { background: var(--danger); }
        .stat-card.sc-muted::after { background: var(--ink-soft); }
        .stat-card.sc-accent::after { background: var(--accent); }
        .stat-card.sc-cool::after { background: var(--cool); }
        .stat-card .n {
          position: relative;
          font-family: var(--font-display);
          font-size: 27px;
          font-weight: 600;
          line-height: 1.1;
        }
        .stat-card.sc-safe .n { color: var(--safe); }
        .stat-card.sc-danger .n { color: var(--danger); }
        .stat-card.sc-muted .n { color: var(--ink-soft); }
        .stat-card.sc-accent .n { color: var(--accent); }
        .stat-card.sc-cool .n { color: var(--cool); }
        .stat-card .l {
          position: relative;
          font-size: 11px;
          color: var(--ink-soft);
          font-weight: 600;
          margin-top: 5px;
        }
        @media (hover: hover) {
          .stat-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 16px 32px -12px rgba(21,35,61,0.3);
          }
        }

        .dash-grid { display: block; }
        .dash-col { min-width: 0; }

        @media (min-width: 760px) {
          .stat-grid { grid-template-columns: repeat(4, 1fr); }
        }

        @media (min-width: 900px) {
          .home-greeting {
            text-align: left;
            margin: 6px 0 24px;
          }
          .home-greeting h1 { font-size: 34px; }
          .dash-grid {
            display: grid;
            grid-template-columns: 1.6fr 1fr;
            gap: 28px;
            align-items: start;
          }
        }
      `}</style>
    </div>
  );
}
