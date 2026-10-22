import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/app-context';

export default function Announcements() {
  const navigate = useNavigate();
  const { user, announcements, addAnnouncement, deleteAnnouncement, evacCenters } = useApp();
  const [search, setSearch] = useState('');
  const [view, setView] = useState(user?.role === 'official' ? 'official' : 'resident');
  const [composeText, setComposeText] = useState('');


  const canAnnounce = user?.permissions?.announce;

  // The context already seeds the base announcements alongside locally posted ones.
  const allAnnouncements = announcements;

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
    <div className="screen-enter">
      {/* Topbar */}
      <div className="topbar">
        <div className="row" style={{ gap: 12 }}>
          <button className="btn-ghost btn btn-sm mobile-back" onClick={() => navigate('/home')} aria-label="Go back" style={{ padding: '8px 10px' }}>←</button>
          <h2 style={{ fontSize: 17 }}>Announcements</h2>
        </div>
      </div>

      <div className="ann-grid">
        <div className="ann-side">
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
              <div
                className="cap-fill"
                style={{
                  width: `${(e0.cap / e0.max) * 100}%`,
                  background: e0.cap / e0.max > 0.9 ? 'var(--grad-danger)' : 'var(--grad-safe)'
                }}
              ></div>
            </div>
          </div>

          {/* Compose Form (Officials Only) */}
          {view === 'official' && canAnnounce && (
            <div className="card compose-card stack">
              <textarea
                className="compose"
                rows={3}
                placeholder="Post an update for the barangay…"
                value={composeText}
                onChange={(e) => setComposeText(e.target.value)}
              />
              <button className="btn btn-accent btn-block" onClick={handlePost}>Post announcement</button>
            </div>
          )}
        </div>

        <div>
          {/* Search */}
          <input
            type="text"
            className="search-input"
            placeholder="Search announcements…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Announcement Feed */}
          <div className="card" id="annFeed">
            {filteredAnnouncements.length === 0 ? (
              <div className="empty-state">
                <span className="ic">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 11v3a1 1 0 0 0 1 1h2l4 4V6L6 10H4a1 1 0 0 0-1 1Z"/>
                    <path d="M16 8a4 4 0 0 1 0 8"/>
                  </svg>
                </span>
                <h4>Nothing to read yet</h4>
                <p>No announcements match your search. Try a different keyword.</p>
              </div>
            ) : (
              filteredAnnouncements.map((ann, i) => (
                <div key={i} className="post">
                  <span className="post-avatar">{ann.who.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}</span>
                  <div className="post-main">
                    <div className="post-head">
                      <span className="who">{ann.who}</span>
                      <span className="post-role">Official</span>
                      <span className="time">{ann.time}</span>
                      {i < announcements.length && canAnnounce && (
                        <button
                          className="btn btn-ghost btn-sm post-del"
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
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style>{`
        .ann-grid {
          display: block;
        }
        .ann-side {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .ann-side .card { position: static; }

        .compose-card {
          position: relative;
          overflow: hidden;
          background:
            radial-gradient(120% 100% at 100% 0%, var(--accent-soft), transparent 55%),
            var(--surface);
        }

        .post {
          display: flex;
          gap: 12px;
          padding: 15px 0;
          border-top: 1px solid var(--border);
        }
        .post:first-child { border-top: none; padding-top: 0; }
        .post-avatar {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 13px;
          color: #fff;
          background: var(--grad-primary);
          box-shadow: 0 5px 14px -6px rgba(21,35,61,0.7);
        }
        .post-main { flex: 1; min-width: 0; }
        .post-head {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 5px;
          flex-wrap: wrap;
        }
        .post-head .who { font-weight: 700; font-size: 13.5px; }
        .post-head .time { font-size: 11px; color: var(--ink-soft); }
        .post p { font-size: 13.5px; line-height: 1.55; color: var(--ink); }
        .post-role {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          background: var(--accent-soft);
          color: var(--accent);
          padding: 3px 8px;
          border-radius: 999px;
        }

        @media (min-width: 900px) {
          .ann-grid {
            display: grid;
            grid-template-columns: 1fr 1.6fr;
            gap: 30px;
            align-items: start;
          }
          .ann-side .card { position: sticky; top: 28px; }
        }

      `}</style>
    </div>
  );
}
