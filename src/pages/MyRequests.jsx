import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button, Card, Input, Tag } from '../components/ui';
import { PageContainer } from '../components/layout/PageContainer';

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
    <PageContainer>
      {/* Topbar */}
      <div className="req-topbar">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/board')}
          aria-label="Go back"
        >
          ←
        </Button>
        <h2>My requests</h2>
      </div>

      {/* Tab Switcher */}
      <div className="tab-switch">
        <button
          className={tab === 'sent' ? 'active' : ''}
          onClick={() => setTab('sent')}
        >
          Sent
        </button>
        <button
          className={tab === 'received' ? 'active' : ''}
          onClick={() => setTab('received')}
        >
          Received
        </button>
      </div>

      {/* Search */}
      <Input
        placeholder="Search your requests…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Sent Tab */}
      {tab === 'sent' && (
        <Card padding="md">
          {filteredSentRequests.length === 0 ? (
            <p className="empty-state">No requests sent yet</p>
          ) : (
            filteredSentRequests.map((req, i) => (
              <RequestItem
                key={i}
                item={req.item}
                meta={`From ${req.owner}`}
                status={req.status}
                isLast={i === filteredSentRequests.length - 1}
              />
            ))
          )}
        </Card>
      )}

      {/* Received Tab */}
      {tab === 'received' && (
        <Card padding="md">
          {receivedRequests.length === 0 ? (
            <p className="empty-state">No requests received</p>
          ) : (
            receivedRequests.map((req, i) => (
              <ReceivedRequestItem
                key={req.id}
                request={req}
                isLast={i === receivedRequests.length - 1}
              />
            ))
          )}
        </Card>
      )}

      <style>{`
        .req-topbar {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-2) 0 var(--space-4);
        }
        .req-topbar h2 {
          font-size: var(--text-lg);
          font-weight: 600;
          margin: 0;
        }
        .tab-switch {
          display: flex;
          background: var(--surface-alt);
          border-radius: var(--radius-lg);
          padding: var(--space-1);
          margin-bottom: var(--space-4);
        }
        .tab-switch button {
          flex: 1;
          border: none;
          background: transparent;
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-md);
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--ink-soft);
          cursor: pointer;
          transition: all var(--duration-fast);
        }
        .tab-switch button.active {
          background: var(--surface);
          color: var(--ink);
          box-shadow: var(--elevation-1);
        }
        .empty-state {
          text-align: center;
          padding: var(--space-5) 0;
          color: var(--ink-soft);
          font-size: var(--text-sm);
        }
      `}</style>
    </PageContainer>
  );
}

function RequestItem({ item, meta, status, isLast }) {
  return (
    <div className={`req-item ${isLast ? 'last' : ''}`}>
      <div className="req-info">
        <div className="req-name">{item}</div>
        <div className="req-meta">{meta}</div>
      </div>
      <Tag variant={status} />
    </div>
  );
}

function ReceivedRequestItem({ request, isLast }) {
  return (
    <div className={`req-item ${isLast ? 'last' : ''}`}>
      <div className="req-info">
        <div className="req-name">{request.item}</div>
        <div className="req-meta">Requested by {request.requester}</div>
      </div>
      <div className="req-actions">
        <Button variant="safe" size="sm">Accept</Button>
        <Button variant="ghost" size="sm">Decline</Button>
      </div>
    </div>
  );
}
