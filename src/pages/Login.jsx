import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/app-context';
import Brand from '../components/Brand';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useApp();
  const [role, setRole] = useState('resident');
  const [idValue, setIdValue] = useState('');
  const [password, setPassword] = useState('');
  const [position, setPosition] = useState('Kagawad');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const positions = [
    'Barangay Captain',
    'Kagawad',
    'SK Chairperson',
    'Barangay Tanod',
    'BDRRM Officer',
    'Rescue/Response Team',
  ];

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

  const validate = () => {
    const newErrors = {};
    if (!idValue.trim()) {
      newErrors.idValue = role === 'admin' ? 'Username is required' : role === 'official' ? 'Official ID is required' : 'Household number is required';
    }
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const userData = {
      role,
      name: role === 'resident' ? 'Ruzel G.' : role === 'official' ? 'Mario Reyes' : 'System Admin',
      initials: role === 'resident' ? 'RG' : role === 'official' ? 'MR' : 'SA',
      household: role === 'resident' ? '142' : null,
      purok: 'Purok 3',
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
      <div className="auth-visual">
        <span className="hero-badge">
          <span className="live-dot" aria-hidden="true" /> Barangay San Isidro
        </span>
        <h2>Kapag may bagyo,<br /><i>magkasama tayo.</i></h2>
        <p>Log back in to see tonight's advisory, check on your neighbors, and keep the resource board moving.</p>
        <div className="auth-stats">
          <div><strong>Live</strong><span>Weather alerts</span></div>
          <div><strong>1-tap</strong><span>Safety check-in</span></div>
          <div><strong>Shared</strong><span>Supplies board</span></div>
        </div>
      </div>
      <div className="auth-wrap">
        <Brand />
        <div className="auth-head">
          <h2>Welcome back</h2>
          <p>Log in to see tonight's advisory and your barangay's resource board.</p>
        </div>
        <div className="role-switch">
          <button className={role === 'resident' ? 'active' : ''} onClick={() => setRole('resident')}>Resident</button>
          <button className={role === 'official' ? 'active' : ''} onClick={() => setRole('official')}>Barangay official</button>
          <button className={role === 'admin' ? 'active' : ''} onClick={() => setRole('admin')}>Administrator</button>
        </div>
        <div className="form-grid">
          <div className="field">
            <label>{getIdLabel()}</label>
            <input
              type="text"
              placeholder={getIdPlaceholder()}
              value={idValue}
              onChange={(e) => setIdValue(e.target.value)}
              className={errors.idValue ? 'field-error' : ''}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
            />
            {errors.idValue && <span className="error-text">{errors.idValue}</span>}
          </div>
          {role === 'official' && (
            <div className="field" id="loginPositionField">
              <label>Position</label>
              <select value={position} onChange={(e) => setPosition(e.target.value)}>
                {positions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
              </select>
            </div>
          )}
          {role === 'official' && (
            <p className="small muted" id="loginPositionNote" style={{ marginTop: '-8px', marginBottom: '14px' }}>
              Position determines what you can do — e.g. only Rescue/Response Team and BDRRM Officer can update other households' check-in status directly.
            </p>
          )}
          <div className="field">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={errors.password ? 'field-error' : ''}
                style={{ width: '100%', paddingRight: '44px' }}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '4px',
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
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>
        </div>
        <button className="btn btn-accent btn-block" onClick={handleSubmit}>Log in</button>
        <p className="auth-switch">New to BayaniAlert? <a onClick={() => navigate('/register')}>Create a household account</a></p>
      </div>
    </section>
  );
}
