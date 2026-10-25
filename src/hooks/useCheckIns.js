import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../config/apiConfig';

// A "safe" check-in counts for this long; after that the household shows as "no response".
// Unresolved help requests never expire.
export const CHECKIN_WINDOW_HOURS = 24;
const WINDOW_MS = CHECKIN_WINDOW_HOURS * 60 * 60 * 1000;

export function timeAgo(iso) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return new Date(iso).toLocaleDateString();
}

// DB row -> the 'safe' | 'help' | 'none' the UI uses
export function deriveStatus(c) {
  if (!c) return 'none';
  if (c.status === 'needs_help' && !c.resolved) return 'help';
  return Date.now() - new Date(c.created_at).getTime() < WINDOW_MS ? 'safe' : 'none';
}

// "Dela Cruz household" -> "DC"
const householdInitials = (name) => {
  const base = (name || '').replace(/\s*household\s*$/i, '').trim();
  return (
    base.split(/\s+/).filter(Boolean).map((w) => w[0]).join('').toUpperCase().slice(0, 2) || 'H'
  );
};

// ---- Resident: my own household's latest check-in -------------------------

export function useMyCheckin(user) {
  const household = user?.household ?? null;
  const [latest, setLatest] = useState(null);
  const [loading, setLoading] = useState(!!household);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!household || !user?.id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    supabase
      .from('checkins')
      .select('status, note, resolved, created_at')
      .eq('household_id', household.id)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        setLatest(data ?? null);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [household?.id, user?.id]);

  // status: 'safe' | 'help'
  const submit = async (status, note) => {
    if (!household) return { error: 'Set up your household first.' };
    setSending(true);
    const { data, error } = await supabase
      .from('checkins')
      .insert({
        household_id: household.id,
        user_id: user.id,
        barangay_id: household.barangay_id,
        status: status === 'help' ? 'needs_help' : 'safe',
        note: note?.trim() || null,
      })
      .select('status, note, resolved, created_at')
      .single();
    setSending(false);
    if (error) return { error: error.message };
    setLatest(data);
    return {};
  };

  return { latest, status: deriveStatus(latest), loading, sending, submit };
}

// ---- Official: every household in the barangay with its latest check-in ---

export function useCheckinBoard(user, enabled = true) {
  const barangayId = user?.barangayId ?? null;
  const purokId = user?.purokId ?? null; // an assigned zone narrows the board; null = all puroks
  const active = enabled && !!barangayId;

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(active);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    const [hh, lc] = await Promise.all([
      supabase
        .from('households')
        .select(
          'id, owner_id, household_no, household_name, address, members_count, has_vulnerable_members, notes, purok_id, emergency_contacts(name, phone, relationship)'
        )
        .eq('barangay_id', barangayId)
        .order('household_no'),
      supabase
        .from('latest_checkins')
        .select('household_id, user_id, status, note, resolved, created_at')
        .eq('barangay_id', barangayId),
    ]);

    if (hh.error || lc.error) {
      console.error('check-in board:', hh.error || lc.error);
      setError('Could not load check-ins.');
      setLoading(false);
      return;
    }

    const latestBy = Object.fromEntries((lc.data || []).map((c) => [c.household_id, c]));
    setRows(
      (hh.data || []).map((h) => {
        const c = latestBy[h.id] ?? null;
        return {
          id: h.id,
          no: h.household_no,
          name: h.household_name,
          initials: householdInitials(h.household_name),
          address: h.address,
          members: h.members_count,
          vulnerable: h.has_vulnerable_members,
          notes: h.notes,
          purokId: h.purok_id,
          contacts: h.emergency_contacts ?? [],
          status: deriveStatus(c),
          note: c?.note ?? null,
          checkedAt: c?.created_at ?? null,
          byResponder: !!c && c.user_id !== h.owner_id,
        };
      })
    );
    setError(null);
    setLoading(false);
  }, [barangayId]);

  useEffect(() => {
    if (!active) {
      setLoading(false);
      return;
    }
    setLoading(true);
    load();

    const channel = supabase
      .channel(`checkins-board-${barangayId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'checkins', filter: `barangay_id=eq.${barangayId}` },
        () => load()
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [active, barangayId, load]);

  const households = useMemo(
    () => (purokId ? rows.filter((h) => h.purokId === purokId) : rows),
    [rows, purokId]
  );

  const counts = useMemo(() => {
    const safe = households.filter((h) => h.status === 'safe').length;
    const help = households.filter((h) => h.status === 'help').length;
    return {
      safe,
      help,
      none: households.length - safe - help,
      responded: safe + help,
      total: households.length,
    };
  }, [households]);

  // Rescue-capable officials only (enforced by RLS too). status: 'safe' | 'help'
  const record = async (household, status) => {
    const { error: insErr } = await supabase.from('checkins').insert({
      household_id: household.id,
      user_id: user.id,
      barangay_id: barangayId,
      status: status === 'help' ? 'needs_help' : 'safe',
    });
    if (insErr) return { error: insErr.message };

    if (status === 'safe') {
      // Close any open help requests for this household
      const { error: resErr } = await supabase
        .from('checkins')
        .update({ resolved: true, resolved_by: user.id })
        .eq('household_id', household.id)
        .eq('status', 'needs_help')
        .eq('resolved', false);
      if (resErr) return { error: resErr.message };
    }

    await load();
    return {};
  };

  return { households, counts, loading, error, record };
}