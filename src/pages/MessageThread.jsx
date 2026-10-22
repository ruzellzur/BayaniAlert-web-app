import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/app-context';

export default function MessageThread() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { resources } = useApp();
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
      <div className="screen-enter">
        <div className="topbar">
          <div className="row" style={{ gap: 12 }}>
            <button className="btn-ghost btn btn-sm mobile-back" onClick={() => navigate('/board')} aria-label="Go back" style={{ padding: '8px 10px' }}>←</button>
            <h2 style={{ fontSize: 17 }}>Messages</h2>
          </div>
        </div>
        <div className="card" style={{ marginTop: 20 }}>
          <div className="empty-state">
            <span className="ic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"/>
              </svg>
            </span>
            <h4>Conversation not found</h4>
            <p>This message thread is no longer available. Head back to the board to start a new one.</p>
            <button className="btn btn-accent btn-sm" style={{ marginTop: 6 }} onClick={() => navigate('/board')}>Back to board</button>
          </div>
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
    <div className="screen-enter">
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
        .thread-body {
          display: flex;
          flex-direction: column;
          gap: 10px;
          min-height: 260px;
          padding: 4px 2px 14px;
        }
        .msg {
          display: flex;
          flex-direction: column;
          max-width: 76%;
          animation: popIn 0.28s var(--ease) both;
        }
        .msg-user { align-self: flex-end; align-items: flex-end; }
        .msg-owner { align-self: flex-start; align-items: flex-start; }
        .msg-bubble {
          padding: 11px 15px;
          border-radius: 16px;
          font-size: 13.5px;
          line-height: 1.45;
          box-shadow: var(--card-shadow);
        }
        .msg-user .msg-bubble {
          background: var(--grad-primary);
          color: var(--on-strong);
          border-bottom-right-radius: 5px;
        }
        .msg-owner .msg-bubble {
          background: var(--surface);
          border: 1px solid var(--border);
          border-bottom-left-radius: 5px;
        }
        .msg-time {
          font-size: 10px;
          color: var(--ink-soft);
          margin-top: 4px;
          font-weight: 600;
        }
        .thread-input-row {
          display: flex;
          gap: 8px;
          position: sticky;
          bottom: 0;
          background: var(--bg);
          padding-top: 10px;
        }
        .thread-input-row input {
          flex: 1;
          padding: 12px 14px;
          border-radius: 14px;
          border: 1.5px solid var(--border);
          background: var(--surface);
          color: var(--ink);
          font-family: var(--font-body);
          font-size: 13.5px;
          transition: border-color 0.18s ease, box-shadow 0.18s ease;
        }
        .thread-input-row input:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 4px var(--accent-soft);
        }

      `}</style>
    </div>
  );
}
