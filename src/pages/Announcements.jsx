import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button, Card, Input } from '../components/ui';
import { PageContainer, Section } from '../components/layout/PageContainer';

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
    <PageContainer>
      {/* Topbar */}
      <div className="ann-topbar">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/home')}
          aria-label="Go back"
        >
          ←
        </Button>
        <h2>Announcements</h2>
      </div>

      {/* Role Switcher */}
      <div className="role-switch">
        <button
          className={view === 'resident' ? 'active' : ''}
          onClick={() => setView('resident')}
        >
          Resident view
        </button>
        <button
          className={view === 'official' ? 'active' : ''}
          onClick={() => setView('official')}
        >
          Official view
        </button>
      </div>

      <div className="ann-grid">
        <div>
          {/* Capacity Widget */}
          <Card padding="md">
            <div className="cap-header">
              <span className="cap-label">Evacuation center capacity</span>
              <span className="cap-value">{e0.cap} / {e0.max}</span>
            </div>
            <div className="cap-bar">
              <div
                className="cap-fill"
                style={{ width: `${(e0.cap / e0.max) * 100}%` }}
              />
            </div>
          </Card>

          {/* Compose Form (Officials Only) */}
          {view === 'official' && canAnnounce && (
            <Card padding="md" className="compose-card">
              <textarea
                className="compose-textarea"
                rows={3}
                placeholder="Post an update for the barangay…"
                value={composeText}
                onChange={(e) => setComposeText(e.target.value)}
              />
              <Button
                variant="accent"
                block
                onClick={handlePost}
                disabled={!composeText.trim()}
              >
                Post announcement
              </Button>
            </Card>
          )}
        </div>

        <div>
          {/* Search */}
          <Input
            placeholder="Search announcements…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Announcement Feed */}
          <Card padding="md">
            {filteredAnnouncements.length === 0 ? (
              <p className="empty-state">No announcements match your search.</p>
            ) : (
              filteredAnnouncements.map((ann, i) => (
                <AnnouncementPost
                  key={i}
                  announcement={ann}
                  canDelete={i < announcements.length && canAnnounce}
                  onDelete={() => {
                    if (confirm('Delete this announcement?')) {
                      deleteAnnouncement(i);
                    }
                  }}
                />
              ))
            )}
          </Card>
        </div>
      </div>

      <style>{`
        .ann-topbar {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-2) 0 var(--space-4);
        }
        .ann-topbar h2 {
          font-size: var(--text-lg);
          font-weight: 600;
          margin: 0;
        }
        .role-switch {
          display: flex;
          background: var(--surface-alt);
          border-radius: var(--radius-lg);
          padding: var(--space-1);
          margin-bottom: var(--space-4);
        }
        .role-switch button {
          flex: 1;
          border: none;
          background: transparent;
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-md);
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--ink-soft);
          cursor: pointer;
          transition: all var(--duration-fast);
        }
        .role-switch button.active {
          background: var(--surface);
          color: var(--ink);
          box-shadow: var(--elevation-1);
        }
        .ann-grid {
          display: block;
        }
        .cap-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-2);
        }
        .cap-label {
          font-weight: 600;
          font-size: var(--text-sm);
        }
        .cap-value {
          font-size: var(--text-sm);
          color: var(--ink-soft);
        }
        .cap-bar {
          height: 9px;
          border-radius: var(--radius-full);
          background: var(--surface-alt);
          overflow: hidden;
          box-shadow: inset 0 1px 3px rgba(0,0,0,0.10);
        }
        .cap-fill {
          height: 100%;
          border-radius: var(--radius-full);
          background: var(--grad-safe);
          transition: width var(--duration-base);
        }
        .compose-card {
          margin-top: var(--space-4);
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }
        .compose-textarea {
          width: 100%;
          border: 1.5px solid var(--border);
          border-radius: var(--radius-lg);
          padding: var(--space-3);
          font-family: var(--font-body);
          font-size: var(--text-sm);
          resize: none;
          background: var(--surface);
          color: var(--ink);
          transition: border-color var(--duration-fast);
        }
        .compose-textarea:focus {
          outline: none;
          border-color: var(--primary);
        }
        .post {
          padding: var(--space-3) 0;
          border-top: 1px solid var(--border);
        }
        .post:first-child {
          border-top: none;
          padding-top: 0;
        }
        .post-head {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          margin-bottom: var(--space-2);
        }
        .post-who {
          font-weight: 600;
          font-size: var(--text-sm);
        }
        .post-time {
          font-size: var(--text-xs);
          color: var(--ink-soft);
        }
        .post-text {
          font-size: var(--text-sm);
          line-height: 1.5;
          color: var(--ink);
        }
        .empty-state {
          text-align: center;
          padding: var(--space-4) 0;
          color: var(--ink-soft);
          font-size: var(--text-sm);
        }

        @media (min-width: 900px) {
          .ann-grid {
            display: grid;
            grid-template-columns: 1fr 1.5fr;
            gap: var(--space-6);
            align-items: start;
          }
          .ann-grid > div:first-child .card {
            position: sticky;
            top: 100px;
          }
        }
      `}</style>
    </PageContainer>
  );
}

function AnnouncementPost({ announcement, canDelete, onDelete }) {
  const { who, time, text } = announcement;

  return (
    <div className="post">
      <div className="post-head">
        <span className="post-who">{who}</span>
        <span className="post-time">{time}</span>
        {canDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            style={{ color: 'var(--danger)', marginLeft: 'auto', padding: '4px 8px' }}
          >
            Delete
          </Button>
        )}
      </div>
      <p className="post-text">{text}</p>
    </div>
  );
}
