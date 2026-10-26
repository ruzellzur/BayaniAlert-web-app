import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

/**
 * Login Page
 *
 * Markup matches the prototype's `#screen-login`:
 *   .auth-visual (left hero panel, desktop only)
 *   .auth-wrap (right form panel)
 *     .brand
 *     .auth-head
 *     .role-switch (3 buttons: Resident / Official / Admin)
 *     .form-grid
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

export default function Login() {
  const navigate = useNavigate();
  const { login } = useApp();

  const [role, setRole] = useState('resident');
  const [idValue, setIdValue] = useState('');
  const [password, setPassword] = useState('');
  const [position, setPosition] = useState('Kagawad');
  const [showPassword, setShowPassword] = useState(false);

  const getIdLabel = () => {
    if (role === 'resident') return 'Household number or mobile';
    if (role === 'official') return 'Official ID or mobile';
    return 'Admin username';
  };

  const getIdPlaceholder = () => {
    if (role === 'resident') return 'e.g. 0917 123 4567';
    if (role === 'official') return 'e.g. BRGY-2024-0113';
    return 'e.g. admin.sanisidro';
  };

  const handleSubmit = (e) => {
    e?.preventDefault();

    const userData = {
      role,
      name:
        role === 'resident'
          ? 'Ruzel G.'
          : role === 'official'
          ? 'Mario Reyes'
          : 'System Admin',
      initials: role === 'resident' ? 'RG' : role === 'official' ? 'MR' : 'SA',
      household: role === 'resident' ? idValue.trim() : null,
      purok: role === 'resident' ? 'Purok 3' : undefined,
      position: role === 'official' ? position : null,
      officeContact: role === 'official' ? '0917 500 1042' : null,
      officialName: role === 'official' ? `${position} Mario Reyes` : null,
    };

    login(userData);

    if (role === 'admin') {
      navigate('/admin/approvals');
    } else if (role === 'official') {
      navigate('/announcements');
    } else {
      navigate('/home');
    }
  };

  return (
    <section className="screen active" id="screen-login">
      {/* Visual panel — desktop only */}
      <div className="auth-visual">
        <span className="hero-badge">Barangay San Isidro</span>
        <h2>
          Kapag may bagyo,<br /><i>magkasama tayo.</i>
        </h2>
        <p>
          Log back in to see tonight's advisory, check on your neighbors, and keep the resource board moving.
        </p>
      </div>

      {/* Form panel */}
      <div className="auth-wrap">
        <div className="brand">
          <span className="word">Bayani<em>Alert</em></span>
        </div>

        <div className="auth-head">
          <h2>Welcome back</h2>
          <p>Log in to see tonight's advisory and your barangay's resource board.</p>
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
          <button
            className={role === 'admin' ? 'active' : ''}
            onClick={() => setRole('admin')}
          >
            Administrator
          </button>
        </div>

        {/* Form */}
        <div className="form-grid">
          <div className="field">
            <label>{getIdLabel()}</label>
            <input
              type="text"
              placeholder={getIdPlaceholder()}
              value={idValue}
              onChange={(e) => setIdValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
            />
          </div>

          {/* Official-only position field */}
          {role === 'official' && (
            <div className="field" id="loginPositionField">
              <label>Position</label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
              >
                {POSITIONS.map((pos) => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>
          )}

          <div className="field">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                style={{ width: '100%', paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={{
                  position: 'absolute',
                  right: 4,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--ink-soft)',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '6px 8px',
                }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
        </div>

        {role === 'official' && (
          <p className="small muted" style={{ margin: '-8px 0 14px' }}>
            Position determines what you can do — e.g. only Rescue/Response Team and BDRRM Officer can update other households' check-in status directly.
          </p>
        )}

        <button className="btn btn-accent btn-block" onClick={handleSubmit}>
          Log in
        </button>

        <p className="auth-switch">
          New to BayaniAlert? <a onClick={() => navigate('/register')}>Create a household account</a>
        </p>
      </div>
    </section>
  );
}
