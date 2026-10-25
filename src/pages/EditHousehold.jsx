import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/apiConfig'; // adjust path if needed
import { useAuth, normalizePhone, isValidPhone } from '../context/AuthContext';
import LocationPicker from '../components/LocationPicker';

const MAX_CONTACTS = 3;
const EMPTY_CONTACT = { name: '', phone: '', relationship: '' };

export default function HouseholdSetup() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const existing = user?.household || null;
  const editing = !!existing;

  // Default household name, e.g. "Dela Cruz household"
  const lastWord = (user?.name || '').trim().split(/\s+/).pop();
  const [name, setName] = useState(existing?.household_name ?? (lastWord ? `${lastWord} household` : ''));
  const [address, setAddress] = useState(existing?.address ?? '');
  const [members, setMembers] = useState(String(existing?.members_count ?? ''));
  const [vulnerable, setVulnerable] = useState(existing?.has_vulnerable_members ?? false);
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [location, setLocation] = useState(
    existing ? { lat: existing.lat, lng: existing.lng } : null
  );
  const [contacts, setContacts] = useState(
    existing?.emergency_contacts?.length
      ? existing.emergency_contacts.map((c) => ({
          name: c.name, phone: c.phone, relationship: c.relationship || '',
        }))
      : [{ ...EMPTY_CONTACT }]
  );

  const [center, setCenter] = useState([14.6507, 120.9726]); // fallback until barangay loads
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [geoMsg, setGeoMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Center the map on the user's barangay
  useEffect(() => {
    if (!user?.barangayId) return;
    supabase
      .from('barangays')
      .select('center_lat, center_lng')
      .eq('id', user.barangayId)
      .single()
      .then(({ data, error }) => {
        if (error) console.error('barangay center:', error);
        if (data) setCenter([data.center_lat, data.center_lng]);
      });
  }, [user?.barangayId]);

  const useMyLocation = () => {
    setGeoMsg('');
    if (!navigator.geolocation) {
      setGeoMsg('Location is not available on this device. Tap the map instead.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setGeoMsg('Could not get your location. Tap the map to pin your home instead.'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const updateContact = (i, field, value) =>
    setContacts((prev) => prev.map((c, idx) => (idx === i ? { ...c, [field]: value } : c)));
  const addContact = () =>
    setContacts((prev) => (prev.length < MAX_CONTACTS ? [...prev, { ...EMPTY_CONTACT }] : prev));
  const removeContact = (i) => setContacts((prev) => prev.filter((_, idx) => idx !== i));

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = 'Household name is required';
    if (!address.trim()) e.address = 'Address is required';
    const n = Number(members);
    if (!Number.isInteger(n) || n < 1) e.members = 'Enter at least 1 member';
    if (!location) e.location = 'Pin your home on the map';

    contacts.forEach((c, i) => {
      const touched = c.name.trim() || c.phone.trim() || c.relationship.trim();
      if (i === 0 || touched) {
        if (!c.name.trim()) e[`cname${i}`] = 'Name is required';
        if (!isValidPhone(normalizePhone(c.phone))) e[`cphone${i}`] = 'Enter a valid mobile number, e.g. 09171234567';
      }
    });

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (submitting || !validate()) return;

    setFormError('');
    setSubmitting(true);

    // Drop empty extra contact rows
    const cleanContacts = contacts
      .filter((c, i) => i === 0 || c.name.trim() || c.phone.trim())
      .map((c) => ({
        name: c.name.trim(),
        phone: normalizePhone(c.phone),
        relationship: c.relationship.trim(),
      }));

    const { error } = await supabase.rpc('save_household', {
      p_household: {
        household_name: name.trim(),
        address: address.trim(),
        lat: location.lat,
        lng: location.lng,
        members_count: Number(members),
        has_vulnerable_members: vulnerable,
        notes: notes.trim(),
      },
      p_contacts: cleanContacts,
    });

    if (error) {
      console.error('save_household:', error);
      setSubmitting(false);
      setFormError('Could not save your household. Please try again.');
      return;
    }

    await refreshUser();          // reload profile so user.household is set
    setSubmitting(false);
    navigate(editing ? '/profile' : '/home', { replace: true });
  };

  const err = (key) => errors[key] && <span className="error-text">{errors[key]}</span>;
  const cls = (key) => (errors[key] ? 'field-error' : '');

  return (
    <div className="screen-enter" style={{ padding: '2px 20px 100px' }}>
      <div className="hh-top">
        {editing && (
          <button className="btn-ghost btn btn-sm" onClick={() => navigate('/profile')} aria-label="Go back" style={{ padding: '8px 10px' }}>←</button>
        )}
        <div>
          <h2 style={{ fontSize: 19 }}>{editing ? 'Edit household info' : 'Set up your household'}</h2>
          <p className="muted small" style={{ marginTop: 4 }}>
            {editing
              ? 'Keep this up to date so officials and neighbors can reach you.'
              : 'This helps officials find and check on your household during a storm. Only you and your barangay officials can see it.'}
          </p>
        </div>
      </div>

      <div className="form-grid">
        <div className="field">
          <label>Household name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={cls('name')} placeholder="Dela Cruz household" />
          {err('name')}
        </div>

        <div className="field">
          <label>Number of household members</label>
          <input type="number" min="1" value={members} onChange={(e) => setMembers(e.target.value)} className={cls('members')} placeholder="4" />
          {err('members')}
        </div>

        <div className="field full">
          <label>Address</label>
          <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className={cls('address')} placeholder="Blk 6, Purok 3" />
          {err('address')}
        </div>

        <div className="field full">
          <label className="hh-check">
            <input type="checkbox" checked={vulnerable} onChange={(e) => setVulnerable(e.target.checked)} />
            <span>Household has elderly, PWD, pregnant members, or infants</span>
          </label>
        </div>

        <div className="field full">
          <label>Notes for responders (optional)</label>
          <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. second floor, blue gate, bedridden member" />
        </div>
      </div>

      {/* Location */}
      <div className="section-label">
        <h3>Home location</h3>
        <a onClick={useMyLocation}>Use my location</a>
      </div>
      <LocationPicker value={location} onChange={setLocation} center={center} />
      <p className="muted small" style={{ marginTop: 8 }}>
        {location
          ? `Pinned at ${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}. Drag the pin to adjust.`
          : 'Tap the map to drop a pin on your home.'}
      </p>
      {geoMsg && <p className="error-text" style={{ marginTop: 4 }}>{geoMsg}</p>}
      {err('location')}

      {/* Emergency contacts */}
      <div className="section-label">
        <h3>Emergency contacts</h3>
        {contacts.length < MAX_CONTACTS && <a onClick={addContact}>+ Add another</a>}
      </div>
      <div className="stack">
        {contacts.map((c, i) => (
          <div key={i} className="card">
            <div className="form-grid">
              <div className="field">
                <label>{i === 0 ? 'Contact name' : `Contact ${i + 1} name`}</label>
                <input type="text" value={c.name} onChange={(e) => updateContact(i, 'name', e.target.value)} className={cls(`cname${i}`)} placeholder="Maria Dela Cruz" />
                {err(`cname${i}`)}
              </div>
              <div className="field">
                <label>Mobile number</label>
                <input type="text" value={c.phone} onChange={(e) => updateContact(i, 'phone', e.target.value)} className={cls(`cphone${i}`)} placeholder="0917 123 4567" />
                {err(`cphone${i}`)}
              </div>
              <div className="field full">
                <label>Relationship (optional)</label>
                <input type="text" value={c.relationship} onChange={(e) => updateContact(i, 'relationship', e.target.value)} placeholder="Sister, neighbor, ..." />
              </div>
            </div>
            {i > 0 && (
              <a className="small muted" style={{ cursor: 'pointer' }} onClick={() => removeContact(i)}>Remove this contact</a>
            )}
          </div>
        ))}
      </div>

      {formError && <p className="error-text" style={{ margin: '14px 0 0' }}>{formError}</p>}

      <button className="btn btn-accent btn-block" style={{ marginTop: 18 }} onClick={handleSubmit} disabled={submitting}>
        {submitting ? 'Saving…' : editing ? 'Save changes' : 'Finish setup'}
      </button>

      <style>{`
        .hh-top {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 18px 0 16px;
        }
        .hh-check {
          display: flex !important;
          flex-direction: row !important;
          align-items: center;
          gap: 10px;
          font-size: 13px !important;
          color: var(--ink) !important;
          cursor: pointer;
        }
        .hh-check input {
          width: 18px !important;
          height: 18px;
          padding: 0 !important;
          accent-color: var(--accent);
        }
        @media (min-width: 900px) {
          .hh-top { padding: 26px 0 20px; }
        }
      `}</style>
    </div>
  );
}