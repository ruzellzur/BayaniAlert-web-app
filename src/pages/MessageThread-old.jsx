import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

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
      <div className="screen-enter" style={{ padding: '2px 20px 100px' }}>
        <div className="topbar">
          <div className="row" style={{ gap: 12 }}>
            <button className="btn-ghost btn btn-sm mobile-back" onClick={() => navigate('/board')} aria-label="Go back" style={{ padding: '8px 10px' }}>←</button>
            <h2 style={{ fontSize: 17 }}>Messages</h2>
          </div>
        </div>
        <div className="card" style={{ marginTop: 20, textAlign: 'center' }}>
          <p className="muted">Conversation not found</p>
        </div>
      </div>
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
    <div className="screen-enter" style={{ padding: '2px 20px 100px' }}>
      {/* Topbar */}
      <div className="topbar">
        <div className="row" style={{ gap: 12 }}>
          <button className="btn-ghost btn btn-sm mobile-back" onClick={() => navigate(`/resource/${id}`)} aria-label="Go back" style={{ padding: '8px 10px' }}>←</button>
          <h2 style={{ fontSize: 17 }}>{ownerName}</h2>
        </div>
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
        <input
          type="text"
          placeholder="Type a message…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button className="btn btn-accent" onClick={handleSend}>Send</button>
      </div>

      <style>{`
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 18px 20px 14px;
        }
        .thread-body {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-height: 260px;
          padding: 4px 2px 12px;
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
          padding: 10px 14px;
          border-radius: 14px;
          font-size: 13.5px;
          line-height: 1.45;
        }
        .msg-user .msg-bubble {
          background: var(--grad-primary);
          color: var(--on-strong);
          border-bottom-right-radius: 4px;
        }
        .msg-owner .msg-bubble {
          background: var(--surface);
          border: 1px solid var(--border);
          border-bottom-left-radius: 4px;
        }
        .msg-time {
          font-size: 10px;
          color: var(--ink-soft);
          margin-top: 3px;
        }
        .thread-input-row {
          display: flex;
          gap: 8px;
          position: sticky;
          bottom: 0;
          background: var(--bg);
          padding-top: 8px;
        }
        .thread-input-row input {
          flex: 1;
          padding: 11px 14px;
          border-radius: 12px;
          border: 1.5px solid var(--border);
          background: var(--surface);
          color: var(--ink);
          font-family: var(--font-body);
          font-size: 13.5px;
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
