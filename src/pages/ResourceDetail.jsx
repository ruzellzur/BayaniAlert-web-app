import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/app-context';

export default function ResourceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { resources } = useApp();

  // Convert string ID from URL to number for matching
  const resourceId = parseInt(id, 10);
  const resource = resources.find(r => r.id === resourceId);

  if (!resource) {
    return (
      <div className="screen-enter">
        <div className="topbar">
          <div className="row" style={{ gap: 12 }}>
            <button className="btn-ghost btn btn-sm mobile-back" onClick={() => navigate('/board')} aria-label="Go back" style={{ padding: '8px 10px' }}>←</button>
            <h2 style={{ fontSize: 17 }}>Item details</h2>
          </div>
        </div>
        <div className="card" style={{ marginTop: 20 }}>
          <div className="empty-state">
            <span className="ic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7"/>
                <path d="m20 20-3.5-3.5"/>
              </svg>
            </span>
            <h4>Resource not found</h4>
            <p>This item may have been removed or already borrowed. Browse the board to find something else.</p>
            <button className="btn btn-accent btn-sm" style={{ marginTop: 6 }} onClick={() => navigate('/board')}>Back to board</button>
          </div>
        </div>
      </div>
    );
  }

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

  const handleRequest = () => {
    alert('Request sent! The owner will be notified.');
  };

  const handleMessage = () => {
    navigate(`/thread/${id}`);
  };

  const ownerName = resource.owner.split('·')[0].trim();
  const ownerInitials = ownerName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  // Stable pseudo-count derived from the owner name (no impure calls during render)
  const itemsShared = (ownerName.length * 7) % 19 + 1;

  return (
    <div className="screen-enter">
      {/* Topbar */}
      <div className="topbar">
        <div className="row" style={{ gap: 12 }}>
          <button className="btn-ghost btn btn-sm mobile-back" onClick={() => navigate('/board')} aria-label="Go back" style={{ padding: '8px 10px' }}>←</button>
          <h2 style={{ fontSize: 17 }}>Item details</h2>
        </div>
      </div>

      {/* Detail Hero */}
      <div className="detail-hero">
        <span className={`res-ic cat-${resource.cat}`}>
          {getCategoryIcon(resource.cat)}
        </span>
        <div>
          <div className="detail-name">{resource.name}</div>
          <div className="detail-meta">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            {resource.dist} away
          </div>
        </div>
      </div>

      {/* About Card */}
      <div className="card" style={{ marginBottom: 14 }}>
        <p className="small" style={{ marginBottom: 10, fontWeight: 600, color: 'var(--ink)' }}>About this item</p>
        <p className="small muted" style={{ lineHeight: 1.6 }}>{resource.desc || 'No additional description provided.'}</p>
      </div>

      {/* Owner Section */}
      <div className="section-label" style={{ marginTop: 0 }}>
        <h3>Shared by</h3>
      </div>
      <div className="card owner-card">
        <span className="avatar">{ownerInitials}</span>
        <div>
          <div style={{ fontWeight: 600, fontSize: '13.5px' }}>{ownerName}</div>
          <div className="muted small">Member since 2022 · {itemsShared} items shared</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="detail-actions">
        <button className="btn btn-primary btn-block btn-lg" onClick={handleRequest}>Request this item</button>
        <button className="btn btn-ghost btn-block" onClick={handleMessage}>Message owner</button>
      </div>

      <style>{`
        .detail-hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 14px;
          padding: 22px 0 24px;
        }
        .detail-hero .res-ic {
          width: 76px;
          height: 76px;
          border-radius: 24px;
          font-size: 30px;
          animation: floaty 5s ease-in-out infinite;
        }
        .detail-hero .res-ic svg { width: 34px; height: 34px; }
        .detail-name {
          font-family: var(--font-display);
          font-size: 24px;
          font-weight: 600;
          line-height: 1.2;
        }
        .detail-meta {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--ink-soft);
          background: var(--surface);
          border: 1px solid var(--border);
          padding: 6px 14px;
          border-radius: 999px;
          box-shadow: var(--card-shadow);
        }
        .owner-card {
          display: flex;
          gap: 13px;
          align-items: center;
          margin-bottom: 18px;
        }
        .owner-card .avatar {
          width: 46px;
          height: 46px;
          border-radius: 14px;
          background: var(--grad-cool);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 15px;
          flex-shrink: 0;
          box-shadow: 0 6px 16px -6px rgba(69,115,174,0.8);
        }
        .detail-actions { display: flex; flex-direction: column; gap: 10px; }

      `}</style>
    </div>
  );
}
