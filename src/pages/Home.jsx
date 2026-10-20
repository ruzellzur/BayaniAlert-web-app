import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button, Card, Tag } from '../components/ui';
import { PageContainer, Section } from '../components/layout/PageContainer';
import Brand from '../components/Brand';

/**
 * Home Page - Refactored with new UI components
 *
 * Main dashboard showing weather alerts, quick actions, resources, and announcements.
 * Different views for residents vs officials.
 */
export default function Home() {
  const navigate = useNavigate();
  const { user, resources, announcements, households } = useApp();

  const isOfficial = user?.role === 'official';
  const isAdmin = user?.role === 'admin';

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

  const quickActions = [
    {
      label: isOfficial ? 'Check-ins' : 'Check in',
      route: '/checkin',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      ),
    },
    {
      label: 'Resources',
      route: '/board',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 7H4v13h16z" />
          <path d="M16 3v8M8 3v8M4 11h16" />
        </svg>
      ),
    },
    {
      label: 'Map',
      route: '/map',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 20 3 17V4l6 3 6-3 6 3v13l-6-3-6 3Z" />
          <path d="M9 4v13M15 7v13" />
        </svg>
      ),
    },
    {
      label: isOfficial ? 'Post notice' : 'Notices',
      route: '/announcements',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 11v3a1 1 0 0 0 1 1h2l4 4V6L6 10H4a1 1 0 0 0-1 1Z" />
          <path d="M16 8a4 4 0 0 1 0 8" />
        </svg>
      ),
    },
  ];

  return (
    <PageContainer variant="dashboard" className="home-page">
      {/* Topbar */}
      <div className="topbar">
        <Brand />
        <div className="topbar-right">
          <span className="brgy-pill">Brgy. San Isidro</span>
          <button
            className="icon-btn"
            onClick={() => alert('No new notifications')}
            aria-label="Notifications"
          >
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

      {/* Dashboard Grid */}
      <div className="dash-grid">
        <div className="dash-col">
          {/* Weather Alert */}
          <Card
            interactive
            onClick={() => navigate('/weather-history')}
            style={{
              background: 'var(--grad-primary)',
              color: '#fff',
              position: 'relative',
              overflow: 'hidden',
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
                <span className="signal-badge">SIG 2</span>
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
            <div style={{
              position: 'absolute',
              right: '-30px',
              top: '-30px',
              width: '140px',
              height: '140px',
              background: 'radial-gradient(circle, rgba(226,154,59,0.35), transparent 70%)',
            }} />
          </Card>

          {/* Quick Actions */}
          <div className="quick-grid">
            {quickActions.map((action, i) => (
              <div key={i} className="quick" onClick={() => navigate(action.route)}>
                <span className="ic">{action.icon}</span>
                <span>{action.label}</span>
              </div>
            ))}
          </div>

          {/* Nearby Resources */}
          <Section title="Nearby on the resource board" action={() => navigate('/board')} actionLabel="See all">
            <Card interactive onClick={() => navigate('/board')}>
              <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                <span className="res-ic cat-power" style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--grad-accent)',
                  color: '#fff',
                  flexShrink: 0,
                }}>
                  {getCategoryIcon('power')}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-md)' }}>
                    Gasoline-powered generator
                  </div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-soft)', marginTop: 'var(--space-1)' }}>
                    Shared by Mang Tonio · Purok 3
                  </div>
                </div>
              </div>
            </Card>
          </Section>
        </div>

        <div className="dash-col">
          {isOfficial ? (
            <>
              {/* Check-in Overview for Officials */}
              <Section title="Check-in overview" action={() => navigate('/checkin')} actionLabel="View board">
                <Card padding="md">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                    <span style={{ fontWeight: 600, fontSize: 'var(--text-base)' }}>Purok 3 households</span>
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-soft)' }}>
                      {respondedCount} / {households.length} responded
                    </span>
                  </div>
                  <div className="cap-bar">
                    <div
                      className="cap-fill"
                      style={{ width: `${(respondedCount / households.length) * 100}%` }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-4)' }}>
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--danger)', fontWeight: 600 }}>
                      {helpCount} households need help
                    </span>
                    <Button variant="danger" size="sm" onClick={() => navigate('/checkin')}>
                      Respond
                    </Button>
                  </div>
                </Card>
              </Section>

              {/* Your Announcements */}
              <Section title="Your announcements" action={() => navigate('/announcements')} actionLabel="Manage">
                <Card padding="md">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {allAnnouncements.slice(0, 2).map((ann, i) => (
                      <div key={i} className="ann-preview">
                        <span className="ann-dot" style={{ background: `var(--${ann.color})` }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 'var(--text-base)', fontWeight: 600, lineHeight: 1.35 }}>
                            {ann.text}
                          </div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-soft)', marginTop: 'var(--space-1)' }}>
                            Posted {ann.time}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </Section>
            </>
          ) : (
            <>
              {/* Announcements for Residents */}
              <Section title="Barangay announcements" action={() => navigate('/announcements')} actionLabel="See all">
                <Card padding="md">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {allAnnouncements.map((ann, i) => (
                      <div key={i} className="ann-preview">
                        <span className="ann-dot" style={{ background: `var(--${ann.color})` }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 'var(--text-base)', fontWeight: 600, lineHeight: 1.35 }}>
                            {ann.text}
                          </div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-soft)', marginTop: 'var(--space-1)' }}>
                            {ann.who} · {ann.time}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </Section>
            </>
          )}
        </div>
      </div>

      <style>{`
        .home-page {
          padding-bottom: 100px;
        }

        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-3);
          padding: var(--space-5) var(--space-5) var(--space-4);
          background: var(--bg);
          position: sticky;
          top: 0;
          z-index: var(--z-sticky);
        }

        .brgy-pill {
          font-size: var(--text-sm);
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
          gap: var(--space-3);
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
          transition: all 0.15s ease;
        }

        .icon-btn:hover {
          border-color: var(--accent);
          color: var(--accent);
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
          font-size: var(--text-sm);
          cursor: pointer;
          transition: transform 0.15s ease;
        }

        .top-avatar:hover {
          transform: scale(1.05);
        }

        .dash-grid {
          display: block;
        }

        .dash-col {
          min-width: 0;
        }

        .signal-badge {
          background: var(--grad-accent);
          color: var(--accent-ink);
          font-weight: 700;
          font-size: var(--text-sm);
          padding: 6px 11px;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(226,154,59,0.35);
        }

        .quick-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-3);
          margin: var(--space-5) 0 var(--space-2);
        }

        .quick {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: var(--space-3) 4px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--ink);
          cursor: pointer;
          text-align: center;
          transition: all 0.15s ease;
        }

        .quick:hover {
          border-color: var(--accent);
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(226,154,59,0.18);
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

        .quick .ic svg {
          width: 19px;
          height: 19px;
        }

        .cap-bar {
          height: 9px;
          border-radius: 999px;
          background: var(--surface-alt);
          overflow: hidden;
          box-shadow: inset 0 1px 3px rgba(0,0,0,0.10);
        }

        .cap-fill {
          height: 100%;
          border-radius: 999px;
          background: var(--grad-safe);
          transition: width var(--duration-base) var(--ease-out);
        }

        .ann-preview {
          display: flex;
          gap: var(--space-3);
          padding: var(--space-3) 0;
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

        @media (min-width: 900px) {
          .topbar {
            padding: var(--space-6) 44px var(--space-5);
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
            gap: var(--space-6);
            align-items: start;
            padding: 0 44px;
          }

          .quick-grid {
            grid-template-columns: repeat(4, 1fr);
            max-width: 520px;
          }
        }
      `}</style>
    </PageContainer>
  );
}
