import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

/**
 * My Requests Page
 *
 * Markup matches the prototype's `#screen-myRequests`:
 *   .topbar > .row (mobile-back + h2)
 *   .role-switch (Sent / Received)
 *   #req input
 *   .card (sent list) / .card (received list)
 *     .req-card > .name + .meta + .tag
 *
 * All visual rules live in src/styles/prototype.css.
 */
const SEARCH_STYLE = {
  width: '100%',
  marginBottom: 12,
  padding: '11px 14px',
  borderRadius: 12,
  border: '1.5px solid var(--border)',
  background: 'var(--surface)',
  color: 'var(--ink)',
  fontFamily: 'var(--font-body)',
  fontSize: 13.5,
};

const BASE_SENT = [
  { item: 'Gasoline-powered generator', owner: 'Mang Tonio · Purok 3', status: 'pending' },
  { item: 'First aid kit (family size)', owner: 'Nurse Bel · Purok 2', status: 'accepted' },
  { item: 'Multicab for evacuation trips', owner: 'Kap. Lira · Purok 1', status: 'declined' },
];

function statusTag(status) {
  if (status === 'accepted') return <span className="tag tag-accepted">Accepted</span>;
  if (status === 'declined') return <span className="tag tag-declined">Declined</span>;
  return <span className="tag tag-pending">Pending</span>;
}

export default function MyRequests() {
  const navigate = useNavigate();
  const { requests, showToast } = useApp();
  const [tab, setTab] = useState('sent');
  const [query, setQuery] = useState('');
  const [received, setReceived] = useState([
    { id: 'recvBolo', item: 'Steel bolo & rope', requester: 'Aling Nena · Purok 1', status: 'pending' },
  ]);

  const q = query.trim().toLowerCase();
  const sentItems = (requests || []).concat(BASE_SENT).filter(
    (r) =>
      !q ||
      (r.item || '').toLowerCase().includes(q) ||
      (r.owner || '').toLowerCase().includes(q)
  );
  const receivedItems = received.filter((r) => !q || r.item.toLowerCase().includes(q));

  const respond = (id, action) => {
    setReceived((list) =>
      list.map((r) => (r.id === id ? { ...r, status: action === 'accept' ? 'accepted' : 'declined' } : r))
    );
    showToast?.(action === 'accept' ? 'Request accepted' : 'Request declined');
  };

  return (
    <section className="screen active" id="screen-myRequests">
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
          <h2 style={{ fontSize: 17 }}>My requests</h2>
        </div>
      </div>

      {/* Sent / Received */}
      <div className="role-switch">
        <button className={tab === 'sent' ? 'active' : ''} onClick={() => setTab('sent')}>
          Sent
        </button>
        <button className={tab === 'received' ? 'active' : ''} onClick={() => setTab('received')}>
          Received
        </button>
      </div>

      <input
        type="text"
        id="req"
        placeholder=" your requests…"
        style={SEARCH_STYLE}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {/* Sent list */}
      <div className="card" style={tab === 'sent' ? undefined : { display: 'none' }}>
        {sentItems.length ? (
          sentItems.map((r, i) => (
            <div className="req-card" key={i}>
              <div>
                <div className="name">{r.item}</div>
                <div className="meta">From {r.owner}</div>
              </div>
              {statusTag(r.status)}
            </div>
          ))
        ) : (
          <p className="small muted" style={{ textAlign: 'center', padding: '14px 0' }}>
            No requests match your search.
          </p>
        )}
      </div>

      {/* Received list */}
      <div className="card" style={tab === 'received' ? undefined : { display: 'none' }}>
        {receivedItems.length ? (
          receivedItems.map((r) => (
            <div className="req-card" key={r.id}>
              <div>
                <div className="name">{r.item}</div>
                <div className="meta">Requested by {r.requester}</div>
              </div>
              {r.status === 'pending' ? (
                <div className="row" style={{ gap: 6 }}>
                  <button className="btn btn-safe btn-sm" onClick={() => respond(r.id, 'accept')}>
                    Accept
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => respond(r.id, 'decline')}>
                    Decline
                  </button>
                </div>
              ) : (
                statusTag(r.status)
              )}
            </div>
          ))
        ) : (
          <p className="small muted" style={{ textAlign: 'center', padding: '14px 0' }}>
            No requests match your search.
          </p>
        )}
      </div>
    </section>
  );
}
