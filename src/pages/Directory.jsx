import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/apiConfig';

// National numbers, the same for every barangay.
// `phone` is what's shown, `dial` is what goes in the tel: link.
const HOTLINES = [
  { name: 'National Emergency Hotline', role: 'Police, fire, medical and rescue · free', phone: '911', dial: '911', isEmergency: true },
  { name: 'Philippine Red Cross', role: 'Medical and disaster response', phone: '143', dial: '143' },
  { name: 'Philippine National Police', role: 'Police hotline', phone: '117', dial: '117' },
  { name: 'Bureau of Fire Protection', role: 'Fire emergencies (Metro Manila)', phone: '(02) 8426-0219', dial: '0284260219' },
  { name: 'NDRRMC Operations Center', role: 'Disaster information and response', phone: '(02) 8911-1406', dial: '0289111406' },
  { name: 'MMDA', role: 'Metro Manila roads and traffic', phone: '136', dial: '136' },
];

const POSITION_ORDER = [
  'Barangay Captain', 'Kagawad', 'BDRRM Officer',
  'Rescue/Response Team', 'Barangay Tanod', 'SK Chairperson',
];
const rank = (pos) => {
  const i = POSITION_ORDER.indexOf(pos);
  return i === -1 ? POSITION_ORDER.length : i;
};

const initialsOf = (name) =>
  (name || '').trim().split(/\s+/).filter(Boolean)
    .map((w) => w[0]).join('').toUpperCase().slice(0, 2) || '?';

// 09171234567 -> 0917 123 4567
const formatMobile = (p) => (p || '').replace(/^(\d{4})(\d{3})(\d{4})$/, '$1 $2 $3');

function ContactRow({ initials, name, sub, number, dial, emergency, isSelf }) {
  return (
    <div className="dir-item">
      <span className={`dir-avatar ${emergency ? 'emergency' : ''}`}>{initials}</span>
      <div className="dir-info">
        <div className="dir-name">
          {name}
          {isSelf && <span className="dir-you">You</span>}
        </div>
        <div className="small muted">{sub}</div>
        {number && <div className="small muted">{number}</div>}
      </div>
      {dial && !isSelf && (
        <a className="dir-call" href={`tel:${dial}`} aria-label={`Call ${name}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
            <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 2 .7 3a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.2-1.3a2 2 0 0 1 2.1-.5c1 .4 2 .6 3 .7a2 2 0 0 1 1.7 2Z" />
          </svg>
        </a>
      )}
    </div>
  );
}

export default function Directory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const barangayId = user?.barangayId ?? null;

  const [search, setSearch] = useState('');
  const [officials, setOfficials] = useState([]);
  const [loading, setLoading] = useState(!!barangayId);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!barangayId) { setLoading(false); return; }
    let cancelled = false;
    supabase
      .from('barangay_officials')
      .select('id, full_name, official_position, phone, purok_name')
      .then(({ data, error: err }) => {
        if (cancelled) return;
        if (err) {
          console.error('barangay_officials:', err);
          setError('Could not load barangay officials.');
        } else {
          setOfficials(
            [...(data || [])].sort(
              (a, b) =>
                rank(a.official_position) - rank(b.official_position) ||
                (a.full_name || '').localeCompare(b.full_name || '')
            )
          );
        }
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [barangayId]);

  const q = search.trim().toLowerCase();
  const match = (...parts) => !q || parts.some((p) => (p || '').toLowerCase().includes(q));

  const filteredOfficials = useMemo(
    () => officials.filter((o) => match(o.full_name, o.official_position, o.purok_name)),
    [officials, q] // eslint-disable-line react-hooks/exhaustive-deps
  );
  const filteredHotlines = HOTLINES.filter((h) => match(h.name, h.role, h.phone));

  return (
    <div className="screen-enter" style={{ padding: '2px 20px 100px' }}>
      <div className="topbar">
        <div className="row" style={{ gap: 12 }}>
          <button className="btn-ghost btn btn-sm mobile-back" onClick={() => navigate('/profile')} aria-label="Go back" style={{ padding: '8px 10px' }}>←</button>
          <h2 style={{ fontSize: 17 }}>Barangay hotlines</h2>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search contacts…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: '100%', marginBottom: 14, padding: '11px 14px', borderRadius: 12,
          border: '1.5px solid var(--border)', background: 'var(--surface)',
          color: 'var(--ink)', fontFamily: 'var(--font-body)', fontSize: '13.5px',
        }}
      />

      {/* Emergency hotlines first: these matter most when something is wrong */}
      <div className="section-label" style={{ marginTop: 0 }}>
        <h3>Emergency hotlines</h3>
      </div>
      <div className="card" style={{ marginBottom: 16 }}>
        {filteredHotlines.length === 0 ? (
          <p className="small muted" style={{ textAlign: 'center', padding: '10px 0' }}>No hotlines match your search.</p>
        ) : (
          filteredHotlines.map((h) => (
            <ContactRow
              key={h.name}
              initials={initialsOf(h.name)}
              name={h.name}
              sub={h.role}
              number={h.phone}
              dial={h.dial}
              emergency={h.isEmergency}
            />
          ))
        )}
      </div>

      <div className="section-label" style={{ marginTop: 0 }}>
        <h3>Barangay officials</h3>
      </div>
      <div className="card">
        {!barangayId ? (
          <p className="small muted" style={{ textAlign: 'center', padding: '10px 0' }}>
            Your account isn't linked to a barangay, so there are no officials to show.
          </p>
        ) : loading ? (
          <p className="small muted" style={{ textAlign: 'center', padding: '10px 0' }}>Loading…</p>
        ) : error ? (
          <p className="small" style={{ textAlign: 'center', padding: '10px 0', color: 'var(--danger)' }}>{error}</p>
        ) : filteredOfficials.length === 0 ? (
          <p className="small muted" style={{ textAlign: 'center', padding: '10px 0' }}>
            {officials.length === 0 ? 'No approved officials in your barangay yet.' : 'No officials match your search.'}
          </p>
        ) : (
          filteredOfficials.map((o) => (
            <ContactRow
              key={o.id}
              initials={initialsOf(o.full_name)}
              name={o.full_name || 'Barangay official'}
              sub={[o.official_position, o.purok_name].filter(Boolean).join(' · ') || 'Barangay official'}
              number={o.phone ? formatMobile(o.phone) : null}
              dial={o.phone}
              isSelf={o.id === user?.id}
            />
          ))
        )}
      </div>

      <style>{`
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 18px 20px 14px;
        }
        .dir-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          border-top: 1px solid var(--border);
        }
        .dir-item:first-child { border-top: none; }
        .dir-avatar {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: var(--accent-soft);
          color: var(--ladder-ink);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 14px;
          flex-shrink: 0;
        }
        .dir-avatar.emergency {
          background: var(--danger-bg);
          color: var(--danger);
        }
        .dir-info { flex: 1; min-width: 0; }
        .dir-name { font-weight: 600; font-size: 13.5px; }
        .dir-you {
          margin-left: 8px;
          font-size: 10.5px;
          font-weight: 600;
          color: var(--ink-soft);
          border: 1px solid var(--border);
          border-radius: 999px;
          padding: 1px 7px;
        }
        .dir-call {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: var(--surface);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--ink-soft);
          flex-shrink: 0;
          text-decoration: none;
        }
        @media (min-width: 900px) {
          .mobile-back { display: none; }
        }
      `}</style>
    </div>
  );
}