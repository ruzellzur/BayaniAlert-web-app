import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMessages, threadPath } from '../context/MessagesContext';
import { formatRelative, initialsOf } from '../utils/time';

export default function Inbox() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { conversations, loading, unreadCount, searchMessages } = useMessages();

  const [query, setQuery] = useState('');
  const [matches, setMatches] = useState(new Map()); // otherId -> newest matching message body
  const [searching, setSearching] = useState(false);

  const term = query.trim();

  // Search message bodies on the server (debounced); names are matched locally.
  useEffect(() => {
    if (!term) {
      setMatches(new Map());
      setSearching(false);
      return undefined;
    }
    let cancelled = false;
    setSearching(true);
    const t = setTimeout(async () => {
      const found = await searchMessages(term);
      if (!cancelled) {
        setMatches(found);
        setSearching(false);
      }
    }, 250);
    return () => { cancelled = true; clearTimeout(t); };
  }, [term, searchMessages]);

  const rows = useMemo(() => {
    if (!term) return conversations.map((c) => ({ c, snippet: null }));
    const needle = term.toLowerCase();
    return conversations
      .map((c) => {
        const nameHit = (c.other_name || '').toLowerCase().includes(needle);
        const body = matches.get(c.other_id);
        return nameHit || body ? { c, snippet: body && !nameHit ? body : null } : null;
      })
      .filter(Boolean);
  }, [conversations, matches, term]);

  return (
    <div className="screen-enter" style={{ padding: '2px 20px 100px' }}>
      <div className="topbar">
        <div className="row" style={{ gap: 12 }}>
          <h2 style={{ fontSize: 20 }}>Messages</h2>
          {unreadCount > 0 && <span className="inbox-pill">{unreadCount} unread</span>}
        </div>
      </div>

      <div className="inbox-search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
        </svg>
        <input
          type="search"
          placeholder="Search by name or message"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search conversations"
        />
        {query && (
          <button className="inbox-clear" onClick={() => setQuery('')} aria-label="Clear search">×</button>
        )}
      </div>

      {loading && conversations.length === 0 && (
        <p className="muted small" style={{ textAlign: 'center', marginTop: 40 }}>Loading…</p>
      )}

      {!loading && conversations.length === 0 && (
        <div className="card" style={{ textAlign: 'center', marginTop: 12 }}>
          <p style={{ fontWeight: 600, marginBottom: 6 }}>No messages yet</p>
          <p className="muted small" style={{ lineHeight: 1.5 }}>
            Open an item on the resource board and tap “Message owner” to start a conversation with a neighbor.
          </p>
          <button className="btn btn-primary btn-sm" style={{ marginTop: 14 }} onClick={() => navigate('/board')}>
            Browse the board
          </button>
        </div>
      )}

      {conversations.length > 0 && rows.length === 0 && !searching && (
        <p className="muted small" style={{ textAlign: 'center', marginTop: 30 }}>
          No conversations match “{term}”.
        </p>
      )}

      {rows.length > 0 && (
        <div className="card inbox-list">
          {rows.map(({ c, snippet }) => {
            const name = c.other_name || 'Neighbor';
            const mine = c.last_sender_id === user?.id;
            const unread = c.unread_count > 0;
            return (
              <button
                key={c.other_id}
                className="inbox-row"
                onClick={() => navigate(threadPath(c.last_listing_id, c.other_id))}
              >
                <span className="inbox-av">{initialsOf(name)}</span>
                <span className="inbox-main">
                  <span className="inbox-top">
                    <span className={`inbox-name ${unread ? 'strong' : ''}`}>
                      {name}
                      {c.other_position && <span className="inbox-role"> · {c.other_position}</span>}
                    </span>
                    <span className="inbox-time">{formatRelative(c.last_at)}</span>
                  </span>
                  {c.last_listing_title && !snippet && (
                    <span className="inbox-listing">Re: {c.last_listing_title}</span>
                  )}
                  <span className="inbox-bottom">
                    <span className={`inbox-preview ${unread && !snippet ? 'strong' : ''}`}>
                      {snippet ? <HighlightedText text={snippet} term={term} /> : <>{mine ? 'You: ' : ''}{c.last_body}</>}
                    </span>
                    {unread && <span className="inbox-badge">{c.unread_count}</span>}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      <style>{`
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 18px 0 14px;
        }
        .inbox-pill {
          font-size: 11.5px;
          font-weight: 600;
          padding: 4px 9px;
          border-radius: 999px;
          background: var(--grad-accent);
          color: var(--accent-ink);
        }
        .inbox-search {
          position: relative;
          display: flex;
          align-items: center;
          margin-bottom: 14px;
        }
        .inbox-search svg {
          position: absolute;
          left: 13px;
          width: 17px;
          height: 17px;
          color: var(--ink-soft);
          pointer-events: none;
        }
        .inbox-search input {
          width: 100%;
          padding: 11px 36px 11px 38px;
          border-radius: 12px;
          border: 1.5px solid var(--border);
          background: var(--surface);
          color: var(--ink);
          font-family: var(--font-body);
          font-size: 13.5px;
          -webkit-appearance: none;
          appearance: none;
        }
        .inbox-search input::-webkit-search-cancel-button { display: none; }
        .inbox-search input:focus { outline: 2px solid var(--accent); outline-offset: 1px; }
        .inbox-clear {
          position: absolute;
          right: 8px;
          width: 26px;
          height: 26px;
          border: none;
          border-radius: 50%;
          background: var(--surface-alt);
          color: var(--ink-soft);
          font-size: 16px;
          line-height: 1;
          cursor: pointer;
        }
        .inbox-list { padding: 4px 14px; }
        .inbox-row {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          width: 100%;
          padding: 13px 0;
          border: none;
          border-top: 1px solid var(--border);
          background: none;
          color: inherit;
          text-align: left;
          cursor: pointer;
        }
        .inbox-row:first-child { border-top: none; }
        .inbox-av {
          width: 40px;
          height: 40px;
          border-radius: 11px;
          background: var(--grad-cool);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 13.5px;
          flex-shrink: 0;
        }
        .inbox-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
        .inbox-top { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
        .inbox-name { font-size: 13.5px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .inbox-name.strong, .inbox-preview.strong { font-weight: 700; color: var(--ink); }
        .inbox-role { font-size: 11.5px; font-weight: 500; color: var(--ink-soft); }
        .inbox-time { font-size: 11px; color: var(--ink-soft); flex-shrink: 0; }
        .inbox-listing {
          font-size: 11.5px;
          font-weight: 600;
          color: var(--accent);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .inbox-bottom { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
        .inbox-preview {
          font-size: 12.5px;
          color: var(--ink-soft);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .inbox-preview mark {
          background: rgba(226,154,59,0.28);
          color: var(--ink);
          border-radius: 3px;
          padding: 0 1px;
        }
        .inbox-badge {
          min-width: 20px;
          height: 20px;
          padding: 0 6px;
          border-radius: 999px;
          background: var(--danger);
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        @media (hover: hover) {
          .inbox-row:hover .inbox-name { color: var(--accent); }
        }
      `}</style>
    </div>
  );
}

// Bold the matched term inside a (truncated-by-CSS) message preview.
function HighlightedText({ text, term }) {
  const i = text.toLowerCase().indexOf(term.toLowerCase());
  if (i < 0) return text;
  // Start a little before the match so it isn't cut off by ellipsis.
  const start = Math.max(0, i - 18);
  return (
    <>
      {start > 0 && '…'}
      {text.slice(start, i)}
      <mark>{text.slice(i, i + term.length)}</mark>
      {text.slice(i + term.length)}
    </>
  );
}