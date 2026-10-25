import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../config/apiConfig';

const RANK = { info: 0, advisory: 1, warning: 2, critical: 3 };
export const SEVERITY_LABEL = {
  info: 'INFO',
  advisory: 'ADVISORY',
  warning: 'WARNING',
  critical: 'CRITICAL',
};

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

    setLoading(true);
    load();

    // No row filter on purpose: DELETE events only carry the primary key.
    const channel = supabase
      .channel(`weather-${barangayId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'weather_alerts' }, load)
      .subscribe();

    return () => {
      cancelled = true;
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