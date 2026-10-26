import { useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeftIcon } from '../components/icons';

/**
 * Evacuation Center Detail Page
 *
 * Markup matches the prototype's `#screen-evacDetail`:
 *   .topbar > .row (mobile-back + h2)
 *   .card (name + addr + cap-bar + capacity row)
 *   .role-swap[data-role=official] (update capacity form)
 *   .role-swap[data-role=official] (no-permission note)
 *   .section-label + .card#evacAmenities > .list-item
 *   .btn.btn-primary.btn-block (get directions)
 *
 * All visual rules live in src/styles/prototype.css.
 */
const AMENITY_COLORS = {
  Available: 'var(--safe)',
  Limited: 'var(--accent)',
  Unavailable: 'var(--danger)',
};
const AMENITY_CYCLE = ['Available', 'Limited', 'Unavailable'];

export default function EvacDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { evacCenters, updateEvacCenter, user, showToast } = useApp();

  const index = parseInt(id, 10);
  const evac = evacCenters[index] || evacCenters[0];
  const capRef = useRef(null);

  if (!evac) {
    return (
      <section className="screen active" id="screen-evacDetail">
        <div className="topbar">
          <div className="row" style={{ gap: 12 }}>
            <button
              className="btn-ghost btn btn-sm mobile-back"
              onClick={() => navigate('/map')}
              aria-label="Go back"
              style={{ padding: '8px 10px' }}
            >
              <ArrowLeftIcon />
            </button>
            <h2 style={{ fontSize: 17 }}>Evacuation center</h2>
          </div>
        </div>
        <div className="card">
          <p className="small muted">Evacuation center not found.</p>
        </div>
      </section>
    );
  }

  const isOfficial = user?.role === 'official';
  const canManageEvac = !!user?.permissions?.evac;

  const saveCapacity = () => {
    let val = parseInt(capRef.current?.value, 10);
    if (isNaN(val) || val < 0) val = 0;
    if (val > evac.max) val = evac.max;
    updateEvacCenter(evacCenters.indexOf(evac), { cap: val });
    showToast?.('Capacity updated');
  };

  const cycleAmenity = (ai) => {
    const a = evac.amenities[ai];
    const next = AMENITY_CYCLE[(AMENITY_CYCLE.indexOf(a.status) + 1) % AMENITY_CYCLE.length];
    updateEvacCenter(evacCenters.indexOf(evac), {
      amenities: evac.amenities.map((x, k) => (k === ai ? { ...x, status: next } : x)),
    });
    showToast?.(a.name + ': ' + next);
  };

  const fillPct = Math.round((evac.cap / evac.max) * 100);

  return (
    <section className="screen active" id="screen-evacDetail">
      {/* Topbar */}
      <div className="topbar">
        <div className="row" style={{ gap: 12 }}>
          <button
            className="btn-ghost btn btn-sm mobile-back"
            onClick={() => navigate('/map')}
            aria-label="Go back"
            style={{ padding: '8px 10px' }}
          >
            <ArrowLeftIcon />
          </button>
          <h2 style={{ fontSize: 17 }}>Evacuation center</h2>
        </div>
      </div>

      {/* Main info card */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ fontWeight: 600, fontSize: 16 }}>{evac.name}</div>
        <div className="muted small" style={{ marginTop: 3 }}>{evac.addr}</div>
        <div className="cap-bar" style={{ marginTop: 14 }}>
          <div className="cap-fill" style={{ width: `${fillPct}%` }} />
        </div>
        <div className="row between" style={{ marginTop: 8 }}>
          <span className="small muted">Capacity</span>
          <span className="small muted">{evac.cap} / {evac.max}</span>
        </div>
      </div>

      {/* Update capacity — officials with evac permission */}
      {isOfficial && canManageEvac && (
        <div>
          <div className="section-label" style={{ marginTop: 0 }}>
            <h3>Update capacity</h3>
          </div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="field" style={{ marginBottom: 10 }}>
              <label>Current occupancy</label>
              <input
                key={evac.name}
                type="number"
                ref={capRef}
                min="0"
                max={evac.max}
                defaultValue={evac.cap}
              />
            </div>
            <button className="btn btn-accent btn-block" onClick={saveCapacity}>
              Save capacity
            </button>
          </div>
        </div>
      )}

      {/* Officials without evac permission */}
      {isOfficial && !canManageEvac && (
        <div>
          <p className="small muted" style={{ margin: '-4px 0 16px' }}>
            Your position doesn't include evacuation-center management. A Barangay
            Captain, Kagawad, or BDRRM Officer can update capacity here.
          </p>
        </div>
      )}

      {/* On-site amenities */}
      <div className="section-label" style={{ marginTop: 0 }}>
        <h3>On-site</h3>
        {isOfficial && canManageEvac && (
          <span className="muted small">Tap to update</span>
        )}
      </div>
      <div className="card" style={{ marginBottom: 16 }}>
        {evac.amenities.map((a, ai) => (
          <div
            key={ai}
            className="list-item"
            onClick={canManageEvac ? () => cycleAmenity(ai) : undefined}
            style={canManageEvac ? { cursor: 'pointer' } : undefined}
          >
            <span>{a.name}</span>
            <span className="val" style={{ color: AMENITY_COLORS[a.status] || '' }}>
              {a.status}
            </span>
          </div>
        ))}
      </div>

      <button
        className="btn btn-primary btn-block"
        onClick={() => showToast?.('Directions would open here')}
      >
        Get directions
      </button>
    </section>
  );
}
