import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAnnouncements } from '../hooks/useAnnouncements';
import { useCheckinBoard, timeAgo } from '../hooks/useCheckIns';
import { useWeatherAlerts } from '../hooks/useWeatherAlerts';
import { useMessages } from '../context/MessagesContext';
import Brand from './Brand';

// "6:40 PM" if it's today, otherwise "Oct 24, 6:40 PM"
function formatWhen(iso) {
  const d = new Date(iso);
  const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (d.toDateString() === new Date().toDateString()) return time;
  return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${time}`;
}

export default function TopBar({ user }) {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const displayUser = user || authUser;

  if (!displayUser) return null;

  const isOfficial = displayUser?.role === 'official';

  const [showNotifications, setShowNotifications] = useState(false);

  // Hooks must run unconditionally (before any early returns).
  const ann = useAnnouncements(displayUser?.barangayId ?? null);
  const weather = useWeatherAlerts(displayUser?.barangayId ?? null);
  const board = useCheckinBoard(displayUser, isOfficial);
  const { conversations } = useMessages();

  // Notification overview: all unread/active items
  const notifications = [];

  // Weather alerts
  if (weather.alerts.length > 0) {
    weather.alerts.forEach((alert) => {
      notifications.push({
        type: 'weather',
        title: alert.title,
        time: formatWhen(alert.issued_at),
        action: () => navigate('/weather-history'),
      });
    });
  }

  // New announcements (pinned or today)
  const recentAnn = ann.announcements.filter((a) =>
    a.pinned || (Date.now() - new Date(a.created_at).getTime() < 24 * 60 * 60 * 1000)
  );
  if (recentAnn.length > 0) {
    notifications.push({
      type: 'announcement',
      title: `${recentAnn.length} new announcement${recentAnn.length > 1 ? 's' : ''}`,
      time: timeAgo(recentAnn[0].created_at),
      action: () => navigate('/announcements'),
    });
  }

  // Help requests (officials only)
  const { counts } = board;
  const helpCount = counts.help;
  if (isOfficial && helpCount > 0) {
    notifications.push({
      type: 'help',
      title: `${helpCount} household${helpCount > 1 ? 's' : ''} need help`,
      time: 'Now',
      action: () => navigate('/checkin', { state: { filter: 'help' } }),
    });
  }

  // Unread messages. `conversations` arrives sorted by last_at desc, so [0] is newest.
  const unreadThreads = conversations.filter((c) => (c.unread_count || 0) > 0);
  if (unreadThreads.length > 0) {
    const totalUnread = unreadThreads.reduce((n, c) => n + c.unread_count, 0);
    const latest = unreadThreads[0];
    notifications.push({
      type: 'message',
      title: totalUnread === 1
        ? `New message from ${latest.other_name || 'a neighbor'}`
        : `${totalUnread} unread messages`,
      time: timeAgo(latest.last_at),
      action: () => navigate(`/messages${latest.other_id ? `?with=${latest.other_id}` : ''}`),
    });
  }

  const getCategoryIcon = (cat) => {
    const icons = {
      power: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2 3 14h7l-1 8 11-14h-8z"/></svg>,
      water: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3s6 7 6 11a6 6 0 1 1-12 0c0-4 6-11 6-11Z"/></svg>,
      tools: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 7l3 3m-8 8-3.5.5.5-3.5 8-8Z"/><path d="M17 4l3 3"/></svg>,
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
        {displayUser?.barangayName && <span className="brgy-pill topbar-brgy">{displayUser.barangayName}</span>}
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
            <span>{displayUser?.initials}</span>
          </div>
        </div>
      </div>
    </div>
  );
}