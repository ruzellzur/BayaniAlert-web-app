import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from 'react';
import { supabase } from '../config/apiConfig';
import { useAuth } from './AuthContext';

export const AMENITY_STATUSES = ['Available', 'Limited', 'Unavailable'];
export const PRESET_AMENITIES = [
  'Drinking water station',
  'First aid / medical',
  'Generator power',
  'Toilets / washrooms',
  'Sleeping area',
  'Food distribution',
];

const EvacContext = createContext(null);

const byName = (a, b) => a.name.localeCompare(b.name, undefined, { numeric: true });

function toUi(r) {
  return {
    id: r.id,
    barangayId: r.barangay_id,
    name: r.name,
    address: r.address,
    lat: r.lat,
    lng: r.lng,
    capacity: r.capacity,
    occupancy: r.current_occupancy,
    status: r.status, // 'open' | 'full' | 'closed' (open/full is set by a DB trigger)
    amenities: Array.isArray(r.amenities) ? r.amenities : [],
    updatedAt: r.updated_at,
  };
}

function friendlyError(error) {
  if (!error) return null;
  const msg = error.message || '';
  if (msg.includes('occupancy_valid')) {
    return "Occupancy can't be negative or higher than capacity.";
  }
  if (error.code === '42501' || /row-level security/i.test(msg)) {
    return 'You are not allowed to manage evacuation centers here.';
  }
  return msg || 'Something went wrong. Please try again.';
}

// Validates + converts form input into DB columns. Returns { values } or { error }.
function validateCenter(input) {
  const name = (input.name || '').trim();
  if (!name) return { error: 'Enter a name for the center.' };
  if (name.length > 80) return { error: 'Name is too long (80 characters max).' };

  const capacity = Number.parseInt(input.capacity, 10);
  if (!Number.isFinite(capacity) || capacity < 1) return { error: 'Capacity must be at least 1.' };

  const lat = Number(input.lat);
  const lng = Number(input.lng);
  if (input.lat === '' || input.lng === '' || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { error: 'Enter valid coordinates.' };
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return { error: 'Coordinates are out of range.' };
  }

  const amenities = (input.amenities || [])
    .map((a) => ({
      name: String(a.name || '').trim(),
      status: AMENITY_STATUSES.includes(a.status) ? a.status : 'Available',
    }))
    .filter((a) => a.name);

  return {
    values: {
      name,
      address: (input.address || '').trim() || null,
      capacity,
      lat,
      lng,
      amenities,
    },
  };
}

// ------------------------------------------------------------------------

export function EvacProvider({ children }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const barangayId = user?.barangayId ?? null;
  // DB rule (can_do 'evac'): admins, plus Captain / Kagawad / BDRRM Officer of that barangay.
  const canManage = Boolean(isAdmin || (user?.role === 'official' && user?.permissions?.evac));

  const [centers, setCenters] = useState([]);
  // Admins get every barangay (to pick where to add a center); everyone else gets
  // just their own, which gives the location picker a sensible map center.
  const [barangays, setBarangays] = useState([]);
  const [floodZones, setFloodZones] = useState([]); // read-only for now (shown on the map)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!user?.id || (!isAdmin && !barangayId)) {
      setCenters([]);
      setBarangays([]);
      setFloodZones([]);
      return;
    }
    setLoading(true);
    setError(null);

    let query = supabase.from('evacuation_centers').select('*');
    if (!isAdmin) query = query.eq('barangay_id', barangayId);

    let barangayQuery = supabase
      .from('barangays')
      .select('id, name, city, center_lat, center_lng')
      .order('name');
    if (!isAdmin) barangayQuery = barangayQuery.eq('id', barangayId);

    let floodQuery = supabase
      .from('flood_zones')
      .select('id, barangay_id, name, risk_level, geojson');
    if (!isAdmin) floodQuery = floodQuery.eq('barangay_id', barangayId);

    const [c, b, f] = await Promise.all([query, barangayQuery, floodQuery]);

    if (c.error || b.error || f.error) {
      setError(friendlyError(c.error || b.error || f.error));
      setLoading(false);
      return;
    }
    setCenters(c.data.map(toUi).sort(byName));
    setBarangays(b.data || []);
    setFloodZones(
      (f.data || []).map((z) => ({
        id: z.id,
        barangayId: z.barangay_id,
        name: z.name,
        risk: z.risk_level, // 'low' | 'medium' | 'high'
        geojson: z.geojson,
      }))
    );
    setLoading(false);
  }, [user?.id, isAdmin, barangayId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const replace = (row) =>
    setCenters((prev) => prev.map((c) => (c.id === row.id ? toUi(row) : c)));

  // ---- create ------------------------------------------------------------
  // input: { name, address, capacity, lat, lng, amenities?, openNow? }
  // New centers start 'closed' unless openNow is set.
  const addCenter = useCallback(async (targetBarangayId, input) => {
    if (!canManage) return { error: 'You are not allowed to add evacuation centers.' };
    const bid = isAdmin ? targetBarangayId : barangayId;
    if (!bid) return { error: 'Pick a barangay first.' };

    const { values, error: vErr } = validateCenter(input);
    if (vErr) return { error: vErr };

    const { data, error: err } = await supabase
      .from('evacuation_centers')
      .insert({
        ...values,
        barangay_id: bid,
        current_occupancy: 0,
        status: input.openNow ? 'open' : 'closed',
      })
      .select()
      .single();

    if (err) return { error: friendlyError(err) };
    setCenters((prev) => [...prev, toUi(data)].sort(byName));
    return { center: toUi(data) };
  }, [canManage, isAdmin, barangayId]);

  // ---- update --------------------------------------------------------------
  const patchCenter = useCallback(async (id, dbPatch) => {
    const { data, error: err } = await supabase
      .from('evacuation_centers')
      .update(dbPatch)
      .eq('id', id)
      .select()
      .single();
    if (err) return { error: friendlyError(err) };
    replace(data);
    return { center: toUi(data) };
  }, []);

  // Edit name / address / capacity / coordinates / amenities together.
  const updateCenter = useCallback(async (id, input) => {
    const { values, error: vErr } = validateCenter(input);
    if (vErr) return { error: vErr };
    return patchCenter(id, values);
  }, [patchCenter]);

  // Head count. The DB trigger flips open <-> full automatically (closed stays closed).
  const setOccupancy = useCallback(async (id, value) => {
    const n = Number.parseInt(value, 10);
    if (!Number.isFinite(n) || n < 0) return { error: 'Enter a head count of 0 or more.' };
    const center = centers.find((c) => c.id === id);
    if (center && n > center.capacity) return { error: `Capacity is ${center.capacity}.` };
    return patchCenter(id, { current_occupancy: n });
  }, [centers, patchCenter]);

  // 'open' lets the trigger decide open vs full; 'closed' is manual.
  const openCenter = useCallback((id) => patchCenter(id, { status: 'open' }), [patchCenter]);
  const closeCenter = useCallback((id) => patchCenter(id, { status: 'closed' }), [patchCenter]);

  const setAmenityStatus = useCallback(async (id, index, status) => {
    const center = centers.find((c) => c.id === id);
    if (!center || !center.amenities[index]) return { error: 'Amenity not found.' };
    if (!AMENITY_STATUSES.includes(status)) return { error: 'Invalid status.' };
    const amenities = center.amenities.map((a, i) => (i === index ? { ...a, status } : a));
    return patchCenter(id, { amenities });
  }, [centers, patchCenter]);

  const deleteCenter = useCallback(async (id) => {
    const { error: err } = await supabase.from('evacuation_centers').delete().eq('id', id);
    if (err) return { error: friendlyError(err) };
    setCenters((prev) => prev.filter((c) => c.id !== id));
    return { ok: true };
  }, []);

  const value = useMemo(() => ({
    centers, barangays, floodZones, loading, error, canManage, isAdmin,
    refresh, addCenter, updateCenter, setOccupancy,
    openCenter, closeCenter, setAmenityStatus, deleteCenter,
  }), [
    centers, barangays, floodZones, loading, error, canManage, isAdmin,
    refresh, addCenter, updateCenter, setOccupancy,
    openCenter, closeCenter, setAmenityStatus, deleteCenter,
  ]);

  return <EvacContext.Provider value={value}>{children}</EvacContext.Provider>;
}

export function useEvac() {
  const ctx = useContext(EvacContext);
  if (!ctx) throw new Error('useEvac must be used within EvacProvider');
  return ctx;
}