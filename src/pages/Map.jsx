import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../supabase';

const PH_BOUNDS = [[4.5, 116.0], [21.5, 127.0]];

function ClickToLookup({ onResult }) {
  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      const { data, error } = await supabase.rpc('get_barangay', { lat, lng });
      onResult(error ? null : data?.[0] ?? null, { lat, lng });
    },
  });
  return null;
}

export default function Map() {
  const navigate = useNavigate();
  const { evacCenters } = useApp();
  const [picked, setPicked] = useState(null);

  return (
    <div className="screen-enter" style={{ padding: '2px 20px 100px' }}>
      {/* Topbar */}
      <div className="topbar">
        <div className="row" style={{ gap: 12 }}>
          <button className="btn-ghost btn btn-sm mobile-back" onClick={() => navigate('/home')} aria-label="Go back" style={{ padding: '8px 10px' }}>←</button>
          <h2 style={{ fontSize: 17 }}>Evacuation & flood map</h2>
        </div>
      </div>

      <div className="map-grid">
        <div>
          {/* SVG Map */}
          <div className="map-wrap">
			  <MapContainer
				center={[14.65, 121.05]}
				zoom={14}
				minZoom={6}
				maxBounds={PH_BOUNDS}
				maxBoundsViscosity={1}
				style={{ height: '100%', width: '100%' }}
			  >
				<TileLayer
				  url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
				  attribution="© OpenStreetMap contributors"
				/>
				<ClickToLookup onResult={(b, pt) => setPicked({ b, pt })} />
				{evacCenters.filter(c => c.lat).map((c, i) => (
				  <CircleMarker
					key={i}
					center={[c.lat, c.lng]}
					radius={10}
					pathOptions={{ color: '#fff', weight: 2, fillColor: '#C1443C', fillOpacity: 1 }}
				  >
					<Popup>{c.name}</Popup>
				  </CircleMarker>
				))}
			  </MapContainer>
			</div>

			{picked && (
			  <div className="card" style={{ marginTop: 14 }}>
				{picked.b
				  ? <>📍 <b>{picked.b.name}</b>, {picked.b.municipality}, {picked.b.province}</>
				  : <>No barangay found at this spot</>}
			  </div>
			)}

          {/* Legend */}
          <div className="legend">
            <div className="item">
              <span className="sw" style={{ background: '#C1443C' }}></span>
              Evacuation center
            </div>
            <div className="item">
              <span className="sw" style={{ background: '#E29A3B' }}></span>
              Shared resource
            </div>
            <div className="item">
              <span className="sw" style={{ background: '#1B2A4A' }}></span>
              You are here
            </div>
            <div className="item">
              <span className="sw" style={{ background: '#A9CBDC' }}></span>
              Flood-prone area
            </div>
          </div>
        </div>

        <div>
          {/* Nearest Evacuation Center */}
          <div className="section-label" style={{ marginTop: 0 }}>
            <h3>Nearest evacuation center</h3>
          </div>
          {evacCenters.map((center, i) => (
            <div
              key={i}
              className="card row between"
              onClick={() => navigate(`/evac/${i}`)}
              style={{ cursor: 'pointer', marginBottom: i < evacCenters.length - 1 ? '10px' : 0 }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{center.name}</div>
                <div className="muted small" style={{ marginTop: 3 }}>
                  {center.distLabel} · {center.cap} / {center.max} capacity
                </div>
              </div>
              <button
                className="btn btn-primary btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  alert('Directions would open here');
                }}
              >
                Directions
              </button>
            </div>
          ))}
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
        }
        .map-wrap > svg {
          width: 100%;
          height: 100%;
          display: block;
        }
        .legend {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
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
