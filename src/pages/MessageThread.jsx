import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeftIcon } from '../components/icons';

/**
 * Message Thread Page
 *
 * Markup matches the prototype's `#screen-thread`:
 *   .topbar > .row (mobile-back + h2#threadName)
 *   #threadBody > .bubble.me | .bubble.them
 *   sticky composer row (input + Send)
 *
 * All visual rules live in src/styles/prototype.css.
 */
const INPUT_STYLE = {
  flex: 1,
  padding: '11px 14px',
  borderRadius: 12,
  border: '1.5px solid var(--border)',
  background: 'var(--surface)',
  color: 'var(--ink)',
};

export default function MessageThread() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { resources, messages, sendMessage } = useApp();

  const resourceId = parseInt(id, 10);
  const resource = resources.find((r) => r.id === resourceId);
  const ownerName = resource ? resource.owner.split('·')[0].trim() : '';

  const [text, setText] = useState('');
  const bodyRef = useRef(null);
  const thread = (messages && messages[ownerName]) || [];

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [thread.length]);

  const send = () => {
    const val = text.trim();
    if (!val || !ownerName) return;
    sendMessage?.(ownerName, val);
    setText('');
  };

  return (
    <section className="screen active" id="screen-thread">
      {/* Topbar */}
      <div className="topbar">
        <div className="row" style={{ gap: 12 }}>
          <button
            className="btn-ghost btn btn-sm mobile-back"
            onClick={() => navigate(`/resource/${id}`)}
            aria-label="Go back"
            style={{ padding: '8px 10px' }}
          >
            <ArrowLeftIcon />
          </button>
          <h2 style={{ fontSize: 17 }} id="threadName">
            {ownerName || 'Neighbor'}
          </h2>
        </div>
      </div>

      {/* Messages */}
      <div
        id="threadBody"
        ref={bodyRef}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          minHeight: 260,
          padding: '4px 2px 12px',
          overflowY: 'auto',
        }}
      >
        {thread.length === 0 ? (
          <div className="muted small" style={{ textAlign: 'center', marginTop: 24 }}>
            Say hello to {ownerName || 'your neighbor'} about this item.
          </div>
        ) : (
          thread.map((m, i) => (
            <div key={i} className={'bubble ' + (m.from === 'me' ? 'me' : 'them')}>
              {m.text}
            </div>
          ))
        )}
      </div>

      {/* Composer */}
      <div
        className="row"
        style={{ gap: 8, position: 'sticky', bottom: 0, background: 'var(--bg)', paddingTop: 8 }}
      >
        <input
          type="text"
          id="threadInput"
          placeholder="Type a message…"
          style={INPUT_STYLE}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') send();
          }}
        />
        <button className="btn btn-accent" onClick={send}>
          Send
        </button>
      </div>
    </section>
  );
}
