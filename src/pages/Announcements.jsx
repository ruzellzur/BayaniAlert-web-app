import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeftIcon } from '../components/icons';

/**
 * Announcements Page
 *
 * Markup matches the prototype's `#screen-announcements`:
 *   .topbar > .row (mobile-back + h2)
 *   .ann-grid
 *     left:  .role-switch + #capWidgetCard + #composeWrap
 *     right: #ann search input + #annFeed (.card of .post)
 *
 * All visual rules live in src/styles/prototype.css.
 */
const BASE_ANNOUNCEMENTS = [
  {
    who: 'Kagawad Reyes',
    time: '25 min ago',
    text: 'Evacuation center at San Isidro Elementary is now open. Bring your family ID and essentials.',
  },
  {
    who: 'Brgy. Captain Lira',
    time: '2 hr ago',
    text: 'Free rubber boots and candles available at the covered court while supplies last.',
  },
  {
    who: 'Kagawad Reyes',
    time: 'Yesterday',
    text: 'Please clear drainage canals near your homes before Friday. Bagyo is expected to strengthen over the weekend.',
  },
];

export default function Announcements() {
  const navigate = useNavigate();
  const { user, announcements, addAnnouncement, deleteAnnouncement, evacCenters, showToast } = useApp();

  const isOfficial = user?.role === 'official';
  const canAnnounce = !!user?.permissions?.announce;

  const [view, setView] = useState(isOfficial ? 'official' : 'resident');
  const [composeText, setComposeText] = useState('');
  const [query, setQuery] = useState('');

  const e0 = evacCenters[0] || { cap: 0, max: 400 };
  const capPct = Math.round((e0.cap / e0.max) * 100);

  const all = announcements
    .map((a, i) => ({ ...a, idx: i }))
    .concat(BASE_ANNOUNCEMENTS.map((a) => ({ ...a, idx: -1 })));

  const q = query.trim().toLowerCase();
  const items = all.filter(
    (a) => !q || a.text.toLowerCase().includes(q) || a.who.toLowerCase().includes(q)
  );

  const showCompose = view === 'official' && canAnnounce;

  const handlePost = () => {
    const text = composeText.trim();
    if (!text) {
      showToast?.('Write something to post first');
      return;
    }
    addAnnouncement(text);
    setComposeText('');
  };

  const handleDelete = (idx) => {
    if (idx < 0) return;
    if (window.confirm('Delete this announcement?')) deleteAnnouncement(idx);
  };

  return (
    <section className="screen active" id="screen-announcements">
      {/* Topbar */}
      <div className="topbar">
        <div className="row" style={{ gap: 12 }}>
          <button
            className="btn-ghost btn btn-sm mobile-back"
            onClick={() => navigate('/home')}
            aria-label="Go back"
            style={{ padding: '8px 10px' }}
          >
            <ArrowLeftIcon />
          </button>
          <h2 style={{ fontSize: 17 }}>Announcements</h2>
        </div>
      </div>

      <div className="ann-grid">
        <div>
          {/* Role switch */}
          <div className="role-switch">
            <button
              className={view === 'resident' ? 'active' : ''}
              id="roleResident"
              onClick={() => setView('resident')}
            >
              Resident view
            </button>
            <button
              className={view === 'official' ? 'active' : ''}
              id="roleOfficial"
              onClick={() => setView('official')}
            >
              Official view
            </button>
          </div>

          {/* Capacity widget */}
          <div className="card" id="capWidgetCard">
            <div className="row between">
              <span style={{ fontWeight: 600, fontSize: 13.5 }}>Evacuation center capacity</span>
              <span className="small muted" id="capWidgetText">
                {e0.cap} / {e0.max}
              </span>
            </div>
            <div className="cap-bar">
              <div className="cap-fill" id="capWidgetFill" style={{ width: `${capPct}%` }} />
            </div>
          </div>

          {/* Compose (official only) */}
          <div id="composeWrap" style={{ display: showCompose ? 'block' : 'none', marginTop: 16 }}>
            <div className="card stack">
              <textarea
                className="compose"
                id="announceInput"
                rows="3"
                placeholder="Post an update for the barangay…"
                value={composeText}
                onChange={(e) => setComposeText(e.target.value)}
              />
              <button className="btn btn-accent btn-block" onClick={handlePost}>
                Post announcement
              </button>
            </div>
          </div>
        </div>

        <div>
          <input
        type="text"
        id="ann"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="search-input"
        placeholder=" announcements…"
        aria-label=" announcements"
      />

          <div className="card" id="annFeed">
            {items.length ? (
              items.map((a, i) => (
                <div className="post" key={a.idx >= 0 ? 'ctx-' + a.idx : 'base-' + i}>
                  <div className="post-head">
                    <span className="who">{a.who}</span>
                    <span className="time">{a.time}</span>
                    {a.idx > -1 && isOfficial && (
                      <span className="role-swap" data-role="official" style={{ marginLeft: 'auto' }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ color: 'var(--danger)', padding: '4px 8px' }}
                          onClick={() => handleDelete(a.idx)}
                        >
                          Delete
                        </button>
                      </span>
                    )}
                  </div>
                  <p>{a.text}</p>
                </div>
              ))
            ) : (
              <p className="small muted" style={{ textAlign: 'center', padding: '14px 0' }}>
                No announcements match your search.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
