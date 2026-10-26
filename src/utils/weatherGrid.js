// Weather "map" data: a small grid of Open-Meteo forecast points around the
// barangay center, turned into a smooth color overlay (like the rain/cloud/temperature
// maps on forecast sites). Open-Meteo gives point forecasts, not radar tiles, so the
// picture is interpolated model data.
//
// Cost note: one request with 25 coordinates counts as ~25 API calls, but it runs in
// the viewer's own browser (Open-Meteo's free limits are per IP) and is cached for
// 20 minutes per location.

const OPEN_METEO = 'https://api.open-meteo.com/v1/forecast';

export const GRID_N = 5;        // 5 x 5 points
export const GRID_SPAN = 0.4;   // degrees each side of the center (~44 km)
export const HOURS_AHEAD = 24;  // slider range
const CACHE_MS = 20 * 60 * 1000;

// Row 0 is the northern edge, column 0 the western edge.
export function gridPoints(center) {
  const [lat, lng] = center;
  const step = (2 * GRID_SPAN) / (GRID_N - 1);
  const pts = [];
  for (let i = 0; i < GRID_N; i++) {
    for (let j = 0; j < GRID_N; j++) {
      pts.push({
        i, j,
        lat: +(lat + GRID_SPAN - i * step).toFixed(4),
        lng: +(lng - GRID_SPAN + j * step).toFixed(4),
      });
    }
  }
  return pts;
}

export const gridBounds = (center) => [
  [center[0] - GRID_SPAN, center[1] - GRID_SPAN],
  [center[0] + GRID_SPAN, center[1] + GRID_SPAN],
];

export function parseGrid(pts, json) {
  const first = json[0];
  const times = first.hourly.time; // local ISO strings (timezone=auto)
  const nowKey = new Date(Date.now() + (first.utc_offset_seconds ?? 0) * 1000)
    .toISOString().slice(0, 13); // "2026-10-26T19"
  let start = times.findIndex((t) => t.slice(0, 13) >= nowKey);
  if (start < 0) start = 0;
  return {
    n: GRID_N,
    start,
    count: Math.max(1, Math.min(HOURS_AHEAD, times.length - start)),
    times,
    points: pts.map((p, idx) => ({ ...p, h: json[idx].hourly })),
  };
}

export async function fetchWeatherGrid(center, signal) {
  const pts = gridPoints(center);
  const key = `wxgrid:${center[0].toFixed(3)},${center[1].toFixed(3)}`;

  try {
    const cached = JSON.parse(sessionStorage.getItem(key) || 'null');
    if (cached && Date.now() - cached.ts < CACHE_MS) return parseGrid(pts, cached.json);
  } catch { /* storage unavailable: just fetch */ }

  const url =
    `${OPEN_METEO}?latitude=${pts.map((p) => p.lat).join(',')}` +
    `&longitude=${pts.map((p) => p.lng).join(',')}` +
    '&hourly=temperature_2m,precipitation,cloud_cover,wind_speed_10m,weather_code,is_day' +
    '&forecast_days=2&timezone=auto&wind_speed_unit=kmh';
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
  let json = await res.json();
  if (!Array.isArray(json)) json = [json];
  if (json.length !== pts.length) throw new Error('Unexpected grid response');

  try { sessionStorage.setItem(key, JSON.stringify({ ts: Date.now(), json })); } catch { /* ignore */ }
  return parseGrid(pts, json);
}

// ---- layers -----------------------------------------------------------------

const FIELD = { rain: 'precipitation', cloud: 'cloud_cover', temp: 'temperature_2m', wind: 'wind_speed_10m' };

// stops: [value, [r, g, b, alpha]]; values are interpolated linearly between stops.
export const RAMPS = {
  rain: {
    label: 'Rain', unit: 'mm/h', fadeBelow: true,
    stops: [
      [0.1, [126, 200, 240, 0.4]], [1, [58, 143, 224, 0.6]], [3, [47, 179, 107, 0.65]],
      [7.5, [242, 210, 27, 0.7]], [15, [240, 138, 27, 0.75]], [30, [210, 59, 43, 0.8]], [50, [150, 40, 160, 0.85]],
    ],
  },
  cloud: {
    label: 'Clouds', unit: '% cover',
    stops: [[0, [255, 255, 255, 0]], [50, [235, 240, 245, 0.45]], [100, [110, 125, 142, 0.72]]],
  },
  temp: {
    label: 'Temperature', unit: '°C',
    stops: [
      [22, [74, 111, 165, 0.5]], [26, [111, 170, 200, 0.45]], [29, [240, 200, 70, 0.5]],
      [32, [240, 138, 27, 0.55]], [36, [210, 59, 43, 0.62]],
    ],
  },
  wind: {
    label: 'Wind', unit: 'km/h',
    stops: [
      [0, [255, 255, 255, 0]], [15, [126, 200, 240, 0.35]], [30, [63, 125, 88, 0.55]],
      [50, [240, 138, 27, 0.65]], [75, [210, 59, 43, 0.75]],
    ],
  },
};

export const readValue = (point, layer, idx) => point.h[FIELD[layer]]?.[idx] ?? 0;

// n x n matrix of one layer at one hour (row 0 = north)
export function layerMatrix(grid, layer, idx) {
  const m = Array.from({ length: grid.n }, () => Array(grid.n).fill(0));
  grid.points.forEach((p) => { m[p.i][p.j] = readValue(p, layer, idx); });
  return m;
}

export function colorAt(ramp, v) {
  const s = ramp.stops;
  if (v <= s[0][0]) {
    const a = ramp.fadeBelow ? s[0][1][3] * Math.max(0, v / s[0][0]) : s[0][1][3];
    return [s[0][1][0], s[0][1][1], s[0][1][2], a];
  }
  if (v >= s[s.length - 1][0]) return s[s.length - 1][1];
  for (let k = 1; k < s.length; k++) {
    if (v <= s[k][0]) {
      const [v0, c0] = s[k - 1];
      const [v1, c1] = s[k];
      const t = (v - v0) / (v1 - v0);
      return c0.map((c, q) => c + (c1[q] - c) * t);
    }
  }
  return [0, 0, 0, 0];
}

// Smooth bilinear upsample of the n x n matrix into RGBA pixels (W x H).
export function fillImageData(data, W, H, m, ramp) {
  const n = m.length;
  const smooth = (t) => t * t * (3 - 2 * t); // removes visible creases at grid lines
  for (let py = 0; py < H; py++) {
    const gy = (py / (H - 1)) * (n - 1);
    const i0 = Math.min(Math.floor(gy), n - 2);
    const fy = smooth(gy - i0);
    for (let px = 0; px < W; px++) {
      const gx = (px / (W - 1)) * (n - 1);
      const j0 = Math.min(Math.floor(gx), n - 2);
      const fx = smooth(gx - j0);
      const top = m[i0][j0] * (1 - fx) + m[i0][j0 + 1] * fx;
      const bot = m[i0 + 1][j0] * (1 - fx) + m[i0 + 1][j0 + 1] * fx;
      const [r, g, b, a] = colorAt(ramp, top * (1 - fy) + bot * fy);
      const o = (py * W + px) * 4;
      data[o] = r; data[o + 1] = g; data[o + 2] = b; data[o + 3] = Math.round(a * 255);
    }
  }
}

// CSS gradient for the legend (evenly spaced stops, opaque so it stays readable)
export function legendGradient(ramp) {
  const s = ramp.stops;
  const parts = s.map(([, c], k) => `rgb(${c[0]},${c[1]},${c[2]}) ${(k / (s.length - 1)) * 100}%`);
  return `linear-gradient(90deg, ${parts.join(', ')})`;
}
