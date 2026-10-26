import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAnnouncements } from '../hooks/useAnnouncements';
import { useCheckinBoard, timeAgo } from '../hooks/useCheckIns';
import { useWeatherAlerts, SEVERITY_LABEL } from '../hooks/useWeatherAlerts';
import { useNearbyResources } from '../hooks/useNearbyResources';
import { formatDistance } from '../utils/geo';
import Brand from '../components/Brand';

// "6:40 PM" if it's today, otherwise "Oct 24, 6:40 PM"
function formatWhen(iso) {
  const d = new Date(iso);
  const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (d.toDateString() === new Date().toDateString()) return time;
  return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${time}`;
}

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const SOURCE_LABEL = { 'open-meteo': 'Open-Meteo', barangay: 'Barangay' };

function AnnPreview({ a }) {
  return (
    <div className="ann-preview">
      <span
        className="ann-dot"
        style={{ background: a.pinned ? 'var(--danger)' : 'var(--accent)' }}
      ></span>
      <div style={{ minWidth: 0 }}>
        <div className="t">{a.title}</div>
        <div className="b">{a.body}</div>
        <div className="time">
          {a.pinned ? '📌 ' : ''}{a.who} · {timeAgo(a.created_at)}
        </div>
      </div>
    </div>
  );
}

const Empty = ({ children, danger }) => (
  <p
    className={`small ${danger ? '' : 'muted'}`}
    style={{ textAlign: 'center', padding: '10px 0', color: danger ? 'var(--danger)' : undefined }}
  >
    {children}
  </p>
);

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const isOfficial = user?.role === 'official';
  const barangayId = user?.barangayId ?? null;

  // Hooks must run before the admin early return below.
  const board = useCheckinBoard(user, isOfficial); // only fetches for officials
  const ann = useAnnouncements(barangayId);
  const weather = useWeatherAlerts(barangayId);
  const resources = useNearbyResources(user, 3);

  // Admins have no household or resident dashboard; send them to their own area.
  if (user?.role === 'admin') {
    return <Navigate to="/admin/approvals" replace />;
  }

  // Position-based permissions (see POSITION_PERMS in AuthContext / can_do() in SQL)
  const canAnnounce = !!user?.permissions?.announce;
  const canRescue = !!user?.permissions?.rescue;
  const showManage = isOfficial && canAnnounce;

  // Check-in stats for officials
  const { counts } = board;
  const helpCount = counts.help;
  const respondedCount = counts.responded;
  const pct = counts.total ? (counts.responded / counts.total) * 100 : 0;

  // Announcements: the hook already sorts pinned first, then newest
  const previews = ann.announcements.slice(0, showManage ? 2 : 3);

  const top = weather.top;
  const weatherTitle = weather.loading
    ? 'Checking for alerts…'
    : weather.error
      ? 'Could not load weather alerts'
      : top
        ? top.title
        : 'No active weather alerts';

  const getCategoryIcon = (cat) => {
    const icons = {
      power: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2 3 14h7l-1 8 11-14h-8z"/></svg>,
      water: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3s6 7 6 11a6 6 0 1 1-12 0c0-4 6-11 6-11Z"/></svg>,
      tools: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 7l3 3-8 8-3.5.5.5-3.5 8-8Z"/><path d="M17 4l3 3"/></svg>,
      medicine: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="7" width="18" height="12" rx="2"/><path d="M12 10v6M9 13h6"/></svg>,
      transport: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="10" width="18" height="7" rx="2"/><circle cx="7.5" cy="18.5" r="1.5"/><circle cx="16.5" cy="18.5" r="1.5"/></svg>,
      food: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 3v7a2 2 0 0 0 2 2v9"/><path d="M10 3v7"/><path d="M16 3c-2 1-3 3.5-3 6s1 3 3 3v9"/></svg>,
      shelter: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/></svg>,
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
          <div className="top-avatar" onClick={() => navigate('/profile')}>
            <span>{user?.initials}</span>
          </div>
        </div>
      </div>

      <div className="dash-grid">
        <div className="dash-col">
          {/* Weather advisory (read-only; TODO: let officials post alerts) */}
          <div className="alert-card" onClick={() => navigate('/weather-history')} style={{ cursor: 'pointer' }}>
            <div className="alert-top home-alert-top">
              <div className="home-alert-content">
                <div className="small" style={{ color: '#B9C4DA' }}>
                  Weather advisory{weather.alerts.length > 1 ? ` · ${weather.alerts.length} active` : ''}
                </div>
                <h3>{weatherTitle}</h3>
                {top?.body && <p className="alert-body">{top.body}</p>}
              </div>
              <span className="signal-badge home-alert-status">{top ? SEVERITY_LABEL[top.severity] : 'CLEAR'}</span>
            </div>
            {top && (
              <div className="alert-meta">
                <div>Issued<strong>{formatWhen(top.issued_at)}</strong></div>
                <div>Source<strong>{SOURCE_LABEL[top.source] ?? capitalize(top.source)}</strong></div>
                <div>Expires<strong>{top.expires_at ? formatWhen(top.expires_at) : 'Until lifted'}</strong></div>
              </div>
            )}
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

          {/* Resource board */}
          <div className="section-label">
            <h3>{resources.hasOrigin ? 'Nearby on the resource board' : 'Latest on the resource board'}</h3>
            <a onClick={() => navigate('/board')}>See all</a>
          </div>
          <div className="card">
            {!barangayId ? (
              <Empty>Your account isn't linked to a barangay.</Empty>
            ) : resources.loading ? (
              <Empty>Loading…</Empty>
            ) : resources.error ? (
              <Empty danger>{resources.error}</Empty>
            ) : resources.items.length === 0 ? (
              <Empty>Nothing is listed on the board right now.</Empty>
            ) : (
              resources.items.map((r) => (
                <div key={r.id} className="res-row" onClick={() => navigate('/board')}>
                  <span className={`res-ic cat-${r.category}`}>{getCategoryIcon(r.category)}</span>
                  <div className="res-body">
                    <div className="name">{r.title}</div>
                    <div className="owner">
                      {[
                        `Shared by ${r.ownerName}`,
                        r.purokName,
                        r.distance != null ? formatDistance(r.distance) : null,
                      ].filter(Boolean).join(' · ')}
                    </div>
                  </div>
                </div>
              ))
            )}
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
                {board.error ? (
                  <p className="small" style={{ color: 'var(--danger)' }}>{board.error}</p>
                ) : (
                  <>
                    <div className="row between">
                      <span style={{ fontWeight: 600, fontSize: '13.5px' }}>{user?.purokName || 'All puroks'} households</span>
                      <span className="small muted">
                        {board.loading ? '…' : `${respondedCount} / ${counts.total} responded`}
                      </span>
                    </div>
                    <div className="cap-bar" style={{ marginTop: 10 }}>
                      <div className="cap-fill" style={{ width: `${pct}%` }}></div>
                    </div>
                    <div className="row between" style={{ marginTop: 14 }}>
                      <span
                        className="small"
                        style={{ color: helpCount ? 'var(--danger)' : 'var(--ink-soft)', fontWeight: 600 }}
                      >
                        {helpCount === 1 ? '1 household needs help' : `${helpCount} households need help`}
                      </span>
                      {/* Only rescue-capable positions can act on help requests */}
                      {canRescue && helpCount > 0 && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => navigate('/checkin', { state: { filter: 'help' } })}
                        >
                          Respond
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {/* Announcements */}
          <div className="section-label" style={{ marginTop: 0 }}>
            <h3>{showManage ? 'Latest announcements' : 'Barangay announcements'}</h3>
            <a onClick={() => navigate('/announcements')}>{showManage ? 'Manage' : 'See all'}</a>
          </div>
          <div className="card stack" style={{ gap: 0 }}>
            {!barangayId ? (
              <Empty>Your account isn't linked to a barangay.</Empty>
            ) : ann.loading ? (
              <Empty>Loading…</Empty>
            ) : ann.error ? (
              <Empty danger>{ann.error}</Empty>
            ) : previews.length === 0 ? (
              <Empty>No announcements yet.</Empty>
            ) : (
              previews.map((a) => <AnnPreview key={a.id} a={a} />)
            )}
          </div>
        </div>
      </div>

      <style>{`
        .home-alert-top {
          gap: 12px;
          flex-wrap: wrap;
        }
        .home-alert-content {
          flex: 1 1 200px;
          min-width: 0;
        }
        .home-alert-status {
          flex: 0 0 auto;
          align-self: center;
          white-space: nowrap;
        }
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
        .alert-body {
          font-size: 12.5px;
          line-height: 1.4;
          color: #B9C4DA;
          margin-top: 6px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
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
        .ann-preview .b {
          font-size: 12.5px;
          color: var(--ink);
          line-height: 1.4;
          margin-top: 2px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .ann-preview .time {
          font-size: 11px;
          color: var(--ink-soft);
          margin-top: 3px;
        }
        .res-row {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          padding: 12px 0;
          border-top: 1px solid var(--border);
          cursor: pointer;
        }
        .res-row:first-child {
          border-top: none;
          padding-top: 0;
        }
        .res-row:last-child {
          padding-bottom: 0;
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