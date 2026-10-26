import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvac } from '../context/EvacContext';
import { useAuth } from '../context/AuthContext';

const STATUS_LABEL = { open: 'Open', full: 'Full', closed: 'Closed' };

const amenityColor = (status) => {
  switch (status) {
    case 'Available': return 'var(--safe)';
    case 'Limited': return 'var(--accent)';
    case 'Unavailable': return 'var(--danger)';
    default: return 'var(--ink-soft)';
  }
};

export default function EvacDetail() {
  const { id } = useParams(); // evacuation_centers.id (uuid)
  const navigate = useNavigate();
  const { user } = useAuth();
  const { centers, loading, canManage, setOccupancy, openCenter, closeCenter } = useEvac();

  const evac = centers.find((c) => c.id === id);

  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);

  // keep the input in sync with the server value (initial load, +/- buttons, other edits)
  useEffect(() => {
    if (evac) setDraft(String(evac.occupancy));
  }, [evac?.occupancy]); // eslint-disable-line react-hooks/exhaustive-deps

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  };

  const Topbar = (
    <div className="topbar">
      <div className="row" style={{ gap: 12 }}>
        <button className="btn-ghost btn btn-sm mobile-back" onClick={() => navigate('/map')} aria-label="Go back" style={{ padding: '8px 10px' }}>←</button>
        <h2 style={{ fontSize: 17 }}>Evacuation center</h2>
      </div>
    </div>
  );

  if (!evac && loading) {
    return (
      <div className="screen-enter" style={{ padding: '2px 20px 100px' }}>
        {Topbar}
        <p className="small muted" style={{ textAlign: 'center', marginTop: 40 }}>Loading…</p>
      </div>
    );
  }

  if (!evac) {
    return (
      <div className="screen-enter" style={{ padding: '2px 20px 100px' }}>
        {Topbar}
        <div className="card" style={{ marginTop: 20, textAlign: 'center' }}>
          <p className="muted">Evacuation center not found</p>
        </div>
      </div>
    );
  }

  const isOfficial = user?.role === 'official';
  const ratio = evac.capacity > 0 ? evac.occupancy / evac.capacity : 0;
  const closed = evac.status === 'closed';

  const saveOccupancy = async (value) => {
    const n = Number.parseInt(value, 10);
    if (!Number.isFinite(n)) {
      setDraft(String(evac.occupancy));
      return;
    }
    if (n === evac.occupancy) return;
    setBusy(true);
    const res = await setOccupancy(evac.id, n);
    setBusy(false);
    if (res.error) {
      setDraft(String(evac.occupancy));
      notify(res.error);
      return;
    }
    notify(res.center.status === 'full' ? 'Occupancy updated — center is now full' : 'Occupancy updated');
  };

  const toggleOpen = async () => {
    setBusy(true);
    const res = closed ? await openCenter(evac.id) : await closeCenter(evac.id);
    setBusy(false);
    notify(res.error ?? (closed ? 'Center opened' : 'Center closed'));
  };

  const getDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${evac.lat},${evac.lng}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="screen-enter" style={{ padding: '2px 20px 100px' }}>
      {Topbar}

      {/* Main Info Card */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="row between" style={{ alignItems: 'flex-start', gap: 10 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 16 }}>{evac.name}</div>
            <div className="muted small" style={{ marginTop: 3 }}>{evac.address || 'No address given'}</div>
          </div>
          <span className={`evac-status ${evac.status}`}>{STATUS_LABEL[evac.status]}</span>
        </div>

        <div className="cap-bar" style={{ marginTop: 14 }}>
          <div
            className="cap-fill"
            style={{
              width: `${Math.min(100, ratio * 100)}%`,
              background: closed ? 'var(--border)' : ratio > 0.9 ? 'var(--grad-danger)' : 'var(--grad-safe)',
            }}
          ></div>
        </div>
        <div className="row between" style={{ marginTop: 8 }}>
          <span className="small muted">Capacity</span>
          <span className="small muted">{evac.occupancy} / {evac.capacity}</span>
        </div>

        {closed && (
          <p className="small muted" style={{ marginTop: 10 }}>
            This center is currently closed. Check announcements for when it opens.
          </p>
        )}
        {evac.status === 'full' && (
          <p className="small" style={{ marginTop: 10, color: 'var(--danger)', fontWeight: 600 }}>
            This center is full. Head to another open center nearby.
          </p>
        )}
      </div>

      {/* Manage (officials with evac permission, and admins) */}
      {canManage && (
        <>
          <div className="section-label" style={{ marginTop: 0 }}>
            <h3>Manage center</h3>
          </div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="field" style={{ marginBottom: 10 }}>
              <label htmlFor="evac-occupancy">Current occupancy</label>
              <div className="row" style={{ gap: 8, alignItems: 'center' }}>
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={busy || evac.occupancy <= 0}
                  onClick={() => saveOccupancy(evac.occupancy - 1)}
                  aria-label="Decrease occupancy"
                >−</button>
                <input
                  id="evac-occupancy"
                  type="number"
                  min={0}
                  max={evac.capacity}
                  value={draft}
                  disabled={busy}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveOccupancy(draft)}
                  style={{ flex: 1, minWidth: 0, textAlign: 'center' }}
                />
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={busy || evac.occupancy >= evac.capacity}
                  onClick={() => saveOccupancy(evac.occupancy + 1)}
                  aria-label="Increase occupancy"
                >+</button>
              </div>
              <p className="small muted" style={{ marginTop: 6 }}>
                Capacity is {evac.capacity}. The center switches to Full automatically when the count reaches it.
              </p>
            </div>
            <button
              className="btn btn-accent btn-block"
              disabled={busy || draft === String(evac.occupancy)}
              onClick={() => saveOccupancy(draft)}
            >
              {busy ? 'Saving…' : 'Save occupancy'}
            </button>
            <button
              className={`btn btn-block ${closed ? 'btn-primary' : 'btn-ghost'}`}
              style={{ marginTop: 10 }}
              disabled={busy}
              onClick={toggleOpen}
            >
              {closed ? 'Open center' : 'Close center'}
            </button>
          </div>
        </>
      )}

      {isOfficial && !canManage && (
        <p className="small muted" style={{ margin: '-4px 0 16px' }}>
          Your position doesn't include evacuation-center management. A Barangay Captain, Kagawad, or BDRRM Officer can update capacity here.
        </p>
      )}

      {/* On-site Amenities */}
      <div className="section-label" style={{ marginTop: 0 }}>
        <h3>On-site</h3>
      </div>
      <div className="card" style={{ marginBottom: 16 }}>
        {evac.amenities.length === 0 ? (
          <p className="small muted">No amenities listed.</p>
        ) : (
          evac.amenities.map((amenity, i) => (
            <div key={`${amenity.name}-${i}`} className="list-item" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 0',
              borderTop: i > 0 ? '1px solid var(--border)' : 'none',
            }}>
              <span>{amenity.name}</span>
              <span className="small" style={{ fontWeight: 600, color: amenityColor(amenity.status) }}>
                {amenity.status}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Get Directions Button */}
      <button className="btn btn-primary btn-block" onClick={getDirections}>
        Get directions
      </button>

      {toast && <div className="evac-toast" role="status">{toast}</div>}

      <style>{`
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 18px 20px 14px;
        }
        .evac-status {
          flex-shrink: 0;
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 600;
        }
        .evac-status.open { background: var(--safe); color: #fff; }
        .evac-status.full { background: var(--danger); color: #fff; }
        .evac-status.closed { background: var(--surface-alt); color: var(--ink-soft); }
        .btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
        .evac-toast {
          position: fixed;
          left: 50%;
          bottom: 96px;
          transform: translateX(-50%);
          z-index: 120;
          max-width: calc(100vw - 40px);
          padding: 10px 16px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 500;
          color: #fff;
          background: rgba(20, 24, 33, 0.92);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
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