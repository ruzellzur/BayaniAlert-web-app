import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

/**
 * Resource Detail Page
 *
 * Markup matches the prototype's `#screen-resourceDetail`:
 *   .topbar > .row (mobile-back + h2)
 *   .detail-hero > .res-ic.cat-* + name/dist
 *   .card (about)
 *   .section-label + .card.owner-card
 *   .btn.btn-primary.btn-block + .btn.btn-ghost.btn-block
 *
 * All visual rules live in src/styles/prototype.css.
 */
const CAT_ICONS = {
  power: <path d="M13 2 3 14h7l-1 8 11-14h-8z" />,
  water: <path d="M12 3s6 7 6 11a6 6 0 1 1-12 0c0-4 6-11 6-11Z" />,
  tools: (
    <>
      <path d="M14 7l3 3-8 8-3.5.5.5-3.5 8-8Z" />
      <path d="M17 4l3 3" />
    </>
  ),
  firstaid: (
    <>
      <rect x="3" y="7" width="18" height="12" rx="2" />
      <path d="M12 10v6M9 13h6" />
    </>
  ),
  transport: (
    <>
      <rect x="3" y="10" width="18" height="7" rx="2" />
      <circle cx="7.5" cy="18.5" r="1.5" />
      <circle cx="16.5" cy="18.5" r="1.5" />
    </>
  ),
};

export default function ResourceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { resources, requestItem, showToast } = useApp();

  const resourceId = parseInt(id, 10);
  const resource = resources.find((r) => r.id === resourceId);

  if (!resource) {
    return (
      <section className="screen active" id="screen-resourceDetail">
        <div className="topbar">
          <div className="row" style={{ gap: 12 }}>
            <button
              className="btn-ghost btn btn-sm mobile-back"
              onClick={() => navigate('/board')}
              aria-label="Go back"
              style={{ padding: '8px 10px' }}
            >
              ←
            </button>
            <h2 style={{ fontSize: 17 }}>Item details</h2>
          </div>
        </div>
        <div className="card">
          <p className="small muted">Resource not found</p>
        </div>
      </section>
    );
  }

  const ownerName = resource.owner.split('·')[0].trim();
  const ownerInitials = ownerName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  const sharedCount = (resourceId % 12) + 1;

  const handleRequest = () => {
    if (requestItem) requestItem(resource.id);
    showToast?.('Request sent to ' + ownerName);
  };

  return (
    <section className="screen active" id="screen-resourceDetail">
      {/* Topbar */}
      <div className="topbar">
        <div className="row" style={{ gap: 12 }}>
          <button
            className="btn-ghost btn btn-sm mobile-back"
            onClick={() => navigate('/board')}
            aria-label="Go back"
            style={{ padding: '8px 10px' }}
          >
            ←
          </button>
          <h2 style={{ fontSize: 17 }}>Item details</h2>
        </div>
      </div>

      {/* Hero */}
      <div className="detail-hero">
        <span className={'res-ic cat-' + resource.cat}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {CAT_ICONS[resource.cat] || CAT_ICONS.tools}
          </svg>
        </span>
        <div>
          <div style={{ fontWeight: 600, fontSize: 17 }}>{resource.name}</div>
          <div className="muted small" style={{ marginTop: 3 }}>{resource.dist}</div>
        </div>
      </div>

      {/* About */}
      <div className="card" style={{ marginBottom: 14 }}>
        <p className="small" style={{ marginBottom: 10, fontWeight: 600, color: 'var(--ink)' }}>
          About this item
        </p>
        <p className="small muted" style={{ lineHeight: 1.6 }}>
          {resource.desc || 'No additional description provided.'}
        </p>
      </div>

      {/* Owner */}
      <div className="section-label" style={{ marginTop: 0 }}>
        <h3>Shared by</h3>
      </div>
      <div className="card owner-card" style={{ marginBottom: 16 }}>
        <span className="avatar">{ownerInitials}</span>
        <div>
          <div style={{ fontWeight: 600, fontSize: 13.5 }}>{ownerName}</div>
          <div className="muted small">Member since 2022 · {sharedCount} items shared</div>
        </div>
      </div>

      <button className="btn btn-primary btn-block" onClick={handleRequest}>
        Request this item
      </button>
      <button
        className="btn btn-ghost btn-block"
        style={{ marginTop: 10 }}
        onClick={() => navigate(`/thread/${id}`)}
      >
        Message owner
      </button>
    </section>
  );
}
