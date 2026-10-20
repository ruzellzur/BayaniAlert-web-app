import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button, Input, Card, Chip } from '../components/ui';
import { PageContainer } from '../components/layout/PageContainer';
import Brand from '../components/Brand';

/**
 * Register Page
 *
 * Modern design-system UI on top of the ORIGINAL behaviour — nothing removed:
 * - Resident / Barangay official role switcher
 * - Resident fields: full name, mobile, purok, household size, address,
 *   emergency contact (+ PIN + confirm PIN from the redesign)
 * - Official fields: full name, mobile, position, assigned zone
 *   (incl. "All puroks"), office/hotline, appointment/ID number
 * - Role-aware headings and redirects (resident → /home, official → /announcements)
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
];

export default function Register() {
  const navigate = useNavigate();
  const { login, puroks, showToast } = useApp();

  const [role, setRole] = useState('resident');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Shared fields
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [purok, setPurok] = useState(puroks[0]?.name || 'Purok 1');

  // Resident-only fields
  const [householdSize, setHouseholdSize] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  // Official-only fields
  const [position, setPosition] = useState('Kagawad');
  const [zone, setZone] = useState('All puroks');
  const [officeContact, setOfficeContact] = useState('');
  const [officialId, setOfficialId] = useState('');

  const switchRole = (next) => {
    setRole(next);
    setErrors({});
  };

  const clearError = (key) => {
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const next = {};
    if (!name.trim()) next.name = 'Full name is required';
    if (!mobile.trim()) next.mobile = 'Mobile number is required';

    if (role === 'resident') {
      if (!pin.trim()) next.pin = 'PIN is required';
      else if (pin.trim().length < 4) next.pin = 'PIN must be at least 4 digits';
      if (pin !== confirmPin) next.confirmPin = 'PINs do not match';
    } else {
      if (!officeContact.trim()) next.officeContact = 'Office/hotline is required';
      if (!officialId.trim()) next.officialId = 'Appointment/ID number is required';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const initialsFrom = (fullName) =>
    fullName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join('') || 'BA';

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validate()) return;

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
    <div className="reg-page">
      <PageContainer variant="auth" className="reg-wrap">
        <Card padding="none" className="reg-card">
          <Brand />

          <div className="reg-head">
            <h2>
              {role === 'resident' ? 'Create your household account' : 'Create official account'}
            </h2>
            <p>
              {role === 'resident'
                ? 'One account per household — it keeps check-ins and requests organised.'
                : 'Officials need admin approval before they can post announcements.'}
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

          <form onSubmit={handleSubmit} className="reg-form">
            <div className="reg-grid">
              <Input
                id="regName"
                label="Full name"
                placeholder="Juan Dela Cruz"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  clearError('name');
                }}
                error={errors.name}
                disabled={loading}
                required
              />

              <Input
                id="regMobile"
                label="Mobile number"
                placeholder="0917 123 4567"
                value={mobile}
                onChange={(e) => {
                  setMobile(e.target.value);
                  clearError('mobile');
                }}
                error={errors.mobile}
                disabled={loading}
                required
              />
            </div>

            {role === 'resident' ? (
              <>
                <div className="reg-grid">
                  <div className="reg-field">
                    <label htmlFor="regPurok">Purok / Zone</label>
                    <select
                      id="regPurok"
                      value={purok}
                      onChange={(e) => setPurok(e.target.value)}
                      disabled={loading}
                    >
                      {puroks.map((p) => (
                        <option key={p.id || p.name} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Input
                    id="regHouseholdSize"
                    label="Household size"
                    placeholder="4"
                    type="number"
                    value={householdSize}
                    onChange={(e) => setHouseholdSize(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <Input
                  id="regAddress"
                  label="Address"
                  placeholder="Blk 6, Purok 3"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={loading}
                />

                <Input
                  id="regEmergencyContact"
                  label="Emergency contact"
                  placeholder="0917 xxx xx42"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  disabled={loading}
                />

                <div className="reg-grid">
                  <Input
                    id="regPin"
                    label="PIN"
                    type="password"
                    placeholder="••••"
                    value={pin}
                    onChange={(e) => {
                      setPin(e.target.value);
                      clearError('pin');
                    }}
                    error={errors.pin}
                    disabled={loading}
                    required
                  />

                  <Input
                    id="regConfirmPin"
                    label="Confirm PIN"
                    type="password"
                    placeholder="••••"
                    value={confirmPin}
                    onChange={(e) => {
                      setConfirmPin(e.target.value);
                      clearError('confirmPin');
                    }}
                    error={errors.confirmPin}
                    disabled={loading}
                    required
                  />
                </div>
              </>
            ) : (
              <>
                <div className="reg-grid">
                  <div className="reg-field">
                    <label htmlFor="regPositionSelect">Position</label>
                    <select
                      id="regPositionSelect"
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
                  </div>

                  <div className="reg-field">
                    <label htmlFor="regZoneSelect">Assigned purok / zone</label>
                    <select
                      id="regZoneSelect"
                      value={zone}
                      onChange={(e) => setZone(e.target.value)}
                      disabled={loading}
                    >
                      <option value="All puroks">All puroks</option>
                      {puroks.map((p) => (
                        <option key={p.id || p.name} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <Input
                  id="regOfficeContact"
                  label="Office / hotline"
                  placeholder="0917 500 1001"
                  value={officeContact}
                  onChange={(e) => {
                    setOfficeContact(e.target.value);
                    clearError('officeContact');
                  }}
                  error={errors.officeContact}
                  disabled={loading}
                  required
                />

                <Input
                  id="regOfficialId"
                  label="Appointment / ID number"
                  placeholder="BRGY-2024-0113"
                  value={officialId}
                  onChange={(e) => {
                    setOfficialId(e.target.value);
                    clearError('officialId');
                  }}
                  error={errors.officialId}
                  disabled={loading}
                  required
                />

                <p className="reg-note">
                  Your appointment ID is checked by the barangay admin before your account
                  is activated.
                </p>
              </>
            )}

            <Button
              type="submit"
              variant="accent"
              block
              loading={loading}
              disabled={loading}
              style={{ marginTop: 'var(--space-5)' }}
            >
              {role === 'resident' ? 'Create account' : 'Request official account'}
            </Button>
          </form>

          <p className="reg-switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </Card>
      </PageContainer>

      <style>{`
        .reg-page {
          min-height: 100vh;
          background: radial-gradient(120% 90% at 85% -10%, rgba(226,154,59,0.12), transparent 55%),
                      linear-gradient(180deg, var(--bg) 0%, var(--surface-alt) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .reg-wrap {
          max-width: 560px;
          width: 100%;
          padding: 36px 24px;
          margin: 0 auto;
        }

        .reg-card {
          padding: var(--space-6);
        }

        .reg-head {
          margin-top: var(--space-6);
        }

        .reg-head h2 {
          font-size: var(--text-2xl);
          font-weight: 600;
          margin: 0;
        }

        .reg-head p {
          color: var(--ink-soft);
          font-size: var(--text-sm);
          margin-top: var(--space-2);
          line-height: 1.5;
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

        .reg-form {
          margin-top: var(--space-5);
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .reg-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-4);
        }

        .reg-field > label {
          display: block;
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--ink-soft);
          margin-bottom: var(--space-2);
        }

        .reg-field select {
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

        .reg-field select:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: var(--focus-ring);
        }

        .reg-note {
          font-size: var(--text-xs);
          color: var(--ink-soft);
          line-height: 1.5;
          margin: 0;
        }

        .reg-switch {
          text-align: center;
          font-size: var(--text-sm);
          color: var(--ink-soft);
          margin-top: var(--space-5);
        }

        .reg-switch a {
          color: var(--ink);
          font-weight: 600;
          text-decoration: underline;
        }

        @media (min-width: 640px) {
          .reg-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (min-width: 900px) {
          .reg-wrap {
            max-width: 620px;
            padding: 60px 40px;
          }

          .reg-card {
            padding: var(--space-8);
          }
        }
      `}</style>
    </div>
  );
}
