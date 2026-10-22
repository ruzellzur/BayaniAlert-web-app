import { useApp } from '../../context/app-context';

export default function AdminApprovals() {
  const { pendingOfficials, approveOfficial, declineOfficial } = useApp();

  const pending = pendingOfficials.filter(p => p.status === 'pending');
  const processed = pendingOfficials.filter(p => p.status !== 'pending');

  return (
    <div className="screen-enter">
      {/* Header */}
      <div className="admin-head">
        <h2>Pending Official Accounts</h2>
        <p>Approve or reject barangay officials waiting to be verified.</p>
      </div>

      {/* Pending List */}
      <div className="card admin-list" style={{ marginBottom: 16 }}>
        {pending.length === 0 ? (
          <div className="empty-state">
            <span className="ic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6 9 17l-5-5"/>
              </svg>
            </span>
            <h4>All caught up</h4>
            <p>No official accounts are waiting for verification right now.</p>
          </div>
        ) : (
          pending.map((official) => (
            <div key={official.id} className="req-card">
              <div>
                <div className="name">{official.name}</div>
                <div className="meta">{official.position} · {official.purok}</div>
              </div>
              <div className="row" style={{ gap: 6 }}>
                <button className="btn btn-safe btn-sm" onClick={() => approveOfficial(official.id)}>Approve</button>
                <button className="btn btn-ghost btn-sm" onClick={() => {
                  if (confirm(`Reject ${official.name}'s application?`)) {
                    declineOfficial(official.id);
                  }
                }}>Reject</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Processed Section */}
      {processed.length > 0 && (
        <>
          <div className="section-label">
            <h3>Processed</h3>
          </div>
          <div className="card admin-list">
            {processed.map((official) => (
              <div key={official.id} className="req-card">
                <div>
                  <div className="name">{official.name}</div>
                  <div className="meta">{official.position} · {official.purok}</div>
                </div>
                <span className={`tag tag-${official.status}`}>
                  {official.status === 'approved' ? 'Accepted' : 'Declined'}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      <style>{`
        .admin-head {
          text-align: center;
          padding: 8px 0 22px;
        }
        .admin-head h2 {
          font-size: 24px;
          font-weight: 600;
        }
        .admin-head p {
          color: var(--ink-soft);
          font-size: 13.5px;
          margin-top: 6px;
        }
        .admin-stat-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 18px;
        }
        .admin-stat {
          position: relative;
          overflow: hidden;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 18px;
          padding: 18px 10px;
          text-align: center;
          box-shadow: var(--card-shadow);
          transition: transform 0.22s var(--ease), box-shadow 0.22s ease;
        }
        .admin-stat::after {
          content: "";
          position: absolute;
          top: -24px;
          right: -24px;
          width: 72px;
          height: 72px;
          border-radius: 50%;
          opacity: 0.16;
        }
        .admin-stat.accent::after { background: var(--accent); }
        .admin-stat.safe::after { background: var(--safe); }
        .admin-stat.cool::after { background: var(--cool); }
        .admin-stat .n {
          position: relative;
          font-family: var(--font-display);
          font-size: 28px;
          font-weight: 600;
          line-height: 1.1;
        }
        .admin-stat.accent .n { color: var(--accent); }
        .admin-stat.safe .n { color: var(--safe); }
        .admin-stat.cool .n { color: var(--cool); }
        .admin-stat .l {
          position: relative;
          font-size: 11px;
          color: var(--ink-soft);
          font-weight: 700;
          margin-top: 5px;
        }
        @media (hover: hover) {
          .admin-stat:hover {
            transform: translateY(-4px);
            box-shadow: 0 16px 32px -12px rgba(21,35,61,0.3);
          }
        }
        .admin-list { padding: 4px 16px; }
        .amenity-tags { display: flex; flex-wrap: wrap; gap: 7px; }
        .amenity-tag {
          cursor: pointer;
          transition: transform 0.18s var(--ease), box-shadow 0.18s ease;
        }
        @media (hover: hover) {
          .amenity-tag:hover { transform: translateY(-2px) scale(1.04); box-shadow: var(--card-shadow); }
        }

      `}</style>
    </div>
  );
}
