import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '../config/apiConfig';
import { useAuth } from '../context/AuthContext';
import { useMessages, toListingId } from '../context/MessagesContext';
import { formatClock, formatDay, isSameDay } from '../utils/time';

// Route: /thread/:id?with=<userId>
//   with  = the other person (optional when :id is a listing owned by them)
//   :id   = listing the NEXT message is about ("direct" = none). The thread itself
//           always shows the whole conversation with that person, across listings.
export default function MessageThread() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { fetchThread, sendMessage, markThreadRead, subscribeToMessages } = useMessages();

  const routeListingId = toListingId(id);
  const withParam = searchParams.get('with');

  const [status, setStatus] = useState('loading'); // loading | ready | notfound
  const [other, setOther] = useState(null); // { id, name, position }
  const [ctx, setCtx] = useState(null); // listing the next message is about: { id, title }
  const [titles, setTitles] = useState({}); // listingId -> title
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);
  const knownTitles = useRef({});

  // Fetch titles for any listing ids we haven't seen yet.
  const ensureTitles = useCallback(async (ids) => {
    const missing = [...new Set(ids)].filter((x) => x && !(x in knownTitles.current));
    if (missing.length === 0) return;
    const { data } = await supabase.from('resource_listings').select('id, title').in('id', missing);
    const next = {};
    (data ?? []).forEach((l) => { next[l.id] = l.title; });
    missing.forEach((x) => { if (!(x in next)) next[x] = 'Removed listing'; });
    knownTitles.current = { ...knownTitles.current, ...next };
    setTitles(knownTitles.current);
  }, []);

  // ---- load the person, the listing context, and the full history --------
  useEffect(() => {
    if (!user) return undefined;
    let cancelled = false;

    (async () => {
      setStatus('loading');
      setError('');
      knownTitles.current = {};
      setTitles({});

      let listing = null;
      if (routeListingId) {
        const { data } = await supabase
          .from('resource_listings')
          .select('id, title, owner_id')
          .eq('id', routeListingId)
          .maybeSingle();
        if (cancelled) return;
        listing = data;
      }

      // Who are we talking to? Explicit ?with=, else the listing's owner.
      const otherId = withParam || (listing && listing.owner_id !== user.id ? listing.owner_id : null);
      if (!otherId || otherId === user.id) return setStatus('notfound');

      const [{ data: prof }, { data: msgs, error: msgErr }] = await Promise.all([
        supabase
          .from('public_profiles')
          .select('id, full_name, official_position')
          .eq('id', otherId)
          .maybeSingle(),
        fetchThread(otherId),
      ]);
      if (cancelled) return;

      if (msgErr) setError('Could not load this conversation.');
      if (listing) {
        knownTitles.current[listing.id] = listing.title;
      }
      await ensureTitles((msgs ?? []).map((m) => m.listing_id));
      if (cancelled) return;
      setTitles({ ...knownTitles.current });

      setCtx(listing ? { id: listing.id, title: listing.title } : null);
      setOther({
        id: otherId,
        name: prof?.full_name || 'Neighbor',
        position: prof?.official_position || null,
      });
      setMessages(msgs ?? []);
      setStatus('ready');
      markThreadRead(otherId);
    })();

    return () => { cancelled = true; };
  }, [user, routeListingId, withParam, fetchThread, markThreadRead, ensureTitles]);

  // ---- live incoming / echoed messages ----------------------------------
  const addMessage = useCallback((m) => {
    setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
    if (m.listing_id) ensureTitles([m.listing_id]);
  }, [ensureTitles]);

  useEffect(() => {
    if (status !== 'ready' || !other) return undefined;
    return subscribeToMessages((m) => {
      const inThread =
        (m.sender_id === other.id && m.recipient_id === user.id) ||
        (m.sender_id === user.id && m.recipient_id === other.id);
      if (!inThread) return;
      addMessage(m);
      // We're looking at it, so it's read.
      if (m.sender_id === other.id) markThreadRead(other.id);
    });
  }, [status, other, user, subscribeToMessages, addMessage, markThreadRead]);

  // ---- keep the newest message in view ----------------------------------
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length, status]);

  // ---- send ---------------------------------------------------------------
  const handleSend = async () => {
    if (sending || !draft.trim() || !other) return;
    setSending(true);
    setError('');
    const { data, error: err } = await sendMessage({
      listingId: ctx?.id ?? null,
      recipientId: other.id,
      body: draft,
    });
    setSending(false);
    if (err) {
      setError('Message not sent. Please try again.');
      return;
    }
    addMessage(data);
    setDraft('');
  };

  const goBack = () => navigate('/messages');

  // ---- render ---------------------------------------------------------------
  if (status === 'loading') {
    return (
      <div className="screen-enter" style={{ padding: '2px 20px 8px' }}>
        <Topbar title="Messages" onBack={goBack} />
        <p className="muted small" style={{ textAlign: 'center', marginTop: 40 }}>Loading…</p>
        <style>{THREAD_CSS}</style>
      </div>
    );
  }

  if (status === 'notfound' || !other) {
    return (
      <div className="screen-enter" style={{ padding: '2px 20px 8px' }}>
        <Topbar title="Messages" onBack={goBack} />
        <div className="card" style={{ marginTop: 20, textAlign: 'center' }}>
          <p className="muted">Conversation not found</p>
          <button className="btn btn-primary btn-sm" style={{ marginTop: 14 }} onClick={goBack}>
            Go to messages
          </button>
        </div>
        <style>{THREAD_CSS}</style>
      </div>
    );
  }

  return (
    <div className="screen-enter" style={{ padding: '2px 20px 8px' }}>
      <Topbar title={other.name} sub={other.position} onBack={goBack} />

      <div className="thread-body">
        {messages.length === 0 && (
          <p className="muted small" style={{ textAlign: 'center', margin: '30px 0' }}>
            No messages yet. Say hello to {other.name.split(' ')[0]}.
          </p>
        )}
        {messages.map((msg, i) => {
          const mine = msg.sender_id === user.id;
          const prev = messages[i - 1];
          const newDay = !prev || !isSameDay(new Date(prev.created_at), new Date(msg.created_at));
          const topicChanged = (prev?.listing_id ?? null) !== (msg.listing_id ?? null);
          // Label when the topic changes (skip a leading "no listing").
          const showTopic = topicChanged && (msg.listing_id || prev);
          return (
            <div key={msg.id} style={{ display: 'contents' }}>
              {newDay && <div className="msg-day">{formatDay(msg.created_at)}</div>}
              {showTopic && (
                msg.listing_id ? (
                  <Link to={`/resource/${msg.listing_id}`} className="msg-topic">
                    Re: {titles[msg.listing_id] || '…'}
                  </Link>
                ) : (
                  <div className="msg-topic plain">General</div>
                )
              )}
              <div className={`msg ${mine ? 'msg-user' : 'msg-owner'}`}>
                <div className="msg-bubble">{msg.body}</div>
                <div className="msg-time">{formatClock(msg.created_at)}</div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {error && <p className="error-text" style={{ marginBottom: 6 }}>{error}</p>}

      <div className="thread-compose">
        {ctx && (
          <div className="thread-ctx">
            <span className="thread-ctx-text">Replying about <strong>{ctx.title}</strong></span>
            <button onClick={() => setCtx(null)} aria-label="Remove listing from next message">×</button>
          </div>
        )}
        <div className="thread-input-row">
          <input
            type="text"
            placeholder="Type a message…"
            value={draft}
            maxLength={2000}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button className="btn btn-accent" onClick={handleSend} disabled={sending || !draft.trim()}>
            {sending ? '…' : 'Send'}
          </button>
        </div>
      </div>

      <style>{THREAD_CSS}</style>
    </div>
  );
}

function Topbar({ title, sub, onBack }) {
  return (
    <div className="topbar">
      <div className="row" style={{ gap: 12 }}>
        <button
          className="btn-ghost btn btn-sm mobile-back"
          onClick={onBack}
          aria-label="Back to messages"
          style={{ padding: '8px 10px' }}
        >
          ←
        </button>
        <div>
          <h2 style={{ fontSize: 17 }}>{title}</h2>
          {sub && <div className="muted small" style={{ marginTop: 2 }}>{sub}</div>}
        </div>
      </div>
    </div>
  );
}

const THREAD_CSS = `
  .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 18px 0 14px;
  }
  .thread-body {
    display: flex;
    flex: 1 1 0;
    flex-direction: column;
    gap: 8px;
    min-height: 0;
    overflow-y: auto;
    padding: 4px 2px 12px;
  }
  .msg-day {
    align-self: center;
    flex-shrink: 0;
    font-size: 11px;
    font-weight: 600;
    color: var(--ink-soft);
    background: var(--surface-alt);
    padding: 3px 10px;
    border-radius: 999px;
    margin: 6px 0 2px;
  }
  .msg-topic {
    align-self: center;
    flex-shrink: 0;
    max-width: 90%;
    font-size: 11.5px;
    font-weight: 600;
    color: var(--accent);
    border: 1px solid var(--border);
    background: var(--surface);
    padding: 4px 11px;
    border-radius: 999px;
    margin: 4px 0 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .msg-topic.plain { color: var(--ink-soft); }
  .msg {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    max-width: 75%;
  }
  .msg-user { align-self: flex-end; align-items: flex-end; }
  .msg-owner { align-self: flex-start; align-items: flex-start; }
  .msg-bubble {
    padding: 10px 14px;
    border-radius: 14px;
    font-size: 13.5px;
    line-height: 1.45;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  .msg-user .msg-bubble {
    background: var(--strong);
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
  .thread-compose {
    position: sticky;
    bottom: calc(68px + env(safe-area-inset-bottom, 0px));
    background: var(--bg);
    padding: 3px 0;
  }
  @media (max-width: 899px) {
    .thread-compose {
      padding-bottom: 1px;
    }
  }
  .thread-ctx {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 6px 10px;
    margin-bottom: 8px;
    border: 1px solid var(--border);
    border-radius: 10px;
    background: var(--surface);
    font-size: 12px;
    color: var(--ink-soft);
  }
  .thread-ctx-text {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .thread-ctx strong { color: var(--ink); }
  .thread-ctx button {
    border: none;
    background: var(--surface-alt);
    color: var(--ink-soft);
    width: 22px;
    height: 22px;
    border-radius: 50%;
    cursor: pointer;
    flex-shrink: 0;
  }
  .thread-input-row {
    display: flex;
    gap: 8px;
  }
  .thread-input-row input {
    flex: 1;
    min-width: 0;
    padding: 11px 14px;
    border-radius: 12px;
    border: 1.5px solid var(--border);
    background: var(--surface);
    color: var(--ink);
    font-family: var(--font-body);
    font-size: 13.5px;
  }
  .thread-input-row input:focus { outline: 2px solid var(--accent); outline-offset: 1px; }
  .thread-input-row .btn:disabled { opacity: 0.55; cursor: default; }

  @media (min-width: 900px) {
    .mobile-back { display: none; }
    .thread-compose {
      bottom: 12px;
      padding: 8px 0;
    }
  }
`;