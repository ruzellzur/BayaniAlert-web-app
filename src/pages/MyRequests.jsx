import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function MyRequests() {
  const navigate = useNavigate();
  const { requests, resources } = useApp();
  const [tab, setTab] = useState('sent');
  const [search, setSearch] = useState('');

  // Mock received requests (in a real app, these would come from context)
  const receivedRequests = [
    { id: 'r1', item: 'Steel bolo & rope', requester: 'Aling Nena · Purok 1', status: 'pending' },
  ];

  const filteredSentRequests = requests.filter(r =>
    r.item.toLowerCase().includes(search.toLowerCase()) ||
    r.owner.toLowerCase().includes(search.toLowerCase())
  );

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
        <button className={tab === 'sent' ? 'active' : ''} onClick={() => setTab('sent')}>Sent</button>
        <button className={tab === 'received' ? 'active' : ''} onClick={() => setTab('received')}>Received</button>
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

      {/* Sent Tab */}
      {tab === 'sent' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {filteredSentRequests.length === 0 ? (
            <p className="small muted" style={{ textAlign: 'center', padding: '20px 0' }}>
              No requests sent yet
            </p>
          ) : (
            filteredSentRequests.map((req, i) => (
              <div key={i} className="req-card" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 0',
                borderTop: i > 0 ? '1px solid var(--border)' : 'none'
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13.5px' }}>{req.item}</div>
                  <div className="small muted" style={{ marginTop: 2 }}>Requested from {req.owner}</div>
                </div>
                <span className={`status-badge ${req.status}`} style={{
                  padding: '4px 10px',
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: 600,
                  background: req.status === 'pending' ? 'var(--surface-alt)' : 'var(--safe)',
                  color: req.status === 'pending' ? 'var(--ink-soft)' : '#fff'
                }}>
                  {req.status === 'pending' ? 'Pending' : 'Accepted'}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Received Tab */}
      {tab === 'received' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {receivedRequests.length === 0 ? (
            <p className="small muted" style={{ textAlign: 'center', padding: '20px 0' }}>
              No requests received
            </p>
          ) : (
            receivedRequests.map((req) => (
              <div key={req.id} className="req-card" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 0',
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13.5px' }}>{req.item}</div>
                  <div className="small muted" style={{ marginTop: 2 }}>Requested by {req.requester}</div>
                </div>
                <div className="row" style={{ gap: 6 }}>
                  <button className="btn btn-safe btn-sm">Accept</button>
                  <button className="btn btn-ghost btn-sm">Decline</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <style>{`
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 18px 20px 14px;
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
