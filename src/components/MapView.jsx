import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { approxCoord } from '../utils/geo';

// Marker colors match the legend on the Map screen.
const COLORS = {
  evacOpen: '#C1443C',
  evacFull: '#7A1F1A',
  evacClosed: '#8A94A6',
  resource: '#E29A3B',
  you: '#1B2A4A',
};
const RISK_COLORS = { high: '#C1443C', medium: '#E29A3B', low: '#6FA8D8' };

function dotIcon(color, label, size) {
  return L.divIcon({
    className: '', // drop Leaflet's default white box
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid #fff;color:#fff;font:700 ${Math.round(size * 0.5)}px/${size - 4}px sans-serif;text-align:center;">${label}</div>`,
  });
}

// Popups are built with DOM nodes + textContent. Resource names and addresses
// are user-typed, so they must never be injected as HTML.
function popupContent({ title, lines = [], action }) {
  const root = document.createElement('div');
  root.style.minWidth = '140px';
  const h = document.createElement('strong');
  h.textContent = title;
  root.appendChild(h);
  lines.forEach((t) => {
    if (!t) return;
    const p = document.createElement('div');
    p.textContent = t;
    p.style.fontSize = '12px';
    p.style.marginTop = '2px';
    root.appendChild(p);
  });
  if (action) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = action.label;
    b.style.cssText =
      'margin-top:8px;padding:5px 10px;border:none;border-radius:8px;background:#1B2A4A;color:#fff;font-size:12px;font-weight:600;cursor:pointer;';
    b.addEventListener('click', action.onClick);
    root.appendChild(b);
  }
  return root;
}

const STATUS_TEXT = { open: 'Open', full: 'Full', closed: 'Closed' };

/**
 * Leaflet map showing evacuation centers, shared resources and flood zones.
 *   center:        [lat, lng] used until there is data to fit
 *   you:           { lat, lng } | null   "you are here" marker
 *   flyTo:         { lat, lng, key } | null   pan/zoom there when `key` changes
 *   evacCenters:   from useEvac()
 *   resources:     listings with lat/lng from useResources()
 *   floodZones:    from useEvac()  ({ name, risk, geojson })
 *   layers:        { evac, resources, flood } booleans
 */
export default function MapView({
  center, you, flyTo, evacCenters, resources, floodZones, layers,
  onSelectEvac, onSelectResource, height = '100%',
}) {
  const elRef = useRef(null);
  const mapRef = useRef(null);
  const groupsRef = useRef({});
  const youMarkerRef = useRef(null);
  const fittedRef = useRef(false);

  // Keep latest handlers without re-creating markers when they change.
  const onEvacRef = useRef(onSelectEvac);
  const onResRef = useRef(onSelectResource);
  onEvacRef.current = onSelectEvac;
  onResRef.current = onSelectResource;

  // Create the map once
  useEffect(() => {
    const map = L.map(elRef.current).setView(center, 15);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    groupsRef.current = {
      flood: L.layerGroup().addTo(map),
      evac: L.layerGroup().addTo(map),
      resources: L.layerGroup().addTo(map),
    };
    mapRef.current = map;

    // The map sits in a flexible box (modals, tabs, resizes): keep tiles in sync.
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(elRef.current);

    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      groupsRef.current = {};
      youMarkerRef.current = null;
      fittedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Layer toggles
  useEffect(() => {
    const map = mapRef.current;
    const g = groupsRef.current;
    if (!map) return;
    [['evac', layers.evac], ['resources', layers.resources], ['flood', layers.flood]].forEach(([key, on]) => {
      if (!g[key]) return;
      if (on && !map.hasLayer(g[key])) map.addLayer(g[key]);
      if (!on && map.hasLayer(g[key])) map.removeLayer(g[key]);
    });
  }, [layers.evac, layers.resources, layers.flood]);

  // Flood zones
  useEffect(() => {
    const g = groupsRef.current.flood;
    if (!g) return;
    g.clearLayers();
    floodZones.forEach((z) => {
      try {
        const color = RISK_COLORS[z.risk] || RISK_COLORS.low;
        const layer = L.geoJSON(z.geojson, {
          style: { color, weight: 2, fillColor: color, fillOpacity: 0.28 },
        });
        layer.bindPopup(
          popupContent({ title: z.name, lines: [`${z.risk[0].toUpperCase()}${z.risk.slice(1)} flood risk`] })
        );
        layer.addTo(g);
      } catch (e) {
        console.warn('Skipping flood zone with invalid geometry:', z.name, e);
      }
    });
  }, [floodZones]);

  // Evacuation centers
  useEffect(() => {
    const g = groupsRef.current.evac;
    if (!g) return;
    g.clearLayers();
    evacCenters.forEach((c) => {
      const color = c.status === 'open' ? COLORS.evacOpen : c.status === 'full' ? COLORS.evacFull : COLORS.evacClosed;
      const m = L.marker([c.lat, c.lng], { icon: dotIcon(color, 'E', 26), title: c.name });
      m.bindPopup(
        popupContent({
          title: c.name,
          lines: [c.address, `${STATUS_TEXT[c.status]} · ${c.occupancy} / ${c.capacity}`],
          action: { label: 'View details', onClick: () => onEvacRef.current?.(c.id) },
        })
      );
      m.addTo(g);
    });
  }, [evacCenters]);

  // Shared resources (other people's pins are rounded so they don't show an exact home)
  useEffect(() => {
    const g = groupsRef.current.resources;
    if (!g) return;
    g.clearLayers();
    resources.forEach((r) => {
      const lat = r.isMine ? r.lat : approxCoord(r.lat);
      const lng = r.isMine ? r.lng : approxCoord(r.lng);
      const m = L.marker([lat, lng], { icon: dotIcon(COLORS.resource, '', 18), title: r.name });
      m.bindPopup(
        popupContent({
          title: r.name,
          lines: [
            r.isMine ? 'Your listing' : `Shared by ${r.owner}`,
            r.isMine ? null : 'Approximate location',
          ],
          action: { label: 'View item', onClick: () => onResRef.current?.(r.id) },
        })
      );
      m.addTo(g);
    });
  }, [resources]);

  // "You are here"
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!you) {
      if (youMarkerRef.current) {
        youMarkerRef.current.remove();
        youMarkerRef.current = null;
      }
      return;
    }
    const ll = [you.lat, you.lng];
    if (!youMarkerRef.current) {
      youMarkerRef.current = L.marker(ll, { icon: dotIcon(COLORS.you, '', 16), zIndexOffset: 1000, title: 'You are here' }).addTo(map);
      youMarkerRef.current.bindPopup(popupContent({ title: 'You are here' }));
    } else {
      youMarkerRef.current.setLatLng(ll);
    }
  }, [you?.lat, you?.lng]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fit everything in view the first time there is data
  useEffect(() => {
    const map = mapRef.current;
    if (!map || fittedRef.current) return;
    const pts = [];
    if (you) pts.push([you.lat, you.lng]);
    evacCenters.forEach((c) => pts.push([c.lat, c.lng]));
    resources.forEach((r) => pts.push([r.lat, r.lng]));
    if (pts.length === 0) return;
    map.fitBounds(L.latLngBounds(pts).pad(0.25), { maxZoom: 17 });
    fittedRef.current = true;
  }, [you, evacCenters, resources]);

  // Re-center on the barangay while there is nothing to fit yet
  useEffect(() => {
    const map = mapRef.current;
    if (map && !fittedRef.current) map.setView(center, 15);
  }, [center[0], center[1]]); // eslint-disable-line react-hooks/exhaustive-deps

  // "Locate me" and similar
  useEffect(() => {
    const map = mapRef.current;
    if (map && flyTo) {
      fittedRef.current = true; // don't let a late data load yank the view away
      map.flyTo([flyTo.lat, flyTo.lng], 17);
    }
  }, [flyTo?.key]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={elRef} style={{ position: 'absolute', inset: 0, height, zIndex: 0 }} />;
}