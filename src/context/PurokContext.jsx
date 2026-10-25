import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from 'react';
import { supabase } from '../config/apiConfig';
import { useAuth } from './AuthContext';

const PurokContext = createContext(null);

const byName = (a, b) => a.name.localeCompare(b.name, undefined, { numeric: true });

function friendlyError(error) {
  if (!error) return null;
  if (error.code === '23505') return 'That purok already exists in this barangay.';
  if (error.code === '42501' || /row-level security/i.test(error.message || '')) {
    return 'You are not allowed to do that.';
  }
  return error.message || 'Something went wrong. Please try again.';
}

function validateName(raw) {
  const name = (raw || '').trim();
  if (!name) return { error: 'Enter a purok name.' };
  if (name.length > 40) return { error: 'Purok name is too long (40 characters max).' };
  return { name };
}

// Loads barangays + purok stats for the admin screens. It only fetches when the
// signed-in user is an admin, so it is safe to mount for every role.
export function PurokProvider({ children }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [barangays, setBarangays] = useState([]);
  const [puroks, setPuroks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!isAdmin) {
      setBarangays([]);
      setPuroks([]);
      return;
    }
    setLoading(true);
    setError(null);

    const [b, p] = await Promise.all([
      supabase.from('barangays').select('id, name, city').order('name'),
      supabase.from('purok_stats').select('*'),
    ]);

    if (b.error || p.error) {
      setError(friendlyError(b.error || p.error));
      setLoading(false);
      return;
    }

    setBarangays(b.data);
    setPuroks(
      p.data
        .map((r) => ({
          id: r.id,
          barangayId: r.barangay_id,
          name: r.name,
          households: r.households,
          officials: r.officials,
          residents: r.residents,
        }))
        .sort(byName)
    );
    setLoading(false);
  }, [isAdmin]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // All mutations return { ok } or { error }, then reload so counts stay right.
  const addPurok = useCallback(async (barangayId, rawName) => {
    const { name, error: vErr } = validateName(rawName);
    if (vErr) return { error: vErr };
    if (!barangayId) return { error: 'Pick a barangay first.' };

    const { error: err } = await supabase
      .from('puroks')
      .insert({ barangay_id: barangayId, name });
    if (err) return { error: friendlyError(err) };
    await refresh();
    return { ok: true };
  }, [refresh]);

  const renamePurok = useCallback(async (id, rawName) => {
    const { name, error: vErr } = validateName(rawName);
    if (vErr) return { error: vErr };

    const { error: err } = await supabase.from('puroks').update({ name }).eq('id', id);
    if (err) return { error: friendlyError(err) };
    await refresh();
    return { ok: true };
  }, [refresh]);

  // households.purok_id and profiles.purok_id are ON DELETE SET NULL, so
  // residents/officials stay but lose their purok assignment.
  const deletePurok = useCallback(async (id) => {
    const { error: err } = await supabase.from('puroks').delete().eq('id', id);
    if (err) return { error: friendlyError(err) };
    await refresh();
    return { ok: true };
  }, [refresh]);

  const value = useMemo(() => ({
    barangays, puroks, loading, error,
    refresh, addPurok, renamePurok, deletePurok,
  }), [barangays, puroks, loading, error, refresh, addPurok, renamePurok, deletePurok]);

  return <PurokContext.Provider value={value}>{children}</PurokContext.Provider>;
}

export function usePuroks() {
  const ctx = useContext(PurokContext);
  if (!ctx) throw new Error('usePuroks must be used within PurokProvider');
  return ctx;
}