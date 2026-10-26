import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PhoneIcon, ArrowLeftIcon } from '../components/icons';

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
            <ArrowLeftIcon />
          </button>
          <h2 style={{ fontSize: 17 }}>Barangay hotlines</h2>
        </div>
      </div>

      <input
        type="text"
        id="dir"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="search-input"
        placeholder=" contacts…"
        aria-label=" contacts"
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
              <PhoneIcon />
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
              <PhoneIcon />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
