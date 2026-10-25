import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// Vite needs the marker images imported explicitly, or the default pin breaks.
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const pinIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowSize: [41, 41],
});

/**
 * Click the map (or drag the pin) to choose a spot.
 *   value:    { lat, lng } | null
 *   onChange: ({ lat, lng }) => void
 *   center:   [lat, lng] used while nothing is pinned yet
 */
export default function LocationPicker({ value, onChange, center, height = 280 }) {
  const elRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const ensureMarker = (latlng) => {
    const map = mapRef.current;
    if (!map) return;
    if (!markerRef.current) {
      const m = L.marker(latlng, { draggable: true, icon: pinIcon }).addTo(map);
      m.on('dragend', () => {
        const p = m.getLatLng();
        onChangeRef.current({ lat: p.lat, lng: p.lng });
      });
      markerRef.current = m;
    } else {
      markerRef.current.setLatLng(latlng);
    }
  };

  // Create the map once
  useEffect(() => {
    const start = value ? [value.lat, value.lng] : center;
    const map = L.map(elRef.current).setView(start, value ? 18 : 16);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    map.on('click', (e) => {
      ensureMarker(e.latlng);
      onChangeRef.current({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    mapRef.current = map;
    if (value) ensureMarker(L.latLng(value.lat, value.lng));

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the pin in sync when the value changes from outside
  // (e.g. "Use my location", or editing an existing household).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !value) return;
    const ll = L.latLng(value.lat, value.lng);
    ensureMarker(ll);
    if (!map.getBounds().contains(ll)) map.setView(ll, 17);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.lat, value?.lng]);

  // Recenter once the barangay center loads, as long as nothing is pinned
  useEffect(() => {
    const map = mapRef.current;
    if (map && !value) map.setView(center, 16);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center[0], center[1]]);

  return (
    <div
      ref={elRef}
      style={{
        height,
        width: '100%',
        borderRadius: 14,
        border: '1.5px solid var(--border)',
        overflow: 'hidden',
        zIndex: 0,
      }}
    />
  );
}