// Open-Meteo returns WMO weather codes. This turns a code into the plain-language
// label people actually use ("Sunny", "Rainy", "Cloudy"...) plus an icon kind.

export function describeWeather(code, isDay = true) {
  switch (code) {
    case 0:  return isDay ? { label: 'Sunny', kind: 'sun' } : { label: 'Clear', kind: 'moon' };
    case 1:  return isDay ? { label: 'Mostly sunny', kind: 'partly-day' } : { label: 'Mostly clear', kind: 'partly-night' };
    case 2:  return isDay ? { label: 'Partly cloudy', kind: 'partly-day' } : { label: 'Partly cloudy', kind: 'partly-night' };
    case 3:  return { label: 'Cloudy', kind: 'cloud' };
    case 45:
    case 48: return { label: 'Foggy', kind: 'fog' };
    case 51:
    case 53:
    case 55:
    case 56:
    case 57: return { label: 'Drizzle', kind: 'drizzle' };
    case 61: return { label: 'Light rain', kind: 'rain' };
    case 63:
    case 66:
    case 67: return { label: 'Rainy', kind: 'rain' };
    case 65: return { label: 'Heavy rain', kind: 'heavy-rain' };
    case 80: return { label: 'Light showers', kind: 'drizzle' };
    case 81: return { label: 'Showers', kind: 'drizzle' };
    case 82: return { label: 'Heavy showers', kind: 'heavy-rain' };
    case 95: return { label: 'Thunderstorm', kind: 'storm' };
    case 96:
    case 99: return { label: 'Severe storm', kind: 'storm' };
    case 71: case 73: case 75: case 77: case 85: case 86:
             return { label: 'Snow', kind: 'cloud' }; // not expected in the Philippines
    default: return { label: 'Cloudy', kind: 'cloud' };
  }
}

// ---- icons ---------------------------------------------------------------------
// Drawn as SVG strings so the same icons work in React cards and inside Leaflet
// markers (which take HTML). 24px grid, 2px strokes, colors from the app's theme
// variables via inline style (var() in presentation attributes is not reliable).

const CLOUD = 'M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z';
const CLOUD_TOP = 'M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25'; // open bottom, for rain
const MOON = 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z';

const SUN = 'var(--accent)';
const CLOUD_C = 'var(--ink-soft)';
const RAIN_C = 'var(--cool)';

const st = (stroke, extra = '') => `style="stroke:${stroke};${extra}"`;

function iconBody(kind, fill) {
  const cloudFill = `fill:${fill}`;
  switch (kind) {
    case 'sun':
      return `<g ${st(SUN)}><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></g>`;
    case 'moon':
      return `<path d="${MOON}" ${st(CLOUD_C)}/>`;
    case 'partly-day':
      return `<g ${st(SUN)}><circle cx="8" cy="8" r="3"/><path d="M8 1.5v1.2M2.2 4.2l.9.9M1.5 8h1.2M13.8 4.2l-.9.9"/></g>` +
             `<g transform="translate(6.5 7) scale(.7)"><path d="${CLOUD}" ${st(CLOUD_C, cloudFill)}/></g>`;
    case 'partly-night':
      return `<g transform="scale(.55)"><path d="${MOON}" ${st(CLOUD_C)}/></g>` +
             `<g transform="translate(6.5 7) scale(.7)"><path d="${CLOUD}" ${st(CLOUD_C, cloudFill)}/></g>`;
    case 'fog':
      return `<path d="M3 8h18M5 12h14M3 16h18M7 20h10" ${st(CLOUD_C)}/>`;
    case 'drizzle':
      return `<path d="${CLOUD_TOP}" ${st(CLOUD_C)}/><path d="M8 19v2M8 13v2M16 19v2M16 13v2M12 21v2M12 15v2" ${st(RAIN_C)}/>`;
    case 'rain':
      return `<path d="${CLOUD_TOP}" ${st(CLOUD_C)}/><path d="M16 13v8M8 13v8M12 15v8" ${st(RAIN_C)}/>`;
    case 'heavy-rain':
      return `<path d="${CLOUD_TOP}" ${st(CLOUD_C)}/><path d="M16 13v8M8 13v8M12 15v8" ${st(RAIN_C, 'stroke-width:3')}/>`;
    case 'storm':
      return `<path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9" ${st(CLOUD_C)}/><path d="M13 11l-4 6h6l-4 6" ${st(SUN)}/>`;
    case 'cloud':
    default:
      return `<path d="${CLOUD}" ${st(CLOUD_C)}/>`;
  }
}

// `fill` is the color that hides the sun/moon behind the cloud: match the background.
export function weatherIconSvg(kind, size = 32, fill = 'var(--surface)') {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" ` +
    `fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">` +
    `${iconBody(kind, fill)}</svg>`
  );
}

export function WeatherIcon({ kind, size = 32 }) {
  return (
    <span
      style={{ display: 'inline-flex', lineHeight: 0 }}
      dangerouslySetInnerHTML={{ __html: weatherIconSvg(kind, size) }}
    />
  );
}
