import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

/**
 * Barangay Hotlines Page
 *
 * Markup matches the prototype's `#screen-directory`:
 *   .topbar > .row (mobile-back + h2 "Barangay hotlines")
 *   #dir input
 *   .section-label > h3 + .card > .dir-item(.avatar/.info/.dir-call)
 *   .section-label > h3 + .card > .dir-item
 *
 * All visual rules live in src/styles/prototype.css.
 */
const SEARCH_STYLE = {
  width: '100%',
  marginBottom: 14,
  padding: '11px 14px',
  borderRadius: 12,
  border: '1.5px solid var(--border)',
  background: 'var(--surface)',
  color: 'var(--ink)',
  fontFamily: 'var(--font-body)',
  fontSize: 13.5,
};

const PHONE_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 2 .7 3a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.2-1.3a2 2 0 0 1 2.1-.5c1 .4 2 .6 3 .7a2 2 0 0 1 1.7 2Z" />
  </svg>
);

const OFFICIALS = [
  { av: 'EL', nm: 'Brgy. Captain Elena Lira', role: 'Barangay Captain', tel: '0917 500 1001' },
  { av: 'MR', nm: 'Kagawad Mario Reyes', role: 'Disaster risk reduction', tel: '0917 500 1042' },
];

const EMERGENCY = [
  {
    av: 'FR',
    nm: 'Fire & Rescue',
    role: '24/7 hotline',
    tel: '911',
    avStyle: { background: 'var(--danger-bg)', color: 'var(--danger)' },
  },
  { av: 'PN', nm: 'Police Station', role: 'Purok 1 outpost', tel: '0917 500 9110' },
];

export default function Directory() {
  const navigate = useNavigate();
  const { showToast } = useApp();
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const match = (c) => !q || c.nm.toLowerCase().includes(q) || c.role.toLowerCase().includes(q);
  const officials = OFFICIALS.filter(match);
  const emergency = EMERGENCY.filter(match);

  const call = (tel) => showToast?.('Would dial ' + tel);

  return (
    <section className="screen active" id="screen-directory">
      {/* Topbar */}
      <div className="topbar">
        <div className="row" style={{ gap: 12 }}>
          <button
            className="btn-ghost btn btn-sm mobile-back"
            onClick={() => navigate('/profile')}
            aria-label="Go back"
            style={{ padding: '8px 10px' }}
          >
            ←
          </button>
          <h2 style={{ fontSize: 17 }}>Barangay hotlines</h2>
        </div>
      </div>

      <input
        type="text"
        id="dir"
        placeholder=" contacts…"
        style={SEARCH_STYLE}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="section-label" style={{ marginTop: 0 }}>
        <h3>Barangay officials</h3>
      </div>
      <div className="card" style={{ marginBottom: 16 }}>
        {officials.length === 0 && (
          <p className="small muted" style={{ padding: '12px 0', textAlign: 'center' }}>
            No contacts match your search.
          </p>
        )}
        {officials.map((c) => (
          <div className="dir-item" key={c.nm}>
            <span className="avatar" style={c.avStyle}>{c.av}</span>
            <div className="info">
              <div className="nm">{c.nm}</div>
              <div className="role">{c.role}</div>
            </div>
            <button className="dir-call" onClick={() => call(c.tel)} aria-label={'Call ' + c.tel}>
              {PHONE_ICON}
            </button>
          </div>
        ))}
      </div>

      <div className="section-label" style={{ marginTop: 0 }}>
        <h3>Emergency services</h3>
      </div>
      <div className="card">
        {emergency.length === 0 && (
          <p className="small muted" style={{ padding: '12px 0', textAlign: 'center' }}>
            No contacts match your search.
          </p>
        )}
        {emergency.map((c) => (
          <div className="dir-item" key={c.nm}>
            <span className="avatar" style={c.avStyle}>{c.av}</span>
            <div className="info">
              <div className="nm">{c.nm}</div>
              <div className="role">{c.role}</div>
            </div>
            <button className="dir-call" onClick={() => call(c.tel)} aria-label={'Call ' + c.tel}>
              {PHONE_ICON}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
