import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

/**
 * Register Page
 *
 * Markup matches the prototype's `#screen-register`:
 *   .auth-visual (left hero panel, desktop only)
 *   .auth-wrap (right form panel)
 *     .brand
 *     .auth-head
 *     .role-switch (2 buttons: Resident / Official)
 *     .form-grid #registerResidentFields
 *     .form-grid #registerOfficialFields (hidden by default)
 *     .btn-accent.btn-block
 *     .auth-switch
 *
 * All visual rules live in src/styles/prototype.css.
 */
const POSITIONS = [
  'Barangay Captain',
  'Kagawad',
  'SK Chairperson',
  'Barangay Tanod',
  'BDRRM Officer',
  'Rescue/Response Team',
];

export default function Register() {
  const navigate = useNavigate();
  const { login, puroks, showToast } = useApp();

  const [role, setRole] = useState('resident');
  const [loading, setLoading] = useState(false);

  // Shared fields
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [purok, setPurok] = useState('Purok 3');

  // Resident-only
  const [householdSize, setHouseholdSize] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  // Official-only
  const [position, setPosition] = useState('Kagawad');
  const [zone, setZone] = useState('All puroks');
  const [officeContact, setOfficeContact] = useState('');
  const [officialId, setOfficialId] = useState('');

  const initialsFrom = (fullName) =>
    fullName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join('') || 'BA';

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 400));

    const userData =
      role === 'resident'
        ? {
            role: 'resident',
            name: name.trim(),
            initials: initialsFrom(name),
            household: '142',
            purok,
            householdSize: householdSize.trim() || '4',
            address: address.trim(),
            emergencyContact: emergencyContact.trim(),
            mobile: mobile.trim(),
          }
        : {
            role: 'official',
            name: name.trim(),
            initials: initialsFrom(name),
            household: null,
            purok: zone === 'All puroks' ? 'Purok 3' : zone,
            position,
            officeContact: officeContact.trim(),
            officialId: officialId.trim(),
            mobile: mobile.trim(),
            officialName: `${position} ${name.trim()}`,
          };

    login(userData);
    setLoading(false);
    showToast?.('Account created successfully!');

    navigate(role === 'official' ? '/announcements' : '/home');
  };

  return (
    <section className="screen active" id="screen-register">
      {/* Visual panel — desktop only */}
      <div className="auth-visual">
        <span className="hero-badge">Barangay San Isidro</span>
        <h2>
          Kapag may bagyo,<br /><i>magkasama tayo.</i>
        </h2>
        <p>
          One account gets your household weather alerts, the resource board, and a way to check in safe during a storm.
        </p>
      </div>

      {/* Form panel */}
      <div className="auth-wrap">
        <div className="brand">
          <span className="word">Bayani<em>Alert</em></span>
        </div>

        <div className="auth-head">
          <h2 id="registerTitle">
            {role === 'resident' ? 'Create your household account' : 'Create official account'}
          </h2>
          <p id="registerSub">
            {role === 'resident'
              ? "One account per household — you'll use it for check-ins and the resource board."
              : 'Officials need admin approval before they can post announcements.'}
          </p>
        </div>

        {/* Role switcher */}
        <div className="role-switch">
          <button
            className={role === 'resident' ? 'active' : ''}
            onClick={() => setRole('resident')}
          >
            Resident
          </button>
          <button
            className={role === 'official' ? 'active' : ''}
            onClick={() => setRole('official')}
          >
            Barangay official
          </button>
        </div>

        {/* Resident fields */}
        <div
          className="form-grid"
          id="registerResidentFields"
          style={{ display: role === 'resident' ? 'grid' : 'none' }}
        >
          <div className="field">
            <label>Full name</label>
            <input
              type="text"
              placeholder="Juan Dela Cruz"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="field">
            <label>Mobile number</label>
            <input
              type="text"
              placeholder="0917 123 4567"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="field">
            <label>Purok / Zone</label>
            <select value={purok} onChange={(e) => setPurok(e.target.value)} disabled={loading}>
              {(puroks.length > 0 ? puroks : [
                { name: 'Purok 1' },
                { name: 'Purok 2' },
                { name: 'Purok 3' },
                { name: 'Purok 4' },
              ]).map((p, i) => (
                <option key={i} value={p.name} selected={p.name === 'Purok 3'}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Household size</label>
            <input
              type="number"
              placeholder="4"
              value={householdSize}
              onChange={(e) => setHouseholdSize(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="field full">
            <label>Address</label>
            <input
              type="text"
              placeholder="Blk 6, Purok 3"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="field full">
            <label>Emergency contact</label>
            <input
              type="text"
              placeholder="0917 xxx xx42"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        {/* Official fields */}
        <div
          className="form-grid"
          id="registerOfficialFields"
          style={{ display: role === 'official' ? 'grid' : 'none' }}
        >
          <div className="field">
            <label>Full name</label>
            <input
              type="text"
              placeholder="Mario Reyes"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="field">
            <label>Mobile number</label>
            <input
              type="text"
              placeholder="0917 500 1042"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="field">
            <label>Position</label>
            <select value={position} onChange={(e) => setPosition(e.target.value)} disabled={loading}>
              {POSITIONS.map((pos) => (
                <option key={pos} value={pos} selected={pos === 'Kagawad'}>
                  {pos}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Assigned purok / zone</label>
            <select value={zone} onChange={(e) => setZone(e.target.value)} disabled={loading}>
              <option value="All puroks">All puroks</option>
              {(puroks.length > 0 ? puroks : [
                { name: 'Purok 1' },
                { name: 'Purok 2' },
                { name: 'Purok 3' },
                { name: 'Purok 4' },
              ]).map((p, i) => (
                <option key={i} value={p.name} selected={p.name === 'Purok 3'}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field full">
            <label>Office / hotline number</label>
            <input
              type="text"
              placeholder="0917 500 1001"
              value={officeContact}
              onChange={(e) => setOfficeContact(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="field full">
            <label>Appointment / ID number</label>
            <input
              type="text"
              placeholder="BRGY-2024-0113"
              value={officialId}
              onChange={(e) => setOfficialId(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <button
          className="btn btn-accent btn-block"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create account'}
        </button>

        <p className="auth-switch">
          Already registered? <a onClick={() => navigate('/login')}>Log in</a>
        </p>
      </div>
    </section>
  );
}
