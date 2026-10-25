import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../config/apiConfig'; // adjust path if needed
import { useApp } from '../../context/AppContext'; // only for showToast; rename if you renamed the mock

export default function AdminApprovals() {
  const { showToast } = useApp();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [busyId, setBusyId] = useState(null); // row being approved/rejected

  // Every official registration, newest first. Admins can read all profiles (RLS).
  const load = useCallback(async () => {
    setLoadError('');
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, phone, official_position, id_number, status, created_at, barangay:barangays(name), purok:puroks(name)')
      .eq('requested_role', 'official')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('load officials:', error);
      setLoadError('Could not load accounts. Please try again.');
    } else {
      setRows(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // decision: 'approve' | 'reject' -> server function checks the caller is an admin
  const review = async (row, decision) => {
    setBusyId(row.id);
    const { error } = await supabase.rpc('review_account', { target: row.id, decision });
    setBusyId(null);

    if (error) {
      console.error('review_account:', error);
      showToast('Could not update this account');
      return;
    }
    showToast(`${row.full_name} ${decision === 'approve' ? 'approved as official' : 'rejected'}`);
    load();
  };

  const pending = rows.filter((r) => r.status === 'pending');
  const processed = rows.filter((r) => r.status !== 'pending');

  const where = (r) =>
    `${r.official_position || 'No position'} · ${r.barangay?.name || '—'} · ${r.purok?.name || 'All puroks'}`;
  const contact = (r) => `ID: ${r.id_number || '—'} · ${r.phone || '—'}`;

  return (
    <div className="screen-enter" style={{ padding: '2px 20px 100px' }}>
      {/* Topbar */}
      <div className="topbar">
        <h2 style={{ fontSize: 20 }}>Pending Official Accounts</h2>
        <button className="btn btn-ghost btn-sm" onClick={load}>Refresh</button>
      </div>

      <div className="screen-head">
        <p className="sub">Approve or reject barangay officials waiting to be verified. Check each ID number with the barangay hall before approving.</p>
      </div>

      {loadError && <p className="error-text" style={{ marginBottom: 10 }}>{loadError}</p>}

      {/* Pending List */}
      <div className="card" style={{ marginBottom: 14 }}>
        {loading ? (
          <p className="small muted">Loading…</p>
        ) : pending.length === 0 ? (
          <p className="small muted">No pending accounts — all caught up.</p>
        ) : (
          pending.map((official) => (
            <div key={official.id} className="req-card">
              <div>
                <div className="name">{official.full_name}</div>
                <div className="meta">{where(official)}</div>
                <div className="meta">{contact(official)}</div>
              </div>
              <div className="row" style={{ gap: 6 }}>
                <button
                  className="btn btn-safe btn-sm"
                  disabled={busyId === official.id}
                  onClick={() => review(official, 'approve')}
                >
                  Approve
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={busyId === official.id}
                  onClick={() => {
                    if (confirm(`Reject ${official.full_name}'s application?`)) {
                      review(official, 'reject');
                    }
                  }}
                >
                  Reject
                </button>
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
                  <div className="name">{official.full_name}</div>
                  <div className="meta">{where(official)}</div>
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