import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../config/apiConfig';

const RANK = { info: 0, advisory: 1, warning: 2, critical: 3 };
export const SEVERITY_LABEL = {
  info: 'INFO',
  advisory: 'ADVISORY',
  warning: 'WARNING',
  critical: 'CRITICAL',
};

// How often an open dashboard asks the server to re-check the forecast.
// The weather-sync function throttles itself (once / 20 min per barangay),
// so extra calls are cheap no-ops.
const SYNC_EVERY_MS = 30 * 60 * 1000;

// Read-only for now. TODO: officials posting alerts (the table is already writable via can_do 'announce').
export function useWeatherAlerts(barangayId) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(!!barangayId);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(() => Date.now());

  // Re-check expiry once a minute so an expired alert disappears without a reload
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!barangayId) {
      setRows([]);
      setLoading(false);
      return;
    }
    let cancelled = false;

    const load = async () => {
      // Reads are open to everyone (RLS `using (true)`), so filter by barangay here.
      const { data, error: err } = await supabase
        .from('weather_alerts')
        .select('id, severity, title, body, source, issued_at, expires_at')
        .eq('barangay_id', barangayId)
        .order('issued_at', { ascending: false })
        .limit(50);
      if (cancelled) return;
      if (err) {
        console.error('weather_alerts:', err);
        setError('Could not load weather alerts.');
      } else {
        setRows(data || []);
        setError(null);
      }
      setLoading(false);
    };

    // Ask the edge function to check the forecast and insert any new alerts.
    // Failure is non-fatal: we still show whatever is already in the table.
    const sync = async () => {
      const { data, error: err } = await supabase.functions.invoke('weather-sync');
      if (cancelled) return;
      if (err) {
        console.warn('weather-sync:', err.message ?? err);
        return;
      }
      if (data?.inserted > 0) load(); // realtime will usually do this too
    };

    setLoading(true);
    load().then(sync); // show existing alerts first, then check for new ones
    const syncTimer = setInterval(sync, SYNC_EVERY_MS);

    // No row filter on purpose: DELETE events only carry the primary key.
    const channel = supabase
      .channel(`weather-${barangayId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'weather_alerts' }, load)
      .subscribe();

    return () => {
      cancelled = true;
      clearInterval(syncTimer);
      supabase.removeChannel(channel);
    };
  }, [barangayId]);

  // Active = not expired. Most severe first, then newest.
  const alerts = useMemo(
    () =>
      rows
        .filter((a) => !a.expires_at || new Date(a.expires_at).getTime() > now)
        .sort(
          (a, b) =>
            (RANK[b.severity] ?? 0) - (RANK[a.severity] ?? 0) ||
            new Date(b.issued_at) - new Date(a.issued_at)
        ),
    [rows, now]
  );

  return { alerts, top: alerts[0] ?? null, loading, error };
}
