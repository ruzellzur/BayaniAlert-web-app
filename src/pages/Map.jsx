import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MapView from '../components/MapView';
import { useEvac } from '../context/EvacContext';
import { useResources } from '../context/ResourceContext';
import { useAuth } from '../context/AuthContext';
import { distanceMeters, formatDistance, directionsUrl } from '../utils/geo';

const DEFAULT_CENTER = [14.6507, 120.9726];
const STATUS_LABEL = { open: 'Open', full: 'Full', closed: 'Closed' };

export default function Map() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { centers, floodZones, barangays, loading: evacLoading, error: evacError } = useEvac();
  const { resources } = useResources();

  const [layers, setLayers] = useState({ evac: true, resources: true, flood: true });
  const [myLocation, setMyLocation] = useState(null); // from "Locate me"
  const [flyTo, setFlyTo] = useState(null);
  const [locateError, setLocateError] = useState(null);

  const home = user?.household ? { lat: user.household.lat, lng: user.household.lng } : null;
  const you = myLocation || home;

  const center = home
    ? [home.lat, home.lng]
    : barangays[0]
      ? [barangays[0].center_lat, barangays[0].center_lng]
      : DEFAULT_CENTER;

  // Only offers with a saved position can be pinned
  const mappable = useMemo(
    () => resources.filter((r) => r.type === 'offer' && r.lat != null && r.lng != null),
    [resources]
  );

  // Closed centers last, then nearest first
  const sortedCenters = useMemo(() => {
    const rank = (c) => (c.status === 'closed' ? 1 : 0);
    return centers
      .map((c) => ({ ...c, meters: distanceMeters(you, c) }))
      .sort((a, b) =>
        rank(a) - rank(b) ||
        (a.meters ?? Infinity) - (b.meters ?? Infinity) ||
        a.name.localeCompare(b.name)
      );
  }, [centers, you?.lat, you?.lng]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = (key) => setLayers((l) => ({ ...l, [key]: !l[key] }));

  const locate = () => {
    setLocateError(null);
    if (!navigator.geolocation) {
      setLocateError('Location is not available on this device.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setMyLocation(loc);
        setFlyTo({ ...loc, key: Date.now() });
      },
      () => setLocateError('Could not get your location. Check your browser permissions.'),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className="screen-enter" style={{ padding: '2px 20px 100px' }}>
      {/* Topbar */}
      <div className="topbar">
        <div className="row" style={{ gap: 12 }}>
          <button className="btn-ghost btn btn-sm mobile-back" onClick={() => navigate('/home')} aria-label="Go back" style={{ padding: '8px 10px' }}>←</button>
          <h2 style={{ fontSize: 17 }}>Evacuation & flood map</h2>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={locate}>Locate me</button>
      </div>

      {evacError && <div className="map-error">{evacError}</div>}
      {locateError && <div className="map-error">{locateError}</div>}

      <div className="map-grid">
        <div>
          {/* Layer toggles */}
          <div className="chip-row" style={{ marginBottom: 10 }}>
            <span className={`chip ${layers.evac ? 'active' : ''}`} onClick={() => toggle('evac')}>Evacuation centers</span>
            <span className={`chip ${layers.resources ? 'active' : ''}`} onClick={() => toggle('resources')}>Resources</span>
            <span className={`chip ${layers.flood ? 'active' : ''}`} onClick={() => toggle('flood')}>Flood zones</span>
          </div>

          {/* Map */}
          <div className="map-wrap">
            <MapView
              center={center}
              you={you}
              flyTo={flyTo}
              evacCenters={centers}
              resources={mappable}
              floodZones={floodZones}
              layers={layers}
              onSelectEvac={(id) => navigate(`/evac/${id}`)}
              onSelectResource={(id) => navigate(`/resource/${id}`)}
            />
          </div>

          {/* Legend */}
          <div className="legend">
            <div className="item"><span className="sw round" style={{ background: '#C1443C' }}></span>Evacuation center</div>
            <div className="item"><span className="sw round" style={{ background: '#7A1F1A' }}></span>Full</div>
            <div className="item"><span className="sw round" style={{ background: '#8A94A6' }}></span>Closed</div>
            <div className="item"><span className="sw round" style={{ background: '#E29A3B' }}></span>Shared resource</div>
            <div className="item"><span className="sw round" style={{ background: '#1B2A4A' }}></span>You are here</div>
            <div className="item"><span className="sw" style={{ background: 'rgba(193,68,60,.45)' }}></span>High flood risk</div>
            <div className="item"><span className="sw" style={{ background: 'rgba(226,154,59,.45)' }}></span>Medium</div>
            <div className="item"><span className="sw" style={{ background: 'rgba(111,168,216,.45)' }}></span>Low</div>
          </div>
        </div>

        <div>
          {/* Evacuation centers, nearest first */}
          <div className="section-label" style={{ marginTop: 0 }}>
            <h3>{you ? 'Nearest evacuation centers' : 'Evacuation centers'}</h3>
          </div>

          {evacLoading && centers.length === 0 ? (
            <p className="small muted">Loading evacuation centers…</p>
          ) : sortedCenters.length === 0 ? (
            <div className="card">
              <p className="small muted" style={{ textAlign: 'center', padding: '12px 0' }}>
                No evacuation centers have been set up for your barangay yet.
              </p>
            </div>
          ) : (
            sortedCenters.map((center, i) => (
              <div
                key={center.id}
                className="card row between"
                onClick={() => navigate(`/evac/${center.id}`)}
                style={{ cursor: 'pointer', marginBottom: i < sortedCenters.length - 1 ? '10px' : 0, gap: 10 }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{center.name}</div>
                  <div className="muted small" style={{ marginTop: 3 }}>
                    {[formatDistance(center.meters), `${center.occupancy} / ${center.capacity} capacity`]
                      .filter(Boolean)
                      .join(' · ')}
                  </div>
                  <span className={`evac-status ${center.status}`}>{STATUS_LABEL[center.status]}</span>
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(directionsUrl(center.lat, center.lng), '_blank', 'noopener,noreferrer');
                  }}
                >
                  Directions
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 18px 20px 14px;
        }
        .map-error {
          margin-bottom: 12px;
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 13px;
          color: #C1443C;
          background: rgba(193, 68, 60, 0.1);
          border: 1px solid rgba(193, 68, 60, 0.3);
        }
        .map-grid {
          display: block;
        }
        .map-wrap {
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid var(--border);
          background: #DCE9E0;
          aspect-ratio: 1/1.05;
          z-index: 0;
        }
        .legend {
          display: flex;
          flex-wrap: wrap;
          gap: 12px 14px;
          margin-top: 14px;
        }
        .legend .item {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 12px;
          color: var(--ink-soft);
          font-weight: 600;
        }
        .legend .sw {
          width: 11px;
          height: 11px;
          border-radius: 4px;
        }
        .legend .sw.round {
          border-radius: 50%;
        }
        .evac-status {
          display: inline-block;
          margin-top: 6px;
          padding: 3px 9px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 600;
        }
        .evac-status.open { background: var(--safe); color: #fff; }
        .evac-status.full { background: var(--danger); color: #fff; }
        .evac-status.closed { background: var(--surface-alt); color: var(--ink-soft); }

        @media (min-width: 900px) {
          .topbar {
            padding: 26px 0 20px;
          }
          .map-grid {
            display: grid;
            grid-template-columns: 1.4fr 1fr;
            gap: 26px;
            align-items: start;
          }
        }
      `}</style>
    </div>
  );
}