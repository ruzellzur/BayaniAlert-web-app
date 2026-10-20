import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button, Input, Card, Chip } from '../components/ui';
import { PageContainer } from '../components/layout/PageContainer';
import Brand from '../components/Brand';

/**
 * Login Page
 *
 * Modern UI (design system + reusable components) layered on top of the
 * ORIGINAL behaviour — nothing removed:
 * - Role switcher: Resident / Barangay official / Administrator
 * - Official-only Position dropdown (drives POSITION_PERMS)
 * - Position explainer note
 * - Show / Hide password toggle
 * - Role-aware ID label + placeholder
 * - Role-aware redirects (admin → /admin/approvals, official → /announcements,
 *   resident → /home)
 */
const POSITIONS = [
  'Barangay Captain',
  'Kagawad',
  'SK Chairperson',
  'Barangay Tanod',
  'BDRRM Officer',
  'Rescue/Response Team',
];

const ROLES = [
  { id: 'resident', label: 'Resident' },
  { id: 'official', label: 'Barangay official' },
  { id: 'admin', label: 'Administrator' },
];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useApp();

  const [role, setRole] = useState('resident');
  const [idValue, setIdValue] = useState('');
  const [password, setPassword] = useState('');
  const [position, setPosition] = useState('Kagawad');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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

  const clearError = (key) => {
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const switchRole = (nextRole) => {
    setRole(nextRole);
    setErrors({});
  };

  const validate = () => {
    const newErrors = {};
    if (!idValue.trim()) {
      newErrors.idValue =
        role === 'admin'
          ? 'Username is required'
          : role === 'official'
          ? 'Official ID is required'
          : 'Household number is required';
    }
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    // Brief pause so the loading state is perceivable (same as before, shorter).
    await new Promise((resolve) => setTimeout(resolve, 400));

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
    setLoading(false);

    if (role === 'admin') {
      navigate('/admin/approvals');
    } else if (role === 'official') {
      navigate('/announcements');
    } else {
      navigate('/home');
    }
  };

  return (
    <div className="auth-page" id="screen-login">
      {/* Visual Panel - Desktop only */}
      <div className="auth-visual">
        <span className="hero-badge">Barangay San Isidro</span>
        <h2>
          Kapag may bagyo,<br />
          <i>magkasama tayo.</i>
        </h2>
        <p>
          Log back in to see tonight's advisory, check on your neighbors, and keep the
          resource board moving.
        </p>
      </div>

      {/* Form Panel */}
      <PageContainer variant="auth" className="auth-wrap">
        <Card padding="none" className="login-card">
          <Brand />

          <div className="login-head">
            <h2>Welcome back</h2>
            <p>
              Log in to see tonight's advisory and your barangay's resource board.
            </p>
          </div>

          {/* Role switcher — restored */}
          <div className="role-switch" role="tablist" aria-label="Account type">
            {ROLES.map((r) => (
              <Chip
                key={r.id}
                active={role === r.id}
                role="tab"
                aria-selected={role === r.id}
                onClick={() => switchRole(r.id)}
              >
                {r.label}
              </Chip>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <Input
              id="idValue"
              name="idValue"
              label={getIdLabel()}
              placeholder={getIdPlaceholder()}
              value={idValue}
              onChange={(e) => {
                setIdValue(e.target.value);
                clearError('idValue');
              }}
              error={errors.idValue}
              disabled={loading}
              autoComplete="username"
            />

            {/* Official-only Position — restored */}
            {role === 'official' && (
              <div className="login-field" id="loginPositionField">
                <label htmlFor="position">Position</label>
                <select
                  id="position"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  disabled={loading}
                >
                  {POSITIONS.map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
                <p className="login-note" id="loginPositionNote">
                  Position determines what you can do — e.g. only Rescue/Response Team
                  and BDRRM Officer can update other households' check-in status directly.
                </p>
              </div>
            )}

            {/* Password with Show/Hide — restored */}
            <div className="login-field">
              <label htmlFor="password">Password</label>
              <div className="pw-wrap">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearError('password');
                  }}
                  disabled={loading}
                  autoComplete="current-password"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                />
                <button
                  type="button"
                  className="pw-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.password && (
                <span className="login-error" id="password-error" role="alert">
                  {errors.password}
                </span>
              )}
            </div>

            <Button
              type="submit"
              variant="accent"
              block
              loading={loading}
              disabled={loading}
              style={{ marginTop: 'var(--space-4)' }}
            >
              Log in
            </Button>
          </form>

          <p className="auth-switch">
            New to BayaniAlert?{' '}
            <Link to="/register">Create a household account</Link>
          </p>

          <p className="login-demo">
            Demo: any household number + any password · or BRGY-2024-0113 (official)
            · or admin.sanisidro (admin)
          </p>
        </Card>
      </PageContainer>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(120% 90% at 85% -10%, rgba(226,154,59,0.12), transparent 55%),
                      linear-gradient(180deg, var(--bg) 0%, var(--surface-alt) 100%);
        }

        .auth-visual {
          display: none;
        }

        .login-card {
          padding: var(--space-8);
        }

        .login-head {
          margin-top: var(--space-6);
        }

        .login-head h2 {
          font-size: var(--text-3xl);
          font-weight: 600;
          margin: 0;
        }

        .login-head p {
          color: var(--ink-soft);
          font-size: var(--text-base);
          margin-top: var(--space-2);
        }

        .role-switch {
          display: flex;
          gap: var(--space-2);
          margin-top: var(--space-5);
          overflow-x: auto;
          padding-bottom: var(--space-1);
          scrollbar-width: none;
        }

        .role-switch::-webkit-scrollbar {
          display: none;
        }

        .role-switch > * {
          flex-shrink: 0;
        }

        .login-form {
          margin-top: var(--space-5);
        }

        .login-field {
          margin-top: var(--space-4);
        }

        .login-field > label {
          display: block;
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--ink-soft);
          margin-bottom: var(--space-2);
        }

        .login-field select,
        .login-field .pw-wrap input {
          width: 100%;
          padding: 11px 13px;
          font-size: var(--text-base);
          font-family: var(--font-body);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-md);
          background: var(--surface);
          color: var(--ink);
          transition: border-color var(--duration-fast), box-shadow var(--duration-fast);
        }

        .login-field select:focus,
        .login-field .pw-wrap input:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: var(--focus-ring);
        }

        .login-note {
          font-size: var(--text-xs);
          color: var(--ink-soft);
          line-height: 1.5;
          margin-top: var(--space-2);
        }

        .pw-wrap {
          position: relative;
        }

        .pw-wrap input {
          padding-right: 64px;
        }

        .pw-toggle {
          position: absolute;
          right: 4px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--ink-soft);
          font-size: var(--text-xs);
          font-weight: 600;
          cursor: pointer;
          padding: 6px 8px;
          border-radius: var(--radius-sm);
        }

        .pw-toggle:hover {
          color: var(--ink);
          background: var(--surface-alt);
        }

        .login-error {
          display: block;
          margin-top: var(--space-1);
          font-size: var(--text-xs);
          color: var(--danger);
        }

        .login-demo {
          text-align: center;
          font-size: var(--text-xs);
          color: var(--ink-soft);
          line-height: 1.5;
          margin-top: var(--space-4);
        }

        .auth-switch {
          margin-top: var(--space-5);
        }

        .auth-switch a {
          color: var(--ink);
          font-weight: 600;
          text-decoration: underline;
        }

        @media (min-width: 900px) {
          .auth-page {
            display: grid;
            grid-template-columns: 1fr 1fr;
            align-items: stretch;
            background: none;
          }

          .auth-visual {
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 60px;
            background: radial-gradient(120% 90% at 15% -10%, rgba(226,154,59,0.35), transparent 60%),
                        radial-gradient(90% 70% at 100% 100%, rgba(110,143,199,0.25), transparent 60%),
                        var(--grad-primary);
            color: #fff;
          }

          .auth-visual .hero-badge {
            align-self: flex-start;
            background: rgba(255,255,255,0.14);
            color: #fff;
            font-size: 11.5px;
            font-weight: 600;
            padding: 6px 12px;
            border-radius: 999px;
            margin-bottom: 20px;
          }

          .auth-visual h2 {
            color: #fff;
            font-size: 32px;
            max-width: 14ch;
            line-height: 1.15;
            margin: 20px 0 0;
          }

          .auth-visual h2 i {
            font-style: italic;
            background: linear-gradient(120deg, var(--accent-2), var(--accent) 70%);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
          }

          .auth-visual p {
            color: #C9D3E3;
            font-size: 15px;
            max-width: 34ch;
            margin-top: 14px;
            line-height: 1.6;
          }

          .auth-wrap {
            max-width: 480px;
            width: 100%;
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 60px 40px;
            background: var(--bg);
          }
        }

        @media (max-width: 899px) {
          .auth-wrap {
            max-width: 440px;
            width: 100%;
            padding: 36px 24px;
            margin: 24px auto;
          }

          .login-card {
            padding: var(--space-6);
          }

          .auth-wrap > div {
            box-shadow: 0 24px 60px rgba(20,30,55,0.10);
          }
        }
      `}</style>
    </div>
  );
}
