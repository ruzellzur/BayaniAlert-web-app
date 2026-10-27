import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  fetchWeatherGrid, gridBounds, layerMatrix, fillImageData,
  RAMPS, legendGradient, nowIndex
} from '../utils/weatherGrid';

const LAYERS = ['rain', 'cloud', 'temp', 'wind'];
const MAX_ZOOM = 12;   // was 12
const ZOOM = 9;       // was 9 (default view; must be <= MAX_ZOOM)
const IMG_W = 260;   // overlay resolution, matches the wide data area
const IMG_H = 100;

// "Now", "Today 3 PM", "Tomorrow 1 AM"  (times are local ISO strings)
function whenLabel(times, start, k) {
  if (k === 0) return 'Now';
  const t = times[start + k];
  const h = parseInt(t.slice(11, 13), 10);
  const day = t.slice(0, 10) === times[start].slice(0, 10) ? 'Today' : 'Tomorrow';
  return `${day} ${h % 12 || 12} ${h < 12 ? 'AM' : 'PM'}`;
}

/**
 * Weather over a real map, centered on `center` ([lat, lng], the barangay center).
 * Data: a 5x5 grid of Open-Meteo points interpolated into a color overlay,
 * with a 24-hour time slider.
 */
export default function WeatherMap({ center, barangayName }) {
  const elRef = useRef(null);
  const mapRef = useRef(null);
  const overlayRef = useRef(null);
  const homeRef = useRef(null);
  const canvasRef = useRef(null);
  const centerRef = useRef(center);
  centerRef.current = center;

  const [grid, setGrid] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [layer, setLayer] = useState('rain');
  const [k, setK] = useState(0); // hours from now

  const start = grid ? nowIndex(grid.times, grid.offset) : 0;
  const count = grid ? Math.max(1, Math.min(24, grid.times.length - start)) : 0;

  // ---- create the map once --------------------------------------------------
  useEffect(() => {
  const map = L.map(elRef.current, {
    maxZoom: MAX_ZOOM,               // was minZoom: 7, maxZoom: 12
    maxBoundsViscosity: 1,           // hard stop at the edge of the data
    scrollWheelZoom: false,
    dragging: !L.Browser.mobile,
  }).setView(center, ZOOM);
  applyLimits(map, center);

    // Same OpenStreetMap tiles as the Map page (no API key needed)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    mapRef.current = map;

    const ro = new ResizeObserver(() => {
      map.invalidateSize();
      applyLimits(map, centerRef.current);
    });
    ro.observe(elRef.current);

    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      overlayRef.current = null;
      homeRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- barangay marker + recenter -------------------------------------------
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    applyLimits(map, center);
    map.setView(center, ZOOM);    if (!homeRef.current) {
      const icon = L.divIcon({
        className: '',
        iconSize: [18, 18],
        iconAnchor: [9, 9],
        html: '<div class="wxm-home"></div>',
      });
      homeRef.current = L.marker(center, { icon, zIndexOffset: 1000, title: barangayName || 'Barangay center' }).addTo(map);
      const pop = document.createElement('strong');
      pop.textContent = barangayName || 'Barangay center';
      homeRef.current.bindPopup(pop);
    } else {
      homeRef.current.setLatLng(center);
    }
  }, [center, barangayName]);

  // ---- fetch the weather grid ---------------------------------------------------
  useEffect(() => {
    const ctrl = new AbortController();
    setStatus('loading');
    setK(0);
    fetchWeatherGrid(center, ctrl.signal)
      .then((g) => { setGrid(g); setStatus('ready'); })
      .catch((e) => { if (e.name !== 'AbortError') setStatus('error'); });
    return () => ctrl.abort();
  }, [center]);

  // ---- draw overlay + markers whenever data, layer or hour changes ---------------
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !grid) return;
    const idx = start + Math.min(k, count - 1);
    const bounds = gridBounds(center);

    // color overlay
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
      canvasRef.current.width = IMG_W;
      canvasRef.current.height = IMG_H;
    }
    const ctx = canvasRef.current.getContext('2d');
    const img = ctx.createImageData(IMG_W, IMG_H);
    fillImageData(img.data, IMG_W, IMG_H, layerMatrix(grid, layer, idx), RAMPS[layer]);
    ctx.putImageData(img, 0, 0);
    const url = canvasRef.current.toDataURL('image/png');
    if (!overlayRef.current) {
      overlayRef.current = L.imageOverlay(url, bounds, { interactive: false }).addTo(map);
    } else {
      overlayRef.current.setUrl(url);
      overlayRef.current.setBounds(bounds);
    }
  }, [grid, layer, k, center, start, count]);

  function applyLimits(map, center) {
    const bounds = L.latLngBounds(gridBounds(center));
    map.setMaxBounds(bounds);
    map.setMinZoom(0); // reset first so getBoundsZoom isn't clamped by an old value
    map.setMinZoom(Math.min(map.getBoundsZoom(bounds, true), MAX_ZOOM - 1));
  }

  const ramp = RAMPS[layer];
  const mid = ramp.stops[Math.floor(ramp.stops.length / 2)][0];

  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <div>
      <div className="chip-row" role="tablist" aria-label="Map layer">
        {LAYERS.map((id) => (
          <button
            key={id}
            role="tab"
            aria-selected={layer === id}
            className={`chip ${layer === id ? 'active' : ''}`}
            onClick={() => setLayer(id)}
          >
            {RAMPS[id].label}
          </button>
        ))}
      </div>

      <div className="wxmap">
        <div ref={elRef} className="wxmap-el" />

        {status === 'loading' && <div className="wxmap-note">Loading weather map…</div>}
        {status === 'error' && (
          <div className="wxmap-note">Weather map is unavailable right now. Check your connection and try again.</div>
        )}

        <div className="wxmap-legend">
          <div className="wxmap-legend-title">{ramp.label} <span>({ramp.unit})</span></div>
          <div className="wxmap-legend-bar" style={{ background: legendGradient(ramp) }} />
          <div className="wxmap-legend-ticks">
            <span>{ramp.stops[0][0]}</span>
            <span>{mid}</span>
            <span>{ramp.stops[ramp.stops.length - 1][0]}+</span>
          </div>
        </div>
      </div>

      {grid && (
        <div className="wxmap-time">
          <div className="wxmap-when">{whenLabel(grid.times, start, k)}</div>
          <input
            type="range"
            min={0}
            max={count - 1}
            step={1}
            value={k}
            onChange={(e) => setK(Number(e.target.value))}
            aria-label="Forecast hour"
          />
        </div>
      )}

      <style>{`
        .wxmap {
          position: relative;
          isolation: isolate; /* keep Leaflet's z-indexes below the tab bar and toasts */
          height: 340px;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid var(--border);
          background: var(--surface-alt);
        }
        .wxmap-el { position: absolute; inset: 0; }
        .wxmap-note {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          z-index: 500;
          max-width: 80%;
          padding: 9px 14px;
          border-radius: 12px;
          background: var(--surface);
          border: 1px solid var(--border);
          font-size: 12.5px;
          font-weight: 600;
          color: var(--ink-soft);
          text-align: center;
        }
        .wxmap-legend {
          position: absolute;
          left: 10px;
          bottom: 22px;
          z-index: 500;
          width: 150px;
          padding: 7px 9px 6px;
          border-radius: 10px;
          background: rgba(255,255,255,0.94);
          border: 1px solid var(--border);
          color: #1B2A4A;
          font-size: 11px;
          pointer-events: none;
        }
        .wxmap-legend-title { font-weight: 700; margin-bottom: 4px; }
        .wxmap-legend-title span { font-weight: 500; opacity: 0.7; }
        .wxmap-legend-bar { height: 8px; border-radius: 4px; }
        .wxmap-legend-ticks { display: flex; justify-content: space-between; margin-top: 3px; font-size: 10px; opacity: 0.8; }
        .wxmap-time { margin-top: 12px; }
        .wxmap-when { font-size: 13px; font-weight: 600; margin-bottom: 6px; }
        .wxmap-time input[type="range"] { width: 100%; accent-color: var(--accent); }

        /* Mute the street map a little so the weather colors stand out */
        .wxmap .leaflet-tile-pane { filter: saturate(0.5) brightness(1.04); }

        /* Barangay center marker */
        .wxm-home {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--accent);
          border: 3px solid #fff;
        }
        @media (min-width: 900px) { .wxmap { height: 440px; } }
      `}</style>
    </div>
  );
}
