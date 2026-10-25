import { useParams, useNavigate } from 'react-router-dom';
import { useResources } from '../context/ResourceContext';
import { useAuth } from '../context/AuthContext'; // only if you still need `user`

export default function ResourceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getResource, loading, requestItem } = useResources();

  const resource = getResource(id); // id is a UUID string, no parseInt

  if (!resource && loading) {
    return (
      <div className="screen-enter" style={{ padding: '2px 20px 100px' }}>
        <p className="muted small" style={{ textAlign: 'center', marginTop: 40 }}>Loading…</p>
      </div>
    );
  }

  if (!resource) {
    return (
        <div className="screen-enter" style={{ padding: '2px 20px 100px' }}>
          <div className="topbar">
            <div className="row" style={{ gap: 12 }}>
              <button className="btn-ghost btn btn-sm mobile-back" onClick={() => navigate('/board')} aria-label="Go back" style={{ padding: '8px 10px' }}>←</button>
              <h2 style={{ fontSize: 17 }}>Item details</h2>
            </div>
          </div>
          <div className="card" style={{ marginTop: 20, textAlign: 'center' }}>
            <p className="muted">Resource not found</p>
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

  const handleRequest = async () => {
    const { error } = await requestItem(resource.id);
    alert(error ?? 'Request sent! The owner will be notified.');
  };

  const handleMessage = () => {
    navigate(`/thread/${id}`);
  };

  const ownerName = resource.ownerName;
  const ownerInitials = ownerName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="screen-enter" style={{ padding: '2px 20px 100px' }}>
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
          <div style={{ fontWeight: 600, fontSize: 17 }}>{resource.name}</div>
          <div className="muted small" style={{ marginTop: 3 }}>{resource.dist} away</div>
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
      <div className="card owner-card" style={{ marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
        <span className="avatar" style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: 'var(--grad-cool)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          fontSize: 14,
          flexShrink: 0
        }}>
          {ownerInitials}
        </span>
        <div>
          <div style={{ fontWeight: 600, fontSize: '13.5px' }}>{ownerName}</div>
          <div className="muted small">Member since 2022 · {Math.floor(Math.random() * 20) + 1} items shared</div>
        </div>
      </div>

      {/* Action Buttons */}
      <button
        className="btn btn-primary btn-block"
        onClick={handleRequest}
        disabled={resource.isMine || resource.status !== 'available' || resource.type === 'request'}
      >
        {resource.isMine ? 'This is your listing' : 'Request this item'}
      </button>
      <button className="btn btn-ghost btn-block" style={{ marginTop: 10 }} onClick={handleMessage}>Message owner</button>

      <style>{`
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 18px 20px 14px;
        }
        .detail-hero {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 2px;
          margin-bottom: 6px;
        }
        .res-ic {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--grad-cool);
          color: #fff;
        }
        .res-ic svg {
          width: 23px;
          height: 23px;
        }
        .res-ic.cat-power { background: var(--grad-accent); }
        .res-ic.cat-water { background: linear-gradient(135deg, #5FA8D3, #4A90B8); }
        .res-ic.cat-tools { background: linear-gradient(135deg, #7B8794, #5C6370); }
        .res-ic.cat-firstaid { background: linear-gradient(135deg, #E57373, #C1443C); }
        .res-ic.cat-transport { background: linear-gradient(135deg, #81C784, #5FA864); }
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

        @media (min-width: 900px) {
          .mobile-back {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
