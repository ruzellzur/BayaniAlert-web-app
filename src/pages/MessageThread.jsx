import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button, Input, Card } from '../components/ui';
import { PageContainer } from '../components/layout/PageContainer';

export default function MessageThread() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { resources, user } = useApp();
  const [message, setMessage] = useState('');

  // Convert string ID from URL to number for matching
  const resourceId = parseInt(id, 10);
  const resource = resources.find(r => r.id === resourceId);

  // Mock conversation data
  const [messages, setMessages] = useState([
    { id: 1, from: 'owner', text: 'Hi! Yes, the generator is available. You can pick it up tomorrow morning.', time: '2:30 PM' },
    { id: 2, from: 'user', text: 'Perfect! What time works best for you?', time: '2:32 PM' },
    { id: 3, from: 'owner', text: 'Around 8 AM would be good. I\'m at Purok 3, near the chapel.', time: '2:35 PM' },
  ]);

  if (!resource) {
    return (
      <PageContainer>
        <div className="thread-topbar">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/board')}
            aria-label="Go back"
          >
            ←
          </Button>
          <h2>Messages</h2>
        </div>
        <Card padding="lg" style={{ textAlign: 'center', marginTop: 'var(--space-5)' }}>
          <p className="muted">Conversation not found</p>
        </Card>
      </PageContainer>
    );
  }

  const ownerName = resource.owner.split('·')[0].trim();

  const handleSend = () => {
    if (!message.trim()) return;

    const newMsg = {
      id: messages.length + 1,
      from: 'user',
      text: message,
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    };

    setMessages([...messages, newMsg]);
    setMessage('');
  };

  return (
    <PageContainer>
      {/* Topbar */}
      <div className="thread-topbar">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/resource/${id}`)}
          aria-label="Go back"
        >
          ←
        </Button>
        <h2>{ownerName}</h2>
      </div>

      {/* Message Thread */}
      <div className="thread-body">
        {messages.map((msg) => (
          <div key={msg.id} className={`msg ${msg.from === 'user' ? 'msg-user' : 'msg-owner'}`}>
            <div className="msg-bubble">{msg.text}</div>
            <div className="msg-time">{msg.time}</div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="thread-input-row">
        <Input
          placeholder="Type a message…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <Button variant="accent" onClick={handleSend}>Send</Button>
      </div>

      <style>{`
        .thread-topbar {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-2) 0 var(--space-3);
        }
        .thread-topbar h2 {
          font-size: var(--text-lg);
          font-weight: 600;
          margin: 0;
        }
        .thread-body {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          min-height: 260px;
          padding: var(--space-1) 0 var(--space-3);
        }
        .msg {
          display: flex;
          flex-direction: column;
          max-width: 75%;
        }
        .msg-user {
          align-self: flex-end;
          align-items: flex-end;
        }
        .msg-owner {
          align-self: flex-start;
          align-items: flex-start;
        }
        .msg-bubble {
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-lg);
          font-size: var(--text-sm);
          line-height: 1.45;
        }
        .msg-user .msg-bubble {
          background: var(--grad-primary);
          color: var(--on-strong);
          border-bottom-right-radius: var(--radius-sm);
        }
        .msg-owner .msg-bubble {
          background: var(--surface);
          border: 1px solid var(--border);
          border-bottom-left-radius: var(--radius-sm);
        }
        .msg-time {
          font-size: var(--text-xs);
          color: var(--ink-soft);
          margin-top: var(--space-1);
        }
        .thread-input-row {
          display: flex;
          gap: var(--space-2);
          position: sticky;
          bottom: 0;
          background: var(--bg);
          padding-top: var(--space-2);
        }
      `}</style>
    </PageContainer>
  );
}
