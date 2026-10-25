import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../config/apiConfig';
import { distanceMeters } from '../utils/geo';

const toRad = (d) => (d * Math.PI) / 180;

// Haversine distance in meters
function distanceM(a, b) {
  const R = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export const formatDistance = (m) =>
  m < 1000 ? `${Math.max(10, Math.round(m / 10) * 10)} m` : `${(m / 1000).toFixed(1)} km`;

// Available offers in the user's barangay, nearest first when we know where they live.
export function useNearbyResources(user, limit = 3) {
  const barangayId = user?.barangayId ?? null;
  const userId = user?.id ?? null;
  const hLat = user?.household?.lat;
  const hLng = user?.household?.lng;

  const [rows, setRows] = useState([]);
  const [owners, setOwners] = useState({});
  const [loading, setLoading] = useState(!!barangayId);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!barangayId) {
      setRows([]);
      setLoading(false);
      return;
    }
    let cancelled = false;

    (async () => {
      const { data, error: err } = await supabase
        .from('resource_listings')
        .select('id, owner_id, category, title, quantity, lat, lng, created_at')
        .eq('barangay_id', barangayId)
        .eq('listing_type', 'offer')
        .eq('status', 'available')
        .order('created_at', { ascending: false })
        .limit(50);

      if (cancelled) return;
      if (err) {
        console.error('resource_listings:', err);
        setError('Could not load the resource board.');
        setLoading(false);
        return;
      }

      const listings = (data || []).filter((l) => l.owner_id !== userId); // you can't request your own
      const ids = [...new Set(listings.map((l) => l.owner_id))];
      let ownerMap = {};
      if (ids.length) {
        // Residents can't read other profiles; public_profiles exposes name + purok for the same barangay.
        const { data: people } = await supabase
          .from('public_profiles')
          .select('id, full_name, purok_name')
          .in('id', ids);
        ownerMap = Object.fromEntries((people || []).map((p) => [p.id, p]));
      }
      if (cancelled) return;

      setRows(listings);
      setOwners(ownerMap);
      setError(null);
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [barangayId, userId]);

  const hasOrigin = typeof hLat === 'number' && typeof hLng === 'number';

  const items = useMemo(() => {
    const mapped = rows.map((l) => {
      const o = owners[l.owner_id];
      const hasPin = typeof l.lat === 'number' && typeof l.lng === 'number';
      return {
        id: l.id,
        title: l.title,
        category: l.category,
        quantity: l.quantity,
        ownerName: o?.full_name || 'a neighbor',
        purokName: o?.purok_name || null,
        distance: hasOrigin && hasPin ? distanceMeters({ lat: hLat, lng: hLng }, l) : null,
      };
    });
    if (hasOrigin) {
      // Nearest first; listings without a pin go last (sort is stable, so they stay newest-first)
      mapped.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
    }
    return mapped.slice(0, limit);
  }, [rows, owners, hasOrigin, hLat, hLng, limit]);

  return { items, loading, error, hasOrigin };
}