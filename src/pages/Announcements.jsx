import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useAnnouncements, useEvacCapacity } from '../hooks/useAnnouncements';

function timeAgo(iso) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return new Date(iso).toLocaleDateString();
}

export default function Announcements() {
  const navigate = useNavigate();
  const { user } = useAuth();           // real user now, not the AppContext placeholder
  const { showToast } = useApp();       // toast still lives in AppContext

  const barangayId = user?.barangayId ?? null;
  const canAnnounce = !!user?.permissions?.announce && !!barangayId;

  const { announcements, loading, error, post, remove, togglePin } = useAnnouncements(barangayId);
  const capacity = useEvacCapacity(barangayId);

  const [search, setSearch] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [pinned, setPinned] = useState(false);
  const [posting, setPosting] = useState(false);

  const q = search.trim().toLowerCase();
  const filtered = announcements.filter((a) =>
    !q ||
    a.title.toLowerCase().includes(q) ||
    a.body.toLowerCase().includes(q) ||
    a.who.toLowerCase().includes(q)
  );

  const handlePost = async () => {
    if (!title.trim() || !body.trim()) {
      showToast('Add a title and a message first');
      return;
    }
    setPosting(true);
    const res = await post({ title: title.trim(), body: body.trim(), pinned, userId: user.id });
    setPosting(false);
    if (res.error) {
      showToast(res.error);
      return;
    }
    setTitle('');
    setBody('');
    setPinned(false);
    showToast('Announcement posted');
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this announcement?')) return;
    const res = await remove(id);
    showToast(res.error || 'Announcement removed');
  };

  const handlePin = async (a) => {
    const res = await togglePin(a.id, !a.pinned);
    if (res.error) showToast(res.error);
  };

  const pct = capacity?.capacity ? Math.min(100, (capacity.occupancy / capacity.capacity) * 100) : 0;

  return (
    <div className="screen-enter" style={{ padding: '2px 20px 100px' }}>
      <div className="topbar">
        <div className="row" style={{ gap: 12 }}>
          <button className="btn-ghost btn btn-sm mobile-back" onClick={() => navigate('/home')} aria-label="Go back" style={{ padding: '8px 10px' }}>←</button>
          <h2 style={{ fontSize: 17 }}>Announcements</h2>
        </div>
      </div>

      <div className="ann-grid">
        <div>
          {/* Capacity widget */}
          <div className="card">
            <div className="row between">
              <span style={{ fontWeight: 600, fontSize: '13.5px' }}>Evacuation center capacity</span>
              <span className="small muted">
                {capacity?.centers ? `${capacity.occupancy} / ${capacity.capacity}` : '—'}
              </span>
            </div>
            <div className="cap-bar">
              <div className="cap-fill" style={{ width: `${pct}%` }}></div>
            </div>
            {capacity && capacity.centers === 0 && (
              <p className="small muted" style={{ marginTop: 8 }}>No evacuation centers are open right now.</p>
            )}
          </div>

          {/* Compose (officials with announce permission) */}
          {canAnnounce && (
            <div style={{ marginTop: 16 }}>
              <div className="card stack">
                <input
                  className="compose-title"
                  type="text"
                  maxLength={120}
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <textarea
                  className="compose"
                  rows={3}
                  placeholder="Post an update for the barangay…"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
                <label className="small" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} />
                  Pin to top
                </label>
                <button className="btn btn-accent btn-block" onClick={handlePost} disabled={posting}>
                  {posting ? 'Posting…' : 'Post announcement'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div>
          <input
            type="text"
            placeholder="Search announcements…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%', margin: '12px 0', padding: '14px', borderRadius: 12,
              border: '1.5px solid var(--border)', background: 'var(--surface)',
              color: 'var(--ink)', fontFamily: 'var(--font-body)', fontSize: 13.5,
            }}
          />

          <div className="card" id="annFeed">
            {!barangayId ? (
              <p className="small muted" style={{ textAlign: 'center', padding: '14px 0' }}>
                Your account isn't linked to a barangay, so there's nothing to show.
              </p>
            ) : loading ? (
              <p className="small muted" style={{ textAlign: 'center', padding: '14px 0' }}>Loading…</p>
            ) : error ? (
              <p className="small" style={{ textAlign: 'center', padding: '14px 0', color: 'var(--danger)' }}>{error}</p>
            ) : filtered.length === 0 ? (
              <p className="small muted" style={{ textAlign: 'center', padding: '14px 0' }}>
                {announcements.length === 0 ? 'No announcements yet.' : 'No announcements match your search.'}
              </p>
            ) : (
              filtered.map((a) => (
                <div key={a.id} className="post">
                  <div className="post-head">
                    <span className="who">{a.who}</span>
                    <span className="time">{timeAgo(a.created_at)}</span>
                    {a.pinned && <span className="pin-badge">📌 Pinned</span>}
                    {canAnnounce && (
                      <span style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
                        <button className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }} onClick={() => handlePin(a)}>
                          {a.pinned ? 'Unpin' : 'Pin'}
                        </button>
                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)', padding: '4px 8px' }} onClick={() => handleDelete(a.id)}>
                          Delete
                        </button>
                      </span>
                    )}
                  </div>
                  <p style={{ fontWeight: 600, marginBottom: 2 }}>{a.title}</p>
                  <p>{a.body}</p>
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
          background: var(--accent-track);
          overflow: hidden;
          margin-top: 10px;
        }
        .cap-fill {
          height: 100%;
          border-radius: 999px;
          background: var(--safe);
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
          border: 1px solid var(--border);
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

        .compose-title {
        width: 100%;
        border: 1.5px solid var(--border);
        border-radius: 12px;
        padding: 10px 12px;
        font-family: var(--font-body);
        font-size: 13.5px;
        background: var(--surface);
        color: var(--ink);
        }
      
        .pin-badge { font-size: 11px; color: var(--ink-soft); }
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

      `}</style>
    </div>
  );
}
