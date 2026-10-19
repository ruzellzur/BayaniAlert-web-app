import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Announcements() {
  const navigate = useNavigate();
  const { user, announcements, addAnnouncement, deleteAnnouncement, evacCenters } = useApp();
  const [search, setSearch] = useState('');
  const [view, setView] = useState(user?.role === 'official' ? 'official' : 'resident');
  const [composeText, setComposeText] = useState('');

  const isOfficial = user?.role === 'official';
  const canAnnounce = user?.permissions?.announce;

  // Combine user announcements with base announcements
  const allAnnouncements = [
    ...announcements,
    { who: 'Kagawad Reyes', time: '25 min ago', text: 'Evacuation center at San Isidro Elementary is now open. Bring your family ID and essentials.', color: 'danger' },
    { who: 'Brgy. Captain Lira', time: '2 hr ago', text: 'Free rubber boots and candles available at the covered court while supplies last.', color: 'accent' },
    { who: 'Kagawad Reyes', time: 'Yesterday', text: 'Please clear drainage canals near your homes before Friday. Bagyo is expected to strengthen over the weekend.', color: 'safe' },
  ];

  const filteredAnnouncements = allAnnouncements.filter(a =>
    !search || a.text.toLowerCase().includes(search.toLowerCase()) || a.who.toLowerCase().includes(search.toLowerCase())
  );

  const handlePost = () => {
    if (!composeText.trim()) {
      alert('Write something to post first');
      return;
    }
    addAnnouncement(composeText.trim());
    setComposeText('');
  };

  const e0 = evacCenters[0] || { cap: 0, max: 400 };

  return (
    <div className="screen-enter" style={{ padding: '2px 20px 100px' }}>
      {/* Topbar */}
      <div className="topbar">
        <div className="row" style={{ gap: 12 }}>
          <button className="btn-ghost btn btn-sm mobile-back" onClick={() => navigate('/home')} aria-label="Go back" style={{ padding: '8px 10px' }}>←</button>
          <h2 style={{ fontSize: 17 }}>Announcements</h2>
        </div>
      </div>

      <div className="ann-grid">
        <div>
          {/* Role Switcher */}
          <div className="role-switch">
            <button className={view === 'resident' ? 'active' : ''} onClick={() => setView('resident')}>Resident view</button>
            <button className={view === 'official' ? 'active' : ''} onClick={() => setView('official')}>Official view</button>
          </div>

          {/* Capacity Widget */}
          <div className="card">
            <div className="row between">
              <span style={{ fontWeight: 600, fontSize: '13.5px' }}>Evacuation center capacity</span>
              <span className="small muted">{e0.cap} / {e0.max}</span>
            </div>
            <div className="cap-bar">
              <div className="cap-fill" style={{ width: `${(e0.cap / e0.max) * 100}%` }}></div>
            </div>
          </div>

          {/* Compose Form (Officials Only) */}
          {view === 'official' && canAnnounce && (
            <div style={{ marginTop: 16 }}>
              <div className="card stack">
                <textarea
                  className="compose"
                  rows={3}
                  placeholder="Post an update for the barangay…"
                  value={composeText}
                  onChange={(e) => setComposeText(e.target.value)}
                />
                <button className="btn btn-accent btn-block" onClick={handlePost}>Post announcement</button>
              </div>
            </div>
          )}
        </div>

        <div>
          {/* Search */}
          <input
            type="text"
            placeholder="Search announcements…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              marginBottom: 12,
              padding: '11px 14px',
              borderRadius: 12,
              border: '1.5px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--ink)',
              fontFamily: 'var(--font-body)',
              fontSize: 13.5
            }}
          />

          {/* Announcement Feed */}
          <div className="card" id="annFeed">
            {filteredAnnouncements.length === 0 ? (
              <p className="small muted" style={{ textAlign: 'center', padding: '14px 0' }}>No announcements match your search.</p>
            ) : (
              filteredAnnouncements.map((ann, i) => (
                <div key={i} className="post">
                  <div className="post-head">
                    <span className="who">{ann.who}</span>
                    <span className="time">{ann.time}</span>
                    {i < announcements.length && canAnnounce && (
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--danger)', padding: '4px 8px', marginLeft: 'auto' }}
                        onClick={() => {
                          if (confirm('Delete this announcement?')) {
                            deleteAnnouncement(i);
                          }
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <p>{ann.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style>{`
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 18px 20px 14px;
        }
        .ann-grid {
          display: block;
        }
        .cap-bar {
          height: 9px;
          border-radius: 999px;
          background: var(--surface-alt);
          overflow: hidden;
          margin-top: 10px;
          box-shadow: inset 0 1px 3px rgba(0,0,0,0.10);
        }
        .cap-fill {
          height: 100%;
          border-radius: 999px;
          background: var(--grad-safe);
        }
        .post {
          padding: 14px 0;
          border-top: 1px solid var(--border);
        }
        .post:first-child {
          border-top: none;
          padding-top: 0;
        }
        .post-head {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }
        .post-head .who {
          font-weight: 600;
          font-size: 13.5px;
        }
        .post-head .time {
          font-size: 11px;
          color: var(--ink-soft);
        }
        .post p {
          font-size: 13.5px;
          line-height: 1.5;
          color: var(--ink);
        }
        .role-switch {
          display: flex;
          background: var(--surface-alt);
          border-radius: 12px;
          padding: 3px;
          margin-bottom: 16px;
        }
        .role-switch button {
          flex: 1;
          border: none;
          background: transparent;
          padding: 9px;
          border-radius: 10px;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--ink-soft);
          cursor: pointer;
        }
        .role-switch button.active {
          background: var(--surface);
          color: var(--ink);
          box-shadow: 0 2px 6px rgba(0,0,0,0.06);
        }
        textarea.compose {
          width: 100%;
          border: 1.5px solid var(--border);
          border-radius: 14px;
          padding: 12px;
          font-family: var(--font-body);
          font-size: 13.5px;
          resize: none;
          background: var(--surface);
          color: var(--ink);
        }

        @media (min-width: 900px) {
          .topbar {
            padding: 26px 0 20px;
          }
          .ann-grid {
            display: grid;
            grid-template-columns: 1fr 1.5fr;
            gap: 26px;
            align-items: start;
          }
          .ann-grid > div:first-child .card {
            position: sticky;
            top: 100px;
          }
        }
      `}</style>
    </div>
  );
}
