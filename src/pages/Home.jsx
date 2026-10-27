import { Navigate, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAnnouncements } from '../hooks/useAnnouncements';
import { useCheckinBoard, timeAgo } from '../hooks/useCheckIns';
import { useWeatherAlerts, SEVERITY_LABEL } from '../hooks/useWeatherAlerts';
import { useNearbyResources } from '../hooks/useNearbyResources';
import { useMessages, threadPath } from '../context/MessagesContext';
import { useResources } from '../context/ResourceContext';
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
  const [showNotifications, setShowNotifications] = useState(false);

  const isOfficial = user?.role === 'official';
  const barangayId = user?.barangayId ?? null;

  // Hooks must run before the admin early return below.
  const board = useCheckinBoard(user, isOfficial); // only fetches for officials
  const ann = useAnnouncements(barangayId);
  const weather = useWeatherAlerts(barangayId);
  const resources = useNearbyResources(user, 3);
  const { conversations } = useMessages(); // this user's inbox, with unread counts
  const { incomingRequests } = useResources(); // requests other people made on my listings

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

  // Notification overview: all unread/active items
  const notifications = [];

  // Weather alerts
  if (weather.alerts.length > 0) {
    weather.alerts.forEach(alert => {
      notifications.push({
        type: 'weather',
        title: alert.title,
        time: formatWhen(alert.issued_at),
        action: () => navigate('/weather-history')
      });
    });
  }

  // New announcements (pinned or today)
  const recentAnn = ann.announcements.filter(a => {
    if (a.pinned) return true;
    const ageHours = (Date.now() - new Date(a.created_at)) / 3600000;
    return ageHours < 24;
  });
  if (recentAnn.length > 0) {
    notifications.push({
      type: 'announcement',
      title: `${recentAnn.length} new announcement${recentAnn.length > 1 ? 's' : ''}`,
      time: timeAgo(recentAnn[0].created_at),
      action: () => navigate('/announcements')
    });
  }

  // Help requests (officials only)
  if (isOfficial && helpCount > 0) {
    notifications.push({
      type: 'help',
      title: `${helpCount} household${helpCount > 1 ? 's' : ''} need help`,
      time: 'Now',
      action: () => navigate('/checkin', { state: { filter: 'help' } })
    });
  }

  // Unread messages. `conversations` arrives sorted by last_at desc, so [0] is newest.
  const unreadThreads = conversations.filter(c => (c.unread_count || 0) > 0);
  if (unreadThreads.length > 0) {
    const totalUnread = unreadThreads.reduce((n, c) => n + c.unread_count, 0);
    const latest = unreadThreads[0];
    notifications.push({
      type: 'message',
      title: totalUnread === 1
        ? `New message from ${latest.other_name || 'a neighbor'}`
        : `${totalUnread} unread messages`,
      time: timeAgo(latest.last_at),
      action: () => navigate(threadPath(latest.last_listing_id, latest.other_id))
    });
  }

  // Requests other people made on my listings that still need my answer.
  const pendingIncoming = incomingRequests.filter(r => r.status === 'pending');
  if (pendingIncoming.length > 0) {
    notifications.push({
      type: 'request',
      title: `${pendingIncoming.length} request${pendingIncoming.length > 1 ? 's' : ''} waiting on you`,
      time: timeAgo(pendingIncoming[0].createdAt),
      action: () => navigate('/requests')
    });
  }

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
        {/* Barangay pill: desktop-only, sits in the left slot where Brand hides */}
        {user?.barangayName && <span className="brgy-pill topbar-brgy">{user.barangayName}</span>}
        <div className="topbar-right">
          {/* Notification Bell */}
          <div className="notif-bell-wrapper">
            <button
              className="notif-bell"
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Notifications"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {notifications.length > 0 && <span className="notif-badge">{notifications.length}</span>}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <>
                <div className="notif-backdrop" onClick={() => setShowNotifications(false)} />
                <div className="notif-dropdown">
                  <div className="notif-header">
                    <h3>Notifications</h3>
                    <button onClick={() => setShowNotifications(false)}>✕</button>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="notif-empty">All caught up! 🎉</div>
                  ) : (
                    <div className="notif-list">
                      {notifications.map((notif, i) => (
                        <div
                          key={i}
                          className="notif-item"
                          onClick={() => {
                            notif.action();
                            setShowNotifications(false);
                          }}
                        >
                          <span className={`notif-icon ${notif.type === 'weather' ? 'alert'
                            : notif.type === 'announcement' ? 'announce'
                              : notif.type === 'message' ? 'msg'
                                : notif.type === 'request' ? 'req'
                                  : 'help'}`}>
                            {notif.type === 'weather' && (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"/>
                                <path d="M8 16h.01M8 20h.01M12 18h.01M12 22h.01M16 16h.01M16 20h.01"/>
                              </svg>
                            )}
                            {notif.type === 'announcement' && (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                                <path d="M2 17l10 5 10-5"/>
                                <path d="M2 12l10 5 10-5"/>
                              </svg>
                            )}
                            {notif.type === 'help' && (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                                <line x1="12" y1="17" x2="12.01" y2="17"/>
                              </svg>
                            )}
                            {notif.type === 'message' && (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                              </svg>
                            )}
                            {notif.type === 'request' && (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                                <rect x="8" y="2" width="8" height="4" rx="1"/>
                                <path d="M9 13h6M9 17h4"/>
                              </svg>
                            )}
                          </span>
                          <div className="notif-content">
                            <div className="notif-title">{notif.title}</div>
                            <div className="notif-time">{notif.time}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

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
        .topbar-brgy {
          display: none; /* mobile: the pill never appears in the topbar */
        }
        .topbar-right {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-left: auto; /* stay pinned to the right even when .brand is hidden */
        }
        .top-avatar {
          width: 36px;
          height: 36px;
          border-radius: 11px;
          background: var(--grad-cool);
          color: #fff;
          display: flex;
          flex-shrink: 0;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(111,168,216,0.28);
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
          transition: transform 0.15s ease, border-color 0.15s ease;
        }
        .quick .ic {
          width: 38px;
          height: 38px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--accent);
          color: #fff;
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
          background: var(--grad-accent);
          color: #fff;
          box-shadow: 0 4px 12px rgba(226,154,59,0.28);
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

        /* Notification bell */
        .notif-bell-wrapper {
          position: relative;
        }
        .notif-bell {
          width: 36px;
          height: 36px;
          border-radius: 11px;
          border: 1px solid var(--border);
          background: var(--surface);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          position: relative;
          transition: background 0.15s ease, border-color 0.15s ease;
        }
        .notif-bell:hover {
          background: var(--surface-alt);
          border-color: var(--accent);
        }
        .notif-bell svg {
          width: 18px;
          height: 18px;
          color: var(--ink-soft);
        }
        .notif-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          min-width: 18px;
          height: 18px;
          border-radius: 999px;
          background: var(--danger);
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
          border: 2px solid var(--bg);
        }
        .notif-backdrop {
          position: fixed;
          inset: 0;
          z-index: 998;
        }
        .notif-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 320px;
          max-width: calc(100vw - 40px);
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          box-shadow: 0 12px 32px rgba(27,42,74,0.18);
          z-index: 999;
          overflow: hidden;
        }
        .notif-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 14px 16px;
          border-bottom: 1px solid var(--border);
          font-weight: 600;
          font-size: 14px;
        }
        .notif-header h3 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
        }
        .notif-header button {
          width: 26px;
          height: 26px;
          border: none;
          border-radius: 8px;
          background: var(--surface-alt);
          color: var(--ink-soft);
          font-size: 12px;
          line-height: 1;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .notif-header button:hover {
          background: var(--danger-bg);
          color: var(--danger);
        }
        .notif-list {
          max-height: 360px;
          overflow-y: auto;
        }
        .notif-item {
          display: flex;
          gap: 12px;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border);
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .notif-item:last-child {
          border-bottom: none;
        }
        .notif-item:hover {
          background: var(--surface-alt);
        }
        .notif-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 16px;
        }
        .notif-icon.alert {
          background: var(--danger-bg);
          color: var(--danger);
        }
        .notif-icon svg {
          width: 18px;
          height: 18px;
        }
        .notif-icon.announce {
          background: var(--grad-accent);
          color: #fff;
        }
        .notif-icon.help {
          background: rgba(111,168,216,0.15);
          color: var(--cool);
        }
        .notif-icon.msg {
          background: var(--grad-cool);
          color: #fff;
        }
        .notif-icon.req {
          background: var(--accent-soft);
          color: var(--ladder-ink);
        }
        .notif-content {
          flex: 1;
          min-width: 0;
        }
        .notif-title {
          font-weight: 600;
          font-size: 13px;
          line-height: 1.35;
        }
        .notif-time {
          font-size: 11px;
          color: var(--ink-soft);
          margin-top: 2px;
        }
        .notif-empty {
          padding: 32px 16px;
          text-align: center;
          color: var(--ink-soft);
          font-size: 13px;
        }

        @media (min-width: 900px) {
          .topbar {
            padding: 26px 44px 20px;
          }
          .topbar .brand {
            display: none;
          }
          .topbar-brgy {
            display: inline-block; /* desktop: pill takes the left slot */
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