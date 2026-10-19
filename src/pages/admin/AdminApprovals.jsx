import { useApp } from '../../context/AppContext';

export default function AdminApprovals() {
  const { pendingOfficials, approveOfficial, declineOfficial } = useApp();

  const pending = pendingOfficials.filter(p => p.status === 'pending');
  const processed = pendingOfficials.filter(p => p.status !== 'pending');

  return (
    <div className="screen-enter" style={{ padding: '2px 20px 100px' }}>
      {/* Topbar */}
      <div className="topbar">
        <h2 style={{ fontSize: 20 }}>Pending Official Accounts</h2>
      </div>

      <div className="screen-head">
        <p className="sub">Approve or reject barangay officials waiting to be verified.</p>
      </div>

      {/* Pending List */}
      <div className="card" style={{ marginBottom: 14 }}>
        {pending.length === 0 ? (
          <p className="small muted">No pending accounts — all caught up.</p>
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
          <div className="card">
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
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 18px 0 14px;
        }
        .screen-head {
          margin: 4px 0 16px;
        }
        .screen-head .sub {
          color: var(--ink-soft);
          font-size: 13.5px;
          margin-top: 3px;
        }
        .req-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          padding: 14px 0;
          border-top: 1px solid var(--border);
        }
        .req-card:first-child {
          border-top: none;
          padding-top: 0;
        }
        .req-card .name {
          font-weight: 600;
          font-size: 13.5px;
        }
        .req-card .meta {
          font-size: 11.5px;
          color: var(--ink-soft);
          margin-top: 2px;
        }
        .tag-approved {
          background: var(--safe-bg);
          color: var(--safe);
        }
        .tag-rejected {
          background: var(--danger-bg);
          color: var(--danger);
        }

        @media (min-width: 900px) {
          .topbar {
            padding: 26px 0 20px;
          }
        }
      `}</style>
    </div>
  );
}
