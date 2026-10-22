import { useApp } from '../../context/AppContext';
import PageContainer from '../../components/layout/PageContainer';

export default function AdminApprovals() {
  const { pendingOfficials, approveOfficial, declineOfficial } = useApp();

  const pending = pendingOfficials.filter(p => p.status === 'pending');
  const processed = pendingOfficials.filter(p => p.status !== 'pending');

  return (
    <PageContainer>
      <div className="screen-head">
        <h2>Pending Official Accounts</h2>
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
                <span className={`tag ${official.status === 'approved' ? 'tag-accepted' : 'tag-declined'}`}>
                  {official.status === 'approved' ? 'Accepted' : 'Declined'}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </PageContainer>
  );
}
