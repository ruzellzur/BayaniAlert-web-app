import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function EvacDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { evacCenters, updateEvacCenter, user } = useApp();

  const evacId = parseInt(id, 10);
  const evac = evacCenters[id] || evacCenters[0];

  if (!evac) {
    return (
      <div className="screen-enter" style={{ padding: '2px 20px 100px' }}>
        <div className="topbar">
          <div className="row" style={{ gap: 12 }}>
            <button className="btn-ghost btn btn-sm mobile-back" onClick={() => navigate('/map')} aria-label="Go back" style={{ padding: '8px 10px' }}>←</button>
            <h2 style={{ fontSize: 17 }}>Evacuation center</h2>
          </div>
        </div>
        <div className="card" style={{ marginTop: 20, textAlign: 'center' }}>
          <p className="muted">Evacuation center not found</p>
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
    <div className="screen-enter" style={{ padding: '2px 20px 100px' }}>
      {/* Topbar */}
      <div className="topbar">
        <div className="row" style={{ gap: 12 }}>
          <button className="btn-ghost btn btn-sm mobile-back" onClick={() => navigate('/map')} aria-label="Go back" style={{ padding: '8px 10px' }}>←</button>
          <h2 style={{ fontSize: 17 }}>Evacuation center</h2>
        </div>
      </div>

      {/* Main Info Card */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ fontWeight: 600, fontSize: 16 }}>{evac.name}</div>
        <div className="muted small" style={{ marginTop: 3 }}>{evac.addr}</div>
        <div className="cap-bar" style={{ marginTop: 14 }}>
          <div className="cap-fill" style={{ width: `${(evac.cap / evac.max) * 100}%` }}></div>
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
      <div className="card" style={{ marginBottom: 16 }}>
        {evac.amenities.map((amenity, i) => (
          <div key={i} className="list-item" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 0',
            borderTop: i > 0 ? '1px solid var(--border)' : 'none'
          }}>
            <span>{amenity.name}</span>
            <span className="small" style={{
              fontWeight: 600,
              color: getAmenityStatusColor(amenity.status)
            }}>
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
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 18px 20px 14px;
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
