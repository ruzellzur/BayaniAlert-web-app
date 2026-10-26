import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext'; // toast still lives here
import { useMyCheckin, useCheckinBoard, timeAgo, CHECKIN_WINDOW_HOURS } from '../hooks/useCheckIns';

const STATUS_LABEL = { safe: 'Checked in safe', help: 'Needs help', none: 'No response' };

function describeMine(latest, status) {
  if (!latest || status === 'none') return "You haven't checked in recently";
  const when = timeAgo(latest.created_at);
  if (latest.status === 'needs_help') {
    return latest.resolved ? `Help request resolved · ${when}` : `Help requested · ${when}`;
  }
  return `Marked safe · ${when}`;
}

export default function Checkin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { showToast } = useApp();

  const isOfficial = user?.role === 'official';
  const isResident = user?.role === 'resident';
  const canRescue = !!user?.permissions?.rescue;
  const scope = user?.purokName || 'All puroks';

  const mine = useMyCheckin(isResident ? user : null);
  const board = useCheckinBoard(user, isOfficial);

  const [filter, setFilter] = useState(location.state?.filter ?? 'all');
  const [note, setNote] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [busy, setBusy] = useState(false);

  const { counts } = board;
  const pct = counts.total ? (counts.responded / counts.total) * 100 : 0;
  const filtered = board.households.filter((h) => filter === 'all' || h.status === filter);
  const selected = board.households.find((h) => h.id === selectedId) ?? null;

  const statColors = {
    safe: 'var(--grad-safe)',
    help: 'var(--grad-danger)',
    none: 'var(--ink-soft)',
  };

  const sendMine = async (status) => {
    const res = await mine.submit(status, status === 'help' ? note : '');
    if (res.error) return showToast(res.error);
    setNote('');
    showToast(status === 'safe' ? "Thanks — you're marked safe" : 'Help request sent to your barangay officials');
  };

  const handleRecord = async (h, status) => {
    setBusy(true);
    const res = await board.record(h, status);
    setBusy(false);
    showToast(res.error || `Hh. ${h.no} marked ${status === 'help' ? 'as needing help' : 'safe'}`);
  };

  return (
    <div className="screen-enter" style={{ padding: '2px 20px 100px' }}>
      <div className="topbar">
        <div className="row" style={{ gap: 12 }}>
          <button className="btn-ghost btn btn-sm mobile-back" onClick={() => navigate('/home')} aria-label="Go back" style={{ padding: '8px 10px' }}>←</button>
          <h2 style={{ fontSize: 17 }}>Safety check-in</h2>
        </div>
      </div>

      {/* Resident view */}
      {isResident && (
        <div className="card me-card">
          <div className="avatar">{user?.initials || '?'}</div>
          {user?.household ? (
            <>
              <div style={{ fontWeight: 600, fontSize: 15 }}>
                {user.name} — Household #{user.householdNo}
              </div>
              <div className="me-status">
                {mine.loading ? 'Loading…' : describeMine(mine.latest, mine.status)}
              </div>
              <textarea
                className="me-note"
                rows={2}
                maxLength={300}
                placeholder="Add a note for responders (optional, sent with “Need help”)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <div className="status-btns">
                <button className="btn btn-safe" style={{ flex: 1 }} disabled={mine.sending} onClick={() => sendMine('safe')}>I'm safe</button>
                <button className="btn btn-danger" style={{ flex: 1 }} disabled={mine.sending} onClick={() => sendMine('help')}>Need help</button>
              </div>
            </>
          ) : (
            <>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{user?.name}</div>
              <div className="me-status">Set up your household so officials can find you and see your check-in.</div>
              <button className="btn btn-accent btn-block" style={{ marginTop: 16 }} onClick={() => navigate('/household-setup')}>
                Set up household
              </button>
            </>
          )}
        </div>
      )}

      {/* Official view */}
      {isOfficial && (
        <>
          <div className="card">
            <div className="row between">
              <span style={{ fontWeight: 600, fontSize: 14 }}>{scope} check-in status</span>
              <span className="small muted">{counts.responded} / {counts.total} responded</span>
            </div>
            <div className="cap-bar" style={{ marginTop: 10 }}>
              <div className="cap-fill" style={{ width: `${pct}%` }}></div>
            </div>
            <div className="stat-trio">
              <div>
                <div className="n" style={{ color: 'var(--safe)' }}>{counts.safe}</div>
                <div className="l">Safe</div>
              </div>
              <div>
                <div className="n" style={{ color: 'var(--danger)' }}>{counts.help}</div>
                <div className="l">Need help</div>
              </div>
              <div>
                <div className="n" style={{ color: 'var(--ink-soft)' }}>{counts.none}</div>
                <div className="l">No response</div>
              </div>
            </div>
          </div>

          <div className="section-label">
            <h3>{scope} households</h3>
            <span className="muted small">{counts.responded} of {counts.total} checked in</span>
          </div>

          <div className="chip-row" style={{ marginBottom: 10 }}>
            {['all', 'safe', 'help', 'none'].map((f) => (
              <span key={f} className={`chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f === 'all' ? 'All' : f === 'help' ? 'Needs help' : f === 'none' ? 'No response' : 'Safe'}
              </span>
            ))}
          </div>

          <div className="card">
            {board.loading ? (
              <p className="small muted" style={{ textAlign: 'center', padding: '10px 0' }}>Loading…</p>
            ) : board.error ? (
              <p className="small" style={{ textAlign: 'center', padding: '10px 0', color: 'var(--danger)' }}>{board.error}</p>
            ) : !user?.barangayId ? (
              <p className="small muted" style={{ textAlign: 'center', padding: '10px 0' }}>Your account isn't linked to a barangay.</p>
            ) : filtered.length === 0 ? (
              <p className="small muted" style={{ textAlign: 'center', padding: '10px 0' }}>
                {counts.total === 0 ? 'No households registered yet.' : 'No households match this filter.'}
              </p>
            ) : (
              <div className="house-grid">
                {filtered.map((h) => (
                  <div key={h.id} className="house" onClick={() => setSelectedId(h.id)} style={{ cursor: 'pointer' }}>
                    <div className="dot" style={{ background: statColors[h.status] }}>{h.initials}</div>
                    <div className="nm">Hh. {h.no}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {!isOfficial && !isResident && (
        <p className="small muted" style={{ textAlign: 'center', marginTop: 20 }}>
          Check-ins are available to residents and barangay officials.
        </p>
      )}

      <p className="demo-note">
        {isOfficial
          ? canRescue
            ? 'Tap a household to see its details or update its status — for rescue/response duty.'
            : "Tap a household to see its details. Your position can't update check-in status; a BDRRM Officer, Tanod or Rescue Team member can."
          : `Your barangay officials can see your household's status live to know who may need help. A safe check-in counts for ${CHECKIN_WINDOW_HOURS} hours.`}
      </p>

      {/* Household detail sheet */}
      {selected && (
        <div className="sheet-backdrop" onClick={() => setSelectedId(null)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="row between" style={{ alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 16 }}>Hh. {selected.no} — {selected.name}</div>
                <div className="small muted" style={{ marginTop: 2 }}>{selected.address}</div>
              </div>
              <button className="btn-ghost btn btn-sm" onClick={() => setSelectedId(null)} aria-label="Close">✕</button>
            </div>

            <div className="sheet-status" style={{ background: statColors[selected.status] }}>
              {STATUS_LABEL[selected.status]}
            </div>

            <div className="sheet-rows">
              <div className="list-row"><span>Members</span><span>{selected.members}{selected.vulnerable ? ' · has vulnerable members' : ''}</span></div>
              <div className="list-row">
                <span>Last check-in</span>
                <span>
                  {selected.checkedAt
                    ? `${timeAgo(selected.checkedAt)}${selected.byResponder ? ' (recorded by responder)' : ''}`
                    : 'None yet'}
                </span>
              </div>
              {selected.note && <div className="list-row"><span>Note</span><span>{selected.note}</span></div>}
              {selected.notes && <div className="list-row"><span>Household notes</span><span>{selected.notes}</span></div>}
            </div>

            {selected.contacts.length > 0 && (
              <>
                <div className="small muted" style={{ margin: '14px 0 6px', fontWeight: 600 }}>Emergency contacts</div>
                {selected.contacts.map((c, i) => (
                  <div key={i} className="list-row">
                    <span>{c.name}{c.relationship ? ` · ${c.relationship}` : ''}</span>
                    <a href={`tel:${c.phone}`} style={{ fontWeight: 600 }}>{c.phone}</a>
                  </div>
                ))}
              </>
            )}

            {canRescue && (
              <div className="status-btns" style={{ marginTop: 18 }}>
                <button className="btn btn-safe" style={{ flex: 1 }} disabled={busy} onClick={() => handleRecord(selected, 'safe')}>
                  Mark safe
                </button>
                <button className="btn btn-danger" style={{ flex: 1 }} disabled={busy} onClick={() => handleRecord(selected, 'help')}>
                  Needs help
                </button>
              </div>
            )}
          </div>
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
        .me-card { text-align: center; padding: 22px 16px; }
        .me-card .avatar {
          width: 58px;
          height: 58px;
          border-radius: 50%;
          margin: 0 auto 12px;
          background: var(--grad-primary);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 20px;
          box-shadow: 0 6px 16px rgba(27,42,74,0.25);
        }
        .me-status { font-size: 13px; color: var(--ink-soft); margin-top: 4px; }
        .me-note {
          width: 100%;
          margin-top: 14px;
          border: 1.5px solid var(--border);
          border-radius: 12px;
          padding: 10px 12px;
          font-family: var(--font-body);
          font-size: 13px;
          resize: none;
          background: var(--surface);
          color: var(--ink);
        }
        .status-btns { display: flex; gap: 10px; margin-top: 14px; }
        .house-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-top: 4px;
        }
        .house { display: flex; flex-direction: column; align-items: center; gap: 6px; }
        .house .dot {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 14px;
          color: #fff;
        }
        .house .nm {
          font-size: 10.5px;
          text-align: center;
          color: var(--ink-soft);
          font-weight: 600;
          line-height: 1.2;
        }
        .stat-trio { display: flex; gap: 22px; margin-top: 14px; }
        .stat-trio .n { font-family: var(--font-display); font-weight: 600; font-size: 18px; }
        .stat-trio .l { font-size: 11px; color: var(--ink-soft); margin-top: 2px; }
        .demo-note {
          font-size: 11px;
          color: var(--ink-soft);
          text-align: center;
          margin-top: 16px;
          line-height: 1.5;
        }
        .sheet-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.45);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          z-index: 50;
        }
        .sheet {
          width: min(520px, 100%);
          max-height: 85vh;
          overflow-y: auto;
          background: var(--surface);
          color: var(--ink);
          border-radius: 20px 20px 0 0;
          padding: 20px;
          box-shadow: 0 -8px 30px rgba(0,0,0,0.2);
        }
        .sheet-status {
          display: inline-block;
          margin-top: 12px;
          padding: 5px 12px;
          border-radius: 999px;
          color: #fff;
          font-size: 12px;
          font-weight: 600;
        }
        .sheet-rows { margin-top: 10px; }
        .list-row {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          padding: 9px 0;
          border-top: 1px solid var(--border);
          font-size: 13px;
        }
        .list-row span:last-child { text-align: right; color: var(--ink-soft); }

        @media (min-width: 900px) {
          .topbar { padding: 26px 0 20px; }
          .mobile-back { display: none; }
          .house-grid { grid-template-columns: repeat(auto-fill, minmax(64px, 1fr)); }
          .sheet-backdrop { align-items: center; }
          .sheet { border-radius: 20px; }
        }
      `}</style>
    </div>
  );
}