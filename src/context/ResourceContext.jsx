import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from 'react';
import { supabase } from '../config/apiConfig';
import { useAuth } from './AuthContext';
import { approxCoord, distanceMeters } from '../utils/geo';

// Must match the CHECK constraints in the DB.
export const RESOURCE_CATEGORIES = [
  'power', 'water', 'food', 'medicine', 'shelter', 'transport', 'tools', 'other',
];
export const RESOURCE_STATUSES = ['available', 'reserved', 'completed', 'cancelled'];
export const LISTING_TYPES = ['offer', 'request'];
export const REQUEST_STATUSES = ['pending', 'accepted', 'declined', 'cancelled', 'completed'];

const ResourceContext = createContext(null);

// ---- helpers -----------------------------------------------------------

// listing row -> the shape Board / ResourceDetail already use.
// Distance is NOT computed here; see `resourcesWithDistance` in the provider.
function toUi(row, owners, me) {
  const isMine = row.owner_id === me?.id;
  const o = owners[row.owner_id];
  const ownerName = isMine ? 'You' : o?.name || 'A neighbor';
  const ownerPurok = isMine ? null : o?.purok ?? null;
  return {
    id: row.id, // uuid string
    name: row.title,
    desc: row.description,
    cat: row.category,
    owner: ownerPurok ? `${ownerName} · ${ownerPurok}` : ownerName,
    ownerName,
    ownerPurok,
    ownerId: row.owner_id,
    isMine,
    quantity: row.quantity,
    isLendable: row.is_lendable,
    type: row.listing_type,
    status: row.status,
    lat: row.lat,
    lng: row.lng,
    barangayId: row.barangay_id,
    createdAt: row.created_at,
  };
}

// request row (with embedded listing) -> UI shape.
// `item` / `owner` / `status` match what the old mock requests list used.
function requestToUi(row, people, me) {
  const listing = row.listing || {};
  const isMine = row.requester_id === me?.id;
  const ownerP = people[listing.owner_id];
  const requesterP = people[row.requester_id];
  return {
    id: row.id,
    listingId: row.listing_id,
    item: listing.title ?? 'Removed item',
    cat: listing.category ?? 'other',
    owner:
      listing.owner_id === me?.id
        ? 'You'
        : ownerP
          ? ownerP.purok ? `${ownerP.name} · ${ownerP.purok}` : ownerP.name
          : 'A neighbor',
    ownerId: listing.owner_id ?? null,
    requester: isMine
      ? 'You'
      : requesterP
        ? requesterP.purok ? `${requesterP.name} · ${requesterP.purok}` : requesterP.name
        : 'A neighbor',
    requesterId: row.requester_id,
    isMine,
    quantity: row.quantity,
    note: row.note,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function friendlyError(error) {
  if (!error) return null;
  if (error.code === '42501' || /row-level security/i.test(error.message || '')) {
    return 'You are not allowed to do that for this barangay.';
  }
  if (error.code === '23505') return 'You already have an active request for this item.';
  if (error.code === '23514') return 'One of the values is not allowed. Check the category and quantity.';
  const msg = error.message || 'Something went wrong. Please try again.';
  return msg.charAt(0).toUpperCase() + msg.slice(1); // RPC messages are lowercase
}

// ------------------------------------------------------------------------

export function ResourceProvider({ children }) {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [requests, setRequests] = useState([]); // everything this user may see
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const barangayId = user?.barangayId ?? null;

  // ---- where "near" is measured from ---------------------------------------
  // 1) live GPS, only after the user taps "Use my location"
  // 2) the household pin (no permission needed)
  // 3) nothing: cards then show no distance instead of a made-up one
  const hLat = user?.household?.lat;
  const hLng = user?.household?.lng;
  const home = useMemo(
    () => (typeof hLat === 'number' && typeof hLng === 'number' ? { lat: hLat, lng: hLng } : null),
    [hLat, hLng]
  );

  const [gps, setGps] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState('');

  // Don't carry one person's GPS fix over to the next login
  useEffect(() => {
    setGps(null);
    setLocateError('');
  }, [user?.id]);

  const origin = gps ?? home;
  const originSource = gps ? 'gps' : home ? 'home' : null;

  // Only ever call this from a button tap, so the permission prompt has context.
  const locate = useCallback(() => {
    setLocateError('');
    if (!navigator.geolocation) {
      setLocateError('Location is not available on this device.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setLocateError('Could not get your location, so distances stay based on your home.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  // Names + purok come from public_profiles (RLS on profiles hides other
  // residents; the view exposes them for your own barangay). Returns
  // { [userId]: { name, purok } }.
  const loadNames = useCallback(async (ids) => {
    const unique = [...new Set(ids.filter(Boolean))];
    if (unique.length === 0) return {};
    const { data } = await supabase
      .from('public_profiles')
      .select('id, full_name, purok_name')
      .in('id', unique);
    return Object.fromEntries(
      (data || []).map((p) => [p.id, { name: p.full_name, purok: p.purok_name }])
    );
  }, []);

  const refreshListings = useCallback(async () => {
    if (!user?.id || !barangayId) {
      setResources([]);
      return;
    }
    const { data: rows, error: err } = await supabase
      .from('resource_listings')
      .select('*')
      .eq('barangay_id', barangayId)
      .in('status', ['available', 'reserved'])
      .order('created_at', { ascending: false });

    if (err) {
      setError(friendlyError(err));
      return;
    }
    const names = await loadNames(rows.map((r) => r.owner_id));
    setResources(rows.map((r) => toUi(r, names, user)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, barangayId, loadNames]);

  const refreshRequests = useCallback(async () => {
    if (!user?.id || !barangayId) {
      setRequests([]);
      return;
    }
    // RLS already limits this to: my requests, requests on my listings, and
    // (for officials) everything in the barangay.
    const { data: rows, error: err } = await supabase
      .from('resource_requests')
      .select('*, listing:resource_listings(id, title, category, owner_id)')
      .eq('barangay_id', barangayId)
      .order('created_at', { ascending: false });

    if (err) {
      setError(friendlyError(err));
      return;
    }
    const names = await loadNames(
      rows.flatMap((r) => [r.requester_id, r.listing?.owner_id])
    );
    setRequests(rows.map((r) => requestToUi(r, names, user)));
  }, [user?.id, barangayId, loadNames, user]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    await Promise.all([refreshListings(), refreshRequests()]);
    setLoading(false);
  }, [refreshListings, refreshRequests]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Listings plus a numeric `distance` (meters, or null). Derived, so it updates
  // the moment the household loads or GPS is turned on. No refetch needed.
  const resourcesWithDistance = useMemo(
    () =>
      resources.map((r) => ({
        ...r,
        distance: r.isMine ? null : distanceMeters(origin, r),
      })),
    [resources, origin]
  );

  // ---- listings: create ---------------------------------------------------
  // input: { name, category, desc, quantity?, isLendable?, type?, pickupNote?, lat?, lng? }
  // Returns { resource } or { error }.
  const addResource = useCallback(async (input) => {
    if (!user?.id) return { error: 'You need to be signed in.' };
    if (!barangayId) return { error: 'Your account has no barangay, so you cannot list resources.' };

    const title = (input.name || '').trim();
    if (!title) return { error: 'Give your item a name first.' };

    const category = input.category || 'other';
    if (!RESOURCE_CATEGORIES.includes(category)) return { error: 'Pick a valid category.' };

    const quantity = Number.parseInt(input.quantity ?? 1, 10);
    if (!Number.isFinite(quantity) || quantity < 1) return { error: 'Quantity must be at least 1.' };

    const type = LISTING_TYPES.includes(input.type) ? input.type : 'offer';

    // Coordinates: use the pin if one was sent. Otherwise fall back to the owner's
    // home, rounded (~110 m) because listings are visible to the whole barangay.
    let lat;
    let lng;
    const sentLat = input.lat != null;
    const sentLng = input.lng != null;
    if (sentLat || sentLng) {
      if (!sentLat || !sentLng) return { error: 'The pickup spot is incomplete. Please pin it again.' };
      lat = Number(input.lat);
      lng = Number(input.lng);
      if (
        !Number.isFinite(lat) || !Number.isFinite(lng) ||
        Math.abs(lat) > 90 || Math.abs(lng) > 180
      ) {
        return { error: 'The pickup spot is not valid. Please pin it again.' };
      }
    } else {
      lat = home ? approxCoord(home.lat) : null;
      lng = home ? approxCoord(home.lng) : null;
    }

    // resource_listings has no pickup-location column, so fold it into the description.
    const description = [input.desc?.trim(), input.pickupNote?.trim() && `Pickup: ${input.pickupNote.trim()}`]
      .filter(Boolean)
      .join('\n') || null;

    const row = {
      owner_id: user.id,          // RLS: must equal auth.uid()
      barangay_id: barangayId,    // RLS: must equal my_barangay()
      listing_type: type,
      category,
      title,
      description,
      quantity,
      is_lendable: input.isLendable ?? true,
      lat,
      lng,
    };

    const { data, error: err } = await supabase
      .from('resource_listings')
      .insert(row)
      .select()
      .single();

    if (err) return { error: friendlyError(err) };

    const ui = toUi(data, {}, user);
    setResources((prev) => [ui, ...prev]);
    return { resource: ui };
  }, [user, barangayId, home]);

  // ---- listings: update / moderate -----------------------------------------
  // Owners can edit their own rows; officials of the barangay can edit any (RLS).
  const updateResource = useCallback(async (id, patch) => {
    const dbPatch = {};
    if (patch.name !== undefined) dbPatch.title = patch.name.trim();
    if (patch.desc !== undefined) dbPatch.description = patch.desc?.trim() || null;
    if (patch.category !== undefined) {
      if (!RESOURCE_CATEGORIES.includes(patch.category)) return { error: 'Pick a valid category.' };
      dbPatch.category = patch.category;
    }
    if (patch.quantity !== undefined) {
      if (!(patch.quantity >= 1)) return { error: 'Quantity must be at least 1.' };
      dbPatch.quantity = patch.quantity;
    }
    if (patch.isLendable !== undefined) dbPatch.is_lendable = patch.isLendable;
    if (patch.status !== undefined) {
      if (!RESOURCE_STATUSES.includes(patch.status)) return { error: 'Invalid status.' };
      dbPatch.status = patch.status;
    }
    if (Object.keys(dbPatch).length === 0) return { error: 'Nothing to update.' };

    const { data, error: err } = await supabase
      .from('resource_listings')
      .update(dbPatch)
      .eq('id', id)
      .select()
      .single();

    if (err) return { error: friendlyError(err) };

    setResources((prev) => {
      // completed/cancelled listings leave the board
      if (!['available', 'reserved'].includes(data.status)) return prev.filter((r) => r.id !== id);
      return prev.map((r) =>
        r.id === id
          ? {
              ...toUi(data, {}, user),
              // toUi gets no owner lookup here, so keep the names we already resolved
              owner: r.owner,
              ownerName: r.ownerName,
              ownerPurok: r.ownerPurok,
            }
          : r
      );
    });
    return { ok: true };
  }, [user]);

  const setStatus = useCallback((id, status) => updateResource(id, { status }), [updateResource]);

  const removeResource = useCallback(async (id) => {
    const { error: err } = await supabase.from('resource_listings').delete().eq('id', id);
    if (err) return { error: friendlyError(err) };
    setResources((prev) => prev.filter((r) => r.id !== id));
    setRequests((prev) => prev.filter((r) => r.listingId !== id)); // cascade-deleted in DB
    return { ok: true };
  }, []);

  const getResource = useCallback(
    (id) => resourcesWithDistance.find((r) => r.id === id) || null,
    [resourcesWithDistance]
  );

  // ---- requests --------------------------------------------------------------

  // Ask to borrow/claim a listing. Returns { request } or { error }.
  const requestItem = useCallback(async (listingId, { quantity = 1, note } = {}) => {
    if (!user?.id || !barangayId) return { error: 'You need to be signed in with a barangay.' };

    const listing = resources.find((r) => r.id === listingId);
    if (listing?.isMine) return { error: 'This is your own listing.' };
    if (listing && listing.status !== 'available') return { error: 'This item is no longer available.' };
    if (listing?.type === 'request') return { error: 'This is a request from a neighbor, not an item to borrow.' };

    const qty = Number.parseInt(quantity, 10);
    if (!Number.isFinite(qty) || qty < 1) return { error: 'Quantity must be at least 1.' };

    const { data, error: err } = await supabase
      .from('resource_requests')
      .insert({
        listing_id: listingId,
        requester_id: user.id,   // RLS: must equal auth.uid()
        barangay_id: barangayId, // RLS: must match the listing and my_barangay()
        quantity: qty,
        note: note?.trim() || null,
      })
      .select('*, listing:resource_listings(id, title, category, owner_id)')
      .single();

    if (err) return { error: friendlyError(err) };

    const names = await loadNames([data.listing?.owner_id]);
    const ui = requestToUi(data, names, user);
    setRequests((prev) => [ui, ...prev]);
    return { request: ui };
  }, [user, barangayId, resources, loadNames]);

  // Listing owner or barangay official: 'accept' | 'decline' | 'complete'.
  // Accept/complete also change the listing's status, so both lists reload.
  const respondToRequest = useCallback(async (requestId, decision) => {
    const { error: err } = await supabase.rpc('respond_to_request', {
      p_request: requestId,
      p_decision: decision,
    });
    if (err) return { error: friendlyError(err) };
    await Promise.all([refreshListings(), refreshRequests()]);
    return { ok: true };
  }, [refreshListings, refreshRequests]);

  // Requester withdraws their own pending/accepted request.
  const cancelRequest = useCallback(async (requestId) => {
    const { error: err } = await supabase.rpc('cancel_request', { p_request: requestId });
    if (err) return { error: friendlyError(err) };
    await Promise.all([refreshListings(), refreshRequests()]);
    return { ok: true };
  }, [refreshListings, refreshRequests]);

  const myRequests = useMemo(() => requests.filter((r) => r.isMine), [requests]);
  // Requests other people made on my listings (what an owner needs to act on).
  const incomingRequests = useMemo(
    () => requests.filter((r) => r.ownerId === user?.id && !r.isMine),
    [requests, user?.id]
  );

  const value = useMemo(() => ({
    resources: resourcesWithDistance,
    requests,
    myRequests,
    incomingRequests,
    loading,
    error,
    canList: Boolean(user?.id && barangayId),
    originSource,   // 'gps' | 'home' | null
    locate,
    locating,
    locateError,
    refresh,
    addResource,
    updateResource,
    setStatus,
    removeResource,
    getResource,
    requestItem,
    respondToRequest,
    cancelRequest,
  }), [
    resourcesWithDistance, requests, myRequests, incomingRequests, loading, error, user?.id, barangayId,
    originSource, locate, locating, locateError,
    refresh, addResource, updateResource, setStatus, removeResource, getResource,
    requestItem, respondToRequest, cancelRequest,
  ]);

  return <ResourceContext.Provider value={value}>{children}</ResourceContext.Provider>;
}

export function useResources() {
  const ctx = useContext(ResourceContext);
  if (!ctx) throw new Error('useResources must be used within ResourceProvider');
  return ctx;
}