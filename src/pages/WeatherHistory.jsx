import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/apiConfig';
import { useAuth } from '../context/AuthContext';
import { formatClock, formatDay } from '../utils/time';
import { describeWeather, WeatherIcon } from '../utils/weatherCodes';
import WeatherMap from '../components/WeatherMap';

const OPEN_METEO = 'https://api.open-meteo.com/v1/forecast';

const SEVERITY = {
  info:     { badge: 'INFO',  color: 'var(--cool)',   ink: '#fff' },
  advisory: { badge: 'ADV',   color: 'var(--accent)', ink: 'var(--accent-ink)' },
  warning:  { badge: 'WARN',  color: 'var(--danger-2)', ink: '#fff' },
  critical: { badge: 'ALERT', color: 'var(--danger)', ink: '#fff' },
};

const SOURCE_LABEL = { 'open-meteo': 'Auto forecast · Open-Meteo', barangay: 'Barangay officials' };

const HOURS = 12;
const DAYS = 10;

// "2026-10-26T19:00" -> "7PM"   (Open-Meteo gives local times when timezone=auto)
const hourLabel = (iso) => {
  const h = parseInt(iso.slice(11, 13), 10);
  return `${h % 12 || 12}${h < 12 ? 'AM' : 'PM'}`;
};

// "2026-10-27" -> { day: 'Tue', date: 'Oct 27' }; plain calendar math, no timezone shifts
const dayLabels = (isoDate) => {
  const d = new Date(`${isoDate}T00:00:00Z`);
  return {
    day: d.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }),
    date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
  };
};

const pct = (v) => (v == null ? null : `${Math.round(v)}%`);

export default function WeatherHistory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const center = user?.barangayCenter; // [lat, lng] | null
  const barangayId = user?.barangayId;

  // null = loading, { hourly: [], daily: [] } (empty arrays = unavailable)
  const [forecast, setForecast] = useState(null);
  const [alerts, setAlerts] = useState(null);

  // ---- live forecast straight from Open-Meteo (free, no key) --------------
  // One request returns both the hourly strip and the 10-day outlook.
  useEffect(() => {
    if (!center) { setForecast({ hourly: [], daily: [] }); return undefined; }
    const ctrl = new AbortController();
    const url =
      `${OPEN_METEO}?latitude=${center[0]}&longitude=${center[1]}` +
      '&hourly=temperature_2m,precipitation_probability,weather_code,is_day' +
      '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max' +
      `&forecast_days=${DAYS}&timezone=auto`;
    fetch(url, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((j) => {
        const h = j.hourly;
        // Hourly data starts at midnight today; begin at the current local hour.
        const nowKey = new Date(Date.now() + (j.utc_offset_seconds ?? 0) * 1000)
          .toISOString().slice(0, 13); // "2026-10-26T19"
        let start = h.time.findIndex((t) => t.slice(0, 13) >= nowKey);
        if (start < 0) start = 0;

        const hourly = h.time.slice(start, start + HOURS).map((t, k) => {
          const i = start + k;
          return {
            time: k === 0 ? 'Now' : hourLabel(t),
            temp: `${Math.round(h.temperature_2m[i])}°`,
            pop: h.precipitation_probability?.[i] ?? null,
            ...describeWeather(h.weather_code[i], h.is_day[i] === 1),
          };
        });

        const d = j.daily;
        const daily = d.time.slice(0, DAYS).map((t, i) => ({
          ...dayLabels(t),
          day: i === 0 ? 'Today' : dayLabels(t).day,
          hi: `${Math.round(d.temperature_2m_max[i])}°`,
          lo: `${Math.round(d.temperature_2m_min[i])}°`,
          pop: d.precipitation_probability_max?.[i] ?? null,
          ...describeWeather(d.weather_code[i], true),
        }));

        setForecast({ hourly, daily });
      })
      .catch((e) => { if (e.name !== 'AbortError') setForecast({ hourly: [], daily: [] }); });
    return () => ctrl.abort();
  }, [center]);

  // ---- alert history from our own database --------------------------------
  const loadAlerts = useCallback(async () => {
    if (!barangayId) { setAlerts([]); return; }
    const { data, error } = await supabase
      .from('weather_alerts')
      .select('id, severity, title, body, source, issued_at, expires_at')
      .eq('barangay_id', barangayId)
      .order('issued_at', { ascending: false })
      .limit(30);
    setAlerts(error ? [] : data ?? []);
  }, [barangayId]);

  // Show what we have now, then ask the server to check the forecast and
  // insert anything new (the function throttles itself), then show the result.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      await loadAlerts();
      if (!barangayId) return;
      const { data } = await supabase.functions.invoke('weather-sync');
      if (!cancelled && data?.inserted > 0) loadAlerts();
    })();
    return () => { cancelled = true; };
  }, [barangayId, loadAlerts]);

  const now = Date.now();
  const isActive = (a) => !a.expires_at || new Date(a.expires_at).getTime() > now;

  return (
    <div className="screen-enter" style={{ padding: '2px 20px 100px' }}>
      {/* Topbar */}
      <div className="topbar">
        <div className="row" style={{ gap: 12 }}>
          <button className="btn-ghost btn btn-sm mobile-back" onClick={() => navigate('/home')} aria-label="Go back" style={{ padding: '8px 10px' }}>←</button>
          <h2 style={{ fontSize: 17 }}>Weather & alerts</h2>
        </div>
      </div>

      {/* Next 12 hours (scrolls sideways) */}
      <div className="section-label" style={{ marginTop: 0 }}>
        <h3>Next 12 hours</h3>
        {user?.barangayName && <span>{user.barangayName}</span>}
      </div>

      {forecast === null && <p className="muted small" style={{ marginBottom: 18 }}>Loading forecast…</p>}
      {forecast && forecast.hourly.length === 0 && (
        <div className="card" style={{ marginBottom: 18 }}>
          <p className="small muted">
            {center ? 'Forecast is unavailable right now. Check your connection and try again.' : 'No barangay location is set for this account.'}
          </p>
        </div>
      )}
      {forecast && forecast.hourly.length > 0 && (
        <div className="wx-strip" role="list" aria-label="Hourly forecast">
          {forecast.hourly.map((f, i) => (
            <div key={i} className="wx-card wx-hour" role="listitem">
              <div className="wx-when">{f.time}</div>
              <WeatherIcon kind={f.kind} size={32} />
              <div className="wx-temp">{f.temp}</div>
              <div className="wx-pop">{pct(f.pop) ? `${pct(f.pop)} rain` : ' '}</div>
              <div className="wx-label">{f.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Advisory History */}
      <div className="section-label" style={{ marginTop: 0 }}>
        <h3>Advisory history</h3>
      </div>

      {alerts === null && <p className="muted small">Loading alerts…</p>}
      {alerts && alerts.length === 0 && (
        <div className="card">
          <p className="small muted">No alerts yet. We check the forecast regularly and post one here when conditions turn dangerous.</p>
        </div>
      )}
      {alerts && alerts.length > 0 && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {alerts.map((a, i) => {
            const sev = SEVERITY[a.severity] ?? SEVERITY.info;
            const active = isActive(a);
            return (
              <div key={a.id} className="hist-item" style={{
                display: 'flex',
                gap: 12,
                padding: '12px 0',
                borderTop: i > 0 ? '1px solid var(--border)' : 'none'
              }}>
                <span className="hist-dot" style={{
                  width: 38,
                  height: 32,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10.5,
                  fontWeight: 700,
                  flexShrink: 0,
                  background: active ? sev.color : 'var(--surface-alt)',
                  color: active ? sev.ink : 'var(--ink-soft)'
                }}>
                  {sev.badge}
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '13.5px' }}>
                    {a.title}
                    {active && <span className="tag tag-accepted" style={{ marginLeft: 8 }}>Active</span>}
                  </div>
                  <div className="muted small" style={{ marginTop: 2 }}>
                    {formatDay(a.issued_at)} · {formatClock(a.issued_at)} · {SOURCE_LABEL[a.source] ?? a.source}
                  </div>
                  {a.body && <div className="small" style={{ marginTop: 6, lineHeight: 1.5, color: 'var(--ink)' }}>{a.body}</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="muted" style={{ fontSize: 11, marginTop: 16, lineHeight: 1.5 }}>
        Forecast data by <a href="https://open-meteo.com/" target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>Open-Meteo.com</a>.
        Automated alerts are not official PAGASA warnings. Always follow your barangay officials' instructions.
      </p>

      {/* Weather map, centered on the barangay */}
      {center && (
        <>
          <div className="section-label" style={{ marginTop: 22 }}>
            <h3>Weather map</h3>
            {user?.barangayName && <span>{user.barangayName}</span>}
          </div>
          <WeatherMap center={center} barangayName={user?.barangayName} />
        </>
      )}

      {/* 10-day forecast */}
      <div className="section-label" style={{ marginTop: 22 }}>
        <h3>10-day forecast</h3>
      </div>

      {forecast === null && <p className="muted small">Loading forecast…</p>}
      {forecast && forecast.daily.length === 0 && (
        <div className="card">
          <p className="small muted">
            {center ? 'Forecast is unavailable right now. Check your connection and try again.' : 'No barangay location is set for this account.'}
          </p>
        </div>
      )}
      {forecast && forecast.daily.length > 0 && (
        <div className="wx-days">
          {forecast.daily.map((d, i) => (
            <div key={i} className="wx-card wx-day">
              <div className="wx-when">{d.day}</div>
              <div className="wx-date">{d.date}</div>
              <WeatherIcon kind={d.kind} size={34} />
              <div className="wx-temp">{d.hi}<span className="wx-lo"> / {d.lo}</span></div>
              <div className="wx-pop">{pct(d.pop) ? `${pct(d.pop)} rain` : ' '}</div>
              <div className="wx-label">{d.label}</div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 18px 0 14px;
        }
        .topbar .mobile-back {
          margin-left: -12px;
        }

        /* Shared weather card */
        .wx-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 11px 6px 10px;
          text-align: center;
        }
        .wx-when { font-size: 12px; font-weight: 600; color: var(--ink); }
        .wx-date { font-size: 10.5px; color: var(--ink-soft); margin-top: -3px; }
        .wx-temp { font-family: var(--font-display); font-weight: 600; font-size: 16px; }
        .wx-lo { font-family: var(--font-body); font-weight: 500; font-size: 12px; color: var(--ink-soft); }
        .wx-pop { font-size: 10.5px; color: var(--cool); font-weight: 600; }
        .wx-label {
          margin-top: auto;
          padding-top: 6px;
          width: 100%;
          border-top: 1px solid var(--border);
          font-size: 11px;
          font-weight: 600;
          color: var(--ink-soft);
          line-height: 1.25;
        }

        /* Hourly: horizontal scroll */
        .wx-strip {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding: 2px 2px 8px;
          margin: 0 -2px 18px;
          scroll-snap-type: x proximity;
          -webkit-overflow-scrolling: touch;
        }
        .wx-hour {
          flex: 0 0 84px;
          scroll-snap-align: start;
        }

        /* 10-day: responsive grid */
        .wx-days {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(104px, 1fr));
          gap: 8px;
        }

        @media (min-width: 900px) {
          .mobile-back {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
