import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../config/apiConfig';

const authorLabel = (p) =>
  p ? [p.official_position, p.full_name].filter(Boolean).join(' ') || 'Barangay official'
    : 'Barangay official';

export function useAnnouncements(barangayId) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!barangayId) {
      setAnnouncements([]);
      setLoading(false);
      return;
    }

    const { data: rows, error: err } = await supabase
      .from('announcements')
      .select('id, title, body, pinned, created_by, created_at')
      .eq('barangay_id', barangayId)
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(100);

    if (err) {
      setError('Could not load announcements.');
      setLoading(false);
      return;
    }

    // Look up authors separately; public_profiles is a view, so embedding is unreliable.
    const ids = [...new Set(rows.map((r) => r.created_by).filter(Boolean))];
    let authors = {};
    if (ids.length) {
      const { data: people } = await supabase
        .from('public_profiles')
        .select('id, full_name, official_position')
        .in('id', ids);
      // If this fails (e.g. view not updated yet) we just fall back to a generic label.
      authors = Object.fromEntries((people || []).map((p) => [p.id, p]));
    }

    setAnnouncements(rows.map((r) => ({ ...r, who: authorLabel(authors[r.created_by]) })));
    setError(null);
    setLoading(false);
  }, [barangayId]);

  useEffect(() => {
    setLoading(true);
    load();

    if (!barangayId) return;
    // No row filter on purpose: DELETE events only carry the primary key,
    // so a barangay_id filter would silently drop them.
    const channel = supabase
      .channel(`announcements-${barangayId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [barangayId, load]);

  const post = async ({ title, body, pinned, userId }) => {
    const { error: err } = await supabase.from('announcements').insert({
      barangay_id: barangayId,
      title,
      body,
      pinned,
      created_by: userId,
    });
    if (err) return { error: err.message };
    await load();
    return {};
  };

  const remove = async (id) => {
    // .select() lets us detect a silent RLS block (0 rows deleted, no error)
    const { data, error: err } = await supabase
      .from('announcements').delete().eq('id', id).select('id');
    if (err || !data?.length) return { error: err?.message || 'You are not allowed to delete this.' };
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    return {};
  };

  const togglePin = async (id, pinned) => {
    const { data, error: err } = await supabase
      .from('announcements').update({ pinned }).eq('id', id).select('id');
    if (err || !data?.length) return { error: err?.message || 'You are not allowed to change this.' };
    await load();
    return {};
  };

  return { announcements, loading, error, post, remove, togglePin };
}

// Live-ish capacity for the widget: sums every center that isn't closed.
export function useEvacCapacity(barangayId) {
  const [totals, setTotals] = useState(null);

  useEffect(() => {
    if (!barangayId) return;
    let cancelled = false;
    supabase
      .from('evacuation_centers')
      .select('capacity, current_occupancy')
      .eq('barangay_id', barangayId)
      .neq('status', 'closed')
      .then(({ data, error }) => {
        if (cancelled || error) return;
        setTotals({
          centers: data.length,
          capacity: data.reduce((s, c) => s + c.capacity, 0),
          occupancy: data.reduce((s, c) => s + c.current_occupancy, 0),
        });
      });
    return () => { cancelled = true; };
  }, [barangayId]);

  return totals;
}