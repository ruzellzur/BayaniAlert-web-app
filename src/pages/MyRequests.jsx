import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResources } from '../context/ResourceContext';

const STATUS_LABEL = {
  pending: 'Pending',
  accepted: 'Accepted',
  declined: 'Declined',
  cancelled: 'Cancelled',
  completed: 'Completed',
};

export default function MyRequests() {
  const navigate = useNavigate();
  const {
    myRequests, incomingRequests, loading, error,
    respondToRequest, cancelRequest,
  } = useResources();

  const [tab, setTab] = useState('sent');
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState(null);

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  };

  const q = search.toLowerCase();
  const matches = (r, who) =>
    r.item.toLowerCase().includes(q) || who.toLowerCase().includes(q);

  const sent = useMemo(
    () => myRequests.filter((r) => matches(r, r.owner)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [myRequests, q]
  );
  const received = useMemo(
    () => incomingRequests.filter((r) => matches(r, r.requester)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [incomingRequests, q]
  );

  const pendingReceived = incomingRequests.filter((r) => r.status === 'pending').length;

  const run = async (id, fn, successMsg) => {
    setBusyId(id);
    const { error: err } = await fn();
    setBusyId(null);
    notify(err ?? successMsg);
  };

  const handleCancel = (req) =>
    run(req.id, () => cancelRequest(req.id), 'Request cancelled');

  const handleRespond = (req, decision) =>
    run(
      req.id,
      () => respondToRequest(req.id, decision),
      {
        accept: `Accepted — arrange pickup with ${req.requester}`,
        decline: 'Request declined',
        complete: 'Marked as completed',
      }[decision]
    );

  const isInitialLoad = loading && myRequests.length === 0 && incomingRequests.length === 0;

  return (
    <div className="screen-enter" style={{ padding: '2px 20px 100px' }}>
      {/* Topbar */}
      <div className="topbar">
        <div className="row" style={{ gap: 12 }}>
          <button className="btn-ghost btn btn-sm mobile-back" onClick={() => navigate('/board')} aria-label="Go back" style={{ padding: '8px 10px' }}>←</button>
          <h2 style={{ fontSize: 17 }}>My requests</h2>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="role-switch">
        <button className={tab === 'sent' ? 'active' : ''} onClick={() => setTab('sent')}>
          Sent{myRequests.length > 0 ? ` (${myRequests.length})` : ''}
        </button>
        <button className={tab === 'received' ? 'active' : ''} onClick={() => setTab('received')}>
          Received{pendingReceived > 0 ? ` (${pendingReceived} new)` : ''}
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search your requests…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: '100%',
          marginBottom: 12,
          padding: '11px 14px',
          borderRadius: 12,
          border: '1.5px solid var(--border)',
          background: 'var(--surface)',
          color: 'var(--ink)',
          fontFamily: 'var(--font-body)',
          fontSize: '13.5px'
        }}
      />

      {error && <div className="req-error">{error}</div>}

      {/* Sent Tab */}
      {tab === 'sent' && (
        <div className="card">
          {isInitialLoad ? (
            <p className="small muted" style={{ textAlign: 'center', padding: '20px 0' }}>Loading requests…</p>
          ) : sent.length === 0 ? (
            <p className="small muted" style={{ textAlign: 'center', padding: '20px 0' }}>
              {myRequests.length === 0 ? 'No requests sent yet' : 'No requests match your search'}
            </p>
          ) : (
            sent.map((req) => {
              const canCancel = ['pending', 'accepted'].includes(req.status);
              return (
                <div key={req.id} className="req-card">
                  <div
                    style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
                    onClick={() => navigate(`/resource/${req.listingId}`)}
                  >
                    <div className="name">
                      {req.item}{req.quantity > 1 ? ` ×${req.quantity}` : ''}
                    </div>
                    <div className="meta">Requested from {req.owner}</div>
                    {req.note && <div className="meta">“{req.note}”</div>}
                  </div>
                  <div className="req-side">
                    <span className={`status-badge ${req.status}`}>{STATUS_LABEL[req.status]}</span>
                    {canCancel && (
                      <button
                        className="btn btn-ghost btn-sm"
                        disabled={busyId === req.id}
                        onClick={() => handleCancel(req)}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Received Tab */}
      {tab === 'received' && (
        <div className="card">
          {isInitialLoad ? (
            <p className="small muted" style={{ textAlign: 'center', padding: '20px 0' }}>Loading requests…</p>
          ) : received.length === 0 ? (
            <p className="small muted" style={{ textAlign: 'center', padding: '20px 0' }}>
              {incomingRequests.length === 0 ? 'No requests received' : 'No requests match your search'}
            </p>
          ) : (
            received.map((req) => (
              <div key={req.id} className="req-card">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="name">
                    {req.item}{req.quantity > 1 ? ` ×${req.quantity}` : ''}
                  </div>
                  <div className="meta">Requested by {req.requester}</div>
                  {req.note && <div className="meta">“{req.note}”</div>}
                </div>
                <div className="req-side">
                  {req.status === 'pending' ? (
                    <div className="row" style={{ gap: 6 }}>
                      <button className="btn btn-safe btn-sm" disabled={busyId === req.id} onClick={() => handleRespond(req, 'accept')}>
                        Accept
                      </button>
                      <button className="btn btn-ghost btn-sm" disabled={busyId === req.id} onClick={() => handleRespond(req, 'decline')}>
                        Decline
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className={`status-badge ${req.status}`}>{STATUS_LABEL[req.status]}</span>
                      {req.status === 'accepted' && (
                        <button className="btn btn-primary btn-sm" disabled={busyId === req.id} onClick={() => handleRespond(req, 'complete')}>
                          Mark completed
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {toast && <div className="req-toast" role="status">{toast}</div>}

      <style>{`
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 18px 20px 14px;
        }

        .req-error {
          margin-bottom: 12px;
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 13px;
          color: #C1443C;
          background: rgba(193, 68, 60, 0.1);
          border: 1px solid rgba(193, 68, 60, 0.3);
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
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .req-card .meta {
          font-size: 11.5px;
          color: var(--ink-soft);
          margin-top: 2px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .req-side {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 6px;
          flex-shrink: 0;
        }

        .req-card .btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .status-badge {
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .status-badge.pending {
          background: var(--surface-alt);
          color: var(--ink-soft);
        }

        .status-badge.accepted,
        .status-badge.completed {
          background: var(--safe);
          color: #fff;
        }

        .status-badge.declined {
          background: rgba(193, 68, 60, 0.12);
          color: #C1443C;
        }

        .status-badge.cancelled {
          background: var(--surface-alt);
          color: var(--ink-soft);
          text-decoration: line-through;
        }

        .req-toast {
          position: fixed;
          left: 50%;
          bottom: 96px;
          transform: translateX(-50%);
          z-index: 120;
          max-width: calc(100vw - 40px);
          padding: 10px 16px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 500;
          color: #fff;
          background: rgba(20, 24, 33, 0.92);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
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