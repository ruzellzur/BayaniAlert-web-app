import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/app-context';

export default function MyRequests() {
  const navigate = useNavigate();
  const { requests } = useApp();
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
    <div className="screen-enter">
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
              className="search-input"
            />

      {/* Sent Tab */}
      {tab === 'sent' && (
        <div className="card">
          {filteredSentRequests.length === 0 ? (
            <p className="small muted center-text" style={{ padding: '20px 0' }}>
              No requests sent yet
            </p>
          ) : (
            filteredSentRequests.map((req, i) => (
              <div key={i} className="req-card">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="name">{req.item}</div>
                  <div className="meta">Requested from {req.owner}</div>
                </div>
                <span className={`status-badge ${req.status}`}>
                  {req.status === 'pending' ? 'Pending' : 'Accepted'}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Received Tab */}
      {tab === 'received' && (
        <div className="card">
          {receivedRequests.length === 0 ? (
            <p className="small muted center-text" style={{ padding: '20px 0' }}>
              No requests received
            </p>
          ) : (
            receivedRequests.map((req) => (
              <div key={req.id} className="req-card">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="name">{req.item}</div>
                  <div className="meta">Requested by {req.requester}</div>
                </div>
                <div className="row" style={{ gap: 6, flexShrink: 0 }}>
                  <button className="btn btn-safe btn-sm">Accept</button>
                  <button className="btn btn-ghost btn-sm">Decline</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <style>{`
        .req-card {
          align-items: center;
        }
        .req-card .req-actions {
          display: flex;
          gap: 6px;
          flex-shrink: 0;
        }
        .search-input {
          margin-bottom: 14px;
        }
        .empty-state { padding: 30px 16px; }

      `}</style>
    </div>
  );
}
