import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '../components/icons';

/**
 * Weather & Alerts Page
 *
 * Markup matches the prototype's `#screen-weatherHistory`:
 *   .topbar > .row (mobile-back + h2)
 *   .section-label > h3 (Next 6 hours)
 *   .forecast-strip > .fcell > .t + .v
 *   .section-label > h3 (Advisory history)
 *   .card > .hist-item > .hist-dot + text
 *
 * All visual rules live in src/styles/prototype.css.
 */
const FORECAST = [
  { t: 'Now', v: '28°' },
  { t: '7PM', v: '27°' },
  { t: '8PM', v: '26°' },
  { t: '9PM', v: '26°' },
  { t: '10PM', v: '25°' },
  { t: '11PM', v: '25°' },
];

const HISTORY = [
  {
    tag: 'S2',
    bg: 'var(--accent)',
    color: 'var(--accent-ink)',
    title: 'Signal No. 2 raised',
    meta: 'Today · 6:40 PM — 65 km/h winds',
  },
  {
    tag: 'S1',
    bg: 'var(--surface-alt)',
    color: 'var(--ink-soft)',
    title: 'Signal No. 1 raised',
    meta: 'Today · 2:15 PM — 45 km/h winds',
  },
  {
    tag: 'ADV',
    bg: 'var(--surface-alt)',
    color: 'var(--ink-soft)',
    title: 'Heavy rainfall advisory',
    meta: 'Yesterday · 9:00 AM',
  },
];

export default function WeatherHistory() {
  const navigate = useNavigate();

  return (
    <section className="screen active" id="screen-weatherHistory">
      {/* Topbar */}
      <div className="topbar">
        <div className="row" style={{ gap: 12 }}>
          <button
            className="btn-ghost btn btn-sm mobile-back"
            onClick={() => navigate('/home')}
            aria-label="Go back"
            style={{ padding: '8px 10px' }}
          >
            <ArrowLeftIcon />
          </button>
          <h2 style={{ fontSize: 17 }}>Weather &amp; alerts</h2>
        </div>
      </div>

      {/* Forecast */}
      <div className="section-label" style={{ marginTop: 0 }}>
        <h3>Next 6 hours</h3>
      </div>
      <div className="forecast-strip" style={{ marginBottom: 18 }}>
        {FORECAST.map((f) => (
          <div className="fcell" key={f.t}>
            <div className="t">{f.t}</div>
            <div className="v">{f.v}</div>
          </div>
        ))}
      </div>

      {/* Advisory history */}
      <div className="section-label" style={{ marginTop: 0 }}>
        <h3>Advisory history</h3>
      </div>
      <div className="card">
        {HISTORY.map((h) => (
          <div className="hist-item" key={h.tag + h.title}>
            <span className="hist-dot" style={{ background: h.bg, color: h.color }}>
              {h.tag}
            </span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13.5 }}>{h.title}</div>
              <div className="muted small" style={{ marginTop: 2 }}>{h.meta}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
