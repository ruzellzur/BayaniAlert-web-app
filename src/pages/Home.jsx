import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext'; // data still mocked for now
import Brand from '../components/Brand';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { announcements, households } = useApp();

  // Admins have no household or resident dashboard; send them to their own area.
  if (user?.role === 'admin') {
    return <Navigate to="/admin/approvals" replace />;
  }

  const isOfficial = user?.role === 'official';
  // Position-based permissions (see POSITION_PERMS in AuthContext / can_do() in SQL)
  const canAnnounce = !!user?.permissions?.announce;
  const canRescue = !!user?.permissions?.rescue;
  const showManage = isOfficial && canAnnounce;

  // Filter announcements for display
  const allAnnouncements = [...announcements, ...[
    { who: 'Kagawad Reyes', time: '25 min ago', text: 'Evacuation center at San Isidro Elementary is now open. Bring your family ID and essentials.', color: 'danger' },
    { who: 'Brgy. Captain Lira', time: '2 hr ago', text: 'Free rubber boots and candles available at the covered court while supplies last.', color: 'accent' },
    { who: 'Kagawad Reyes', time: 'Yesterday', text: 'Please clear drainage canals near your homes before Friday. Bagyo is expected to strengthen over the weekend.', color: 'safe' },
  ]].slice(0, 3);

  // Household stats for officials
  const safeCount = households.filter(h => h.status === 'safe').length;
  const helpCount = households.filter(h => h.status === 'help').length;
  const respondedCount = safeCount + helpCount;

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
    <div className="screen-enter" style={{ padding: '2px 20px 100px' }}>
      {/* Topbar */}
      <div className="topbar">
        <Brand />
        <div className="topbar-right">
          {user?.barangayName && <span className="brgy-pill">{user.barangayName}</span>}
          <button className="icon-btn" onClick={() => alert('No new notifications')} aria-label="Notifications">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.7 21a2 2 0 0 1-3.4 0"/>
            </svg>
          </button>
          <div className="top-avatar" onClick={() => navigate('/profile')}>
            <span>{user?.initials}</span>
          </div>
        </div>
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
              <span>{showManage ? 'Post notice' : 'Notices'}</span>
            </div>
          </div>

          {/* Nearby Resources */}
          <div className="section-label">
            <h3>Nearby on the resource board</h3>
            <a onClick={() => navigate('/board')}>See all</a>
          </div>
          <div className="card res-card" onClick={() => navigate('/board')} style={{ cursor: 'pointer' }}>
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
          {/* Check-in overview: all approved officials can view it */}
          {isOfficial && (
            <>
              <div className="section-label" style={{ marginTop: 0 }}>
                <h3>Check-in overview</h3>
                <a onClick={() => navigate('/checkin')}>View board</a>
              </div>
              <div className="card" style={{ marginBottom: 16 }}>
                <div className="row between">
                  <span style={{ fontWeight: 600, fontSize: '13.5px' }}>{user?.purokName || 'All puroks'} households</span>
                  <span className="small muted">{respondedCount} / {households.length} responded</span>
                </div>
                <div className="cap-bar" style={{ marginTop: 10 }}>
                  <div className="cap-fill" style={{ width: `${(respondedCount / households.length) * 100}%` }}></div>
                </div>
                <div className="row between" style={{ marginTop: 14 }}>
                  <span className="small" style={{ color: 'var(--danger)', fontWeight: 600 }}>{helpCount} households need help</span>
                  {/* Only rescue-capable positions can act on help requests */}
                  {canRescue && (
                    <button className="btn btn-danger btn-sm" onClick={() => navigate('/checkin')}>Respond</button>
                  )}
                </div>
              </div>
            </>
          )}

          {showManage ? (
            <>
              {/* Officials who can announce: manage view */}
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
              {/* Residents, and officials without announce permission: read-only view */}
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
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 18px 20px 14px;
          background: var(--bg);
          position: sticky;
          top: 0;
          z-index: 5;
        }
        .brand {
          display: flex;
          align-items: baseline;
          gap: 6px;
        }
        .brand .word {
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 19px;
        }
        .brand .word em {
          font-style: italic;
          color: var(--accent);
        }
        .brgy-pill {
          font-size: 12px;
          font-weight: 600;
          color: var(--ink-soft);
          background: var(--surface);
          border: 1px solid var(--border);
          padding: 6px 10px;
          border-radius: 999px;
          white-space: nowrap;
        }
        .topbar-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .icon-btn {
          width: 36px;
          height: 36px;
          border-radius: 11px;
          border: 1px solid var(--border);
          background: var(--surface);
          display: none;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--ink-soft);
        }
        .icon-btn svg {
          width: 17px;
          height: 17px;
        }
        .top-avatar {
          width: 36px;
          height: 36px;
          border-radius: 11px;
          background: var(--grad-cool);
          color: #fff;
          display: none;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
        }
        .dash-grid {
          display: block;
        }
        .dash-col {
          min-width: 0;
        }
        .quick-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin: 18px 0 6px;
        }
        .quick {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 12px 4px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 7px;
          font-size: 11px;
          font-weight: 600;
          color: var(--ink);
          cursor: pointer;
          text-align: center;
          transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
        }
        .quick .ic {
          width: 38px;
          height: 38px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--grad-accent);
          color: #fff;
          box-shadow: 0 4px 10px rgba(226,154,59,0.28);
        }
        .quick svg {
          width: 19px;
          height: 19px;
        }
        .section-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 22px 0 10px;
        }
        .section-label h3 {
          font-size: 15px;
          font-weight: 600;
        }
        .section-label a {
          font-size: 12.5px;
          font-weight: 600;
          color: var(--ink-soft);
          cursor: pointer;
        }
        .ann-preview {
          display: flex;
          gap: 11px;
          padding: 12px 0;
          border-top: 1px solid var(--border);
        }
        .ann-preview:first-child {
          border-top: none;
          padding-top: 0;
        }
        .ann-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-top: 6px;
          flex-shrink: 0;
        }
        .ann-preview .t {
          font-size: 13.5px;
          font-weight: 600;
          line-height: 1.35;
        }
        .ann-preview .time {
          font-size: 11px;
          color: var(--ink-soft);
          margin-top: 3px;
        }
        .res-card {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }
        .res-ic {
          width: 44px;
          height: 44px;
          border-radius: 13px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--grad-cool);
          color: #fff;
        }
        .res-ic svg {
          width: 21px;
          height: 21px;
        }
        .res-ic.cat-power {
          background: var(--grad-accent);
        }
        .res-body {
          flex: 1;
          min-width: 0;
        }
        .res-body .name {
          font-weight: 600;
          font-size: 14.5px;
        }
        .res-body .owner {
          font-size: 12px;
          color: var(--ink-soft);
          margin-top: 2px;
        }

        @media (min-width: 900px) {
          .topbar {
            padding: 26px 44px 20px;
          }
          .topbar .brand {
            display: none;
          }
          .icon-btn,
          .top-avatar {
            display: flex;
          }
          .dash-grid {
            display: grid;
            grid-template-columns: 1.65fr 1fr;
            gap: 26px;
            align-items: start;
          }
          .quick-grid {
            grid-template-columns: repeat(4, 1fr);
            max-width: 520px;
          }
        }
      `}</style>
    </div>
  );
}