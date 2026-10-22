import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/app-context';

export default function EvacDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { evacCenters, updateEvacCenter, user } = useApp();


  const evac = evacCenters[id] || evacCenters[0];

  if (!evac) {
    return (
      <div className="screen-enter">
        <div className="topbar">
          <div className="row" style={{ gap: 12 }}>
            <button className="btn-ghost btn btn-sm mobile-back" onClick={() => navigate('/map')} aria-label="Go back" style={{ padding: '8px 10px' }}>←</button>
            <h2 style={{ fontSize: 17 }}>Evacuation center</h2>
          </div>
        </div>
        <div className="card" style={{ marginTop: 20 }}>
          <div className="empty-state">
            <span className="ic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 20 3 17V4l6 3 6-3 6 3v13l-6-3-6 3Z"/>
                <path d="M9 4v13M15 7v13"/>
              </svg>
            </span>
            <h4>Center not found</h4>
            <p>This evacuation center is no longer listed. Check the map for the nearest one.</p>
            <button className="btn btn-accent btn-sm" style={{ marginTop: 6 }} onClick={() => navigate('/map')}>Back to map</button>
          </div>
        </div>
      </div>
    );
  }

  const isOfficial = user?.role === 'official';
  const canManageEvac = user?.permissions?.evac;

  const getAmenityStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'var(--safe)';
      case 'Limited': return 'var(--accent)';
      case 'Unavailable': return 'var(--danger)';
      default: return 'var(--ink-soft)';
    }
  };

  return (
    <div className="screen-enter">
      {/* Topbar */}
      <div className="topbar">
        <div className="row" style={{ gap: 12 }}>
          <button className="btn-ghost btn btn-sm mobile-back" onClick={() => navigate('/map')} aria-label="Go back" style={{ padding: '8px 10px' }}>←</button>
          <h2 style={{ fontSize: 17 }}>Evacuation center</h2>
        </div>
      </div>

      {/* Main Info Card */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="evac-head">
          <div
            className="evac-ring"
            style={{ '--pct': Math.round((evac.cap / evac.max) * 100) }}
          >
            <div className="evac-ring-inner">
              <div className="n">{evac.cap}</div>
              <div className="l">of {evac.max}</div>
            </div>
          </div>
          <div className="evac-name">{evac.name}</div>
          <div className="evac-addr">{evac.addr}</div>
        </div>
        <div className="cap-bar" style={{ marginTop: 14 }}>
          <div
            className="cap-fill"
            style={{
              width: `${(evac.cap / evac.max) * 100}%`,
              background: evac.cap / evac.max > 0.9 ? 'var(--grad-danger)' : 'var(--grad-safe)'
            }}
          ></div>
        </div>
        <div className="row between" style={{ marginTop: 8 }}>
          <span className="small muted">Capacity</span>
          <span className="small muted">{evac.cap} / {evac.max}</span>
        </div>
      </div>

      {/* Update Capacity (Officials Only) */}
      {isOfficial && canManageEvac && (
        <>
          <div className="section-label" style={{ marginTop: 0 }}>
            <h3>Update capacity</h3>
          </div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="field" style={{ marginBottom: 10 }}>
              <label>Current occupancy</label>
              <input
                type="number"
                min="0"
                defaultValue={evac.cap}
                onChange={(e) => {
                  const newCap = parseInt(e.target.value, 10);
                  if (!isNaN(newCap)) {
                    updateEvacCenter(evacCenters.indexOf(evac), { cap: newCap });
                  }
                }}
              />
            </div>
            <button className="btn btn-accent btn-block" onClick={() => alert('Capacity updated!')}>
              Save capacity
            </button>
          </div>
        </>
      )}

      {isOfficial && !canManageEvac && (
        <p className="small muted" style={{ margin: '-4px 0 16px' }}>
          Your position doesn't include evacuation-center management. A Barangay Captain, Kagawad, or BDRRM Officer can update capacity here.
        </p>
      )}

      {/* On-site Amenities */}
      <div className="section-label" style={{ marginTop: 0 }}>
        <h3>On-site</h3>
      </div>
      <div className="card amenity-list" style={{ marginBottom: 16 }}>
        {evac.amenities.map((amenity, i) => (
          <div key={i} className="list-item">
            <span>{amenity.name}</span>
            <span
              className="amenity-status"
              style={{
                background: `${getAmenityStatusColor(amenity.status)}20`,
                color: getAmenityStatusColor(amenity.status)
              }}
            >
              {amenity.status}
            </span>
          </div>
        ))}
      </div>

      {/* Get Directions Button */}
      <button className="btn btn-primary btn-block" onClick={() => alert('Directions would open here')}>
        Get directions
      </button>

      <style>{`
        .evac-head {
          text-align: center;
          padding: 18px 0 22px;
        }
        .evac-name {
          font-family: var(--font-display);
          font-size: 23px;
          font-weight: 600;
          line-height: 1.2;
          margin-top: 14px;
        }
        .evac-addr {
          font-size: 13px;
          color: var(--ink-soft);
          font-weight: 600;
          margin-top: 5px;
        }
        .evac-ring {
          width: 108px;
          height: 108px;
          border-radius: 50%;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          background: conic-gradient(var(--safe) calc(var(--pct) * 1%), var(--surface-alt) 0);
          box-shadow: 0 10px 26px -12px rgba(21,35,61,0.5);
        }
        .evac-ring::after {
          content: "";
          position: absolute;
          inset: 11px;
          border-radius: 50%;
          background: var(--surface);
        }
        .evac-ring-inner {
          position: relative;
          z-index: 1;
          text-align: center;
        }
        .evac-ring-inner .n {
          font-family: var(--font-display);
          font-size: 24px;
          font-weight: 600;
          line-height: 1.1;
        }
        .evac-ring-inner .l {
          font-size: 10.5px;
          color: var(--ink-soft);
          font-weight: 700;
          letter-spacing: 0.02em;
        }
        .amenity-list { padding: 4px 16px; }
        .amenity-status {
          font-size: 11.5px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 999px;
        }

      `}</style>
    </div>
  );
}
