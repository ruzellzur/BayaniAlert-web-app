import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/apiConfig'; // adjust path if needed
import { useAuth, normalizePhone, isValidPhone } from '../context/AuthContext';
import Brand from '../components/Brand';

  const positions = [
    'Barangay Captain',
    'Kagawad',
    'SK Chairperson',
    'Barangay Tanod',
    'BDRRM Officer',
    'Rescue/Response Team',
  ];

export default function Register() {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [role, setRole] = useState('resident');

  // Shared fields (kept when switching between the Resident / Official tabs)
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [barangayId, setBarangayId] = useState('');
  const [purokId, setPurokId] = useState(''); // official: '' = "All puroks"
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  // Official-only
  const [idNumber, setIdNumber] = useState('');
  const [position, setPosition] = useState('Kagawad');

  // TODO(household setup step): these need the households/emergency_contacts
  // tables plus a map pin, so they move to a post-signup screen.
  // const [householdSize, setHouseholdSize] = useState('');
  // const [address, setAddress] = useState('');
  // const [emergencyContact, setEmergencyContact] = useState('');
  // const [officeContact, setOfficeContact] = useState('');   // no DB column yet

  const [barangays, setBarangays] = useState([]);
  const [puroks, setPuroks] = useState([]);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false); // officials: request sent

  // Barangays (readable without login)
  useEffect(() => {
    supabase
      .from('barangays')
      .select('id, name')
      .order('name')
      .then(({ data, error }) => {
        if (error) console.error('barangays:', error);
        setBarangays(data || []);
        if (data?.length === 1) setBarangayId(data[0].id);
      });
  }, []);

  // Puroks for the chosen barangay
  useEffect(() => {
    setPurokId('');
    if (!barangayId) {
      setPuroks([]);
      return;
    }
    supabase
      .from('puroks')
      .select('id, name')
      .eq('barangay_id', barangayId)
      .order('name')
      .then(({ data, error }) => {
        if (error) console.error('puroks:', error);
        setPuroks(data || []);
      });
  }, [barangayId]);

  const validate = () => {
    const e = {};
    if (!fullName.trim()) e.fullName = 'Full name is required';
    if (!isValidPhone(normalizePhone(mobile))) e.mobile = 'Enter a valid mobile number, e.g. 09171234567';
    if (!barangayId) e.barangayId = 'Select your barangay';
    if (role === 'resident' && puroks.length > 0 && !purokId) e.purokId = 'Select your purok';
    if (role === 'official' && !idNumber.trim()) e.idNumber = 'Appointment / ID number is required';
    if (password.length < 6) e.password = 'Use at least 6 characters';
    if (confirm !== password) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (submitting || !validate()) return;

    setFormError('');
    setSubmitting(true);
    const result = await signUp({
      role,
      fullName: fullName.trim(),
      phone: mobile,
      password,
      barangayId,
      purokId,
      idNumber,
      position,
    });
    setSubmitting(false);

    if (result.error) {
      setFormError(result.error);
      return;
    }
    if (result.pendingApproval) {
      setSubmitted(true); // officials wait for an admin
      return;
    }
    navigate('/home'); // residents are approved immediately
  };

  const err = (key) => errors[key] && <span className="error-text">{errors[key]}</span>;
  const cls = (key) => (errors[key] ? 'field-error' : '');

  return (
    <section className="screen active" id="screen-register">
      <div className="auth-visual">
        <span className="hero-badge">Barangay San Isidro</span>
        <h2>Kapag may bagyo,<br /><i>magkasama tayo.</i></h2>
        <p>One account gets your household weather alerts, the resource board, and a way to check in safe during a storm.</p>
      </div>

      <div className="auth-wrap">
        <Brand />

        {submitted ? (
          <div className="auth-head">
            <h2>Request submitted</h2>
            <p>
              Your official account is waiting for admin approval. You can log in with
              your mobile number once it has been approved.
            </p>
            <button className="btn btn-accent btn-block" onClick={() => navigate('/login')}>
              Back to log in
            </button>
          </div>
        ) : (
          <>
            <div className="auth-head">
              <h2 id="registerTitle">{role === 'resident' ? 'Create your household account' : 'Create official account'}</h2>
              <p id="registerSub">
                {role === 'resident'
                  ? "One account per household — you'll use it for check-ins and the resource board."
                  : 'Officials need admin approval before they can post announcements.'}
              </p>
            </div>

            <div className="role-switch">
              <button type="button" className={role === 'resident' ? 'active' : ''} onClick={() => setRole('resident')}>Resident</button>
              <button type="button" className={role === 'official' ? 'active' : ''} onClick={() => setRole('official')}>Barangay official</button>
            </div>

            <div className="form-grid">
              <div className="field">
                <label>Full name</label>
                <input
                  type="text"
                  placeholder="Juan Dela Cruz"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={cls('fullName')}
                />
                {err('fullName')}
              </div>

              <div className="field">
                <label>Mobile number</label>
                <input
                  type="text"
                  placeholder="0917 123 4567"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className={cls('mobile')}
                />
                {err('mobile')}
              </div>

              <div className="field">
                <label>Barangay</label>
                <select
                  value={barangayId}
                  onChange={(e) => setBarangayId(e.target.value)}
                  className={cls('barangayId')}
                >
                  <option value="">Select barangay</option>
                  {barangays.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                {err('barangayId')}
              </div>

              <div className="field">
                <label>{role === 'resident' ? 'Purok / Zone' : 'Assigned purok / zone'}</label>
                <select
                  value={purokId}
                  onChange={(e) => setPurokId(e.target.value)}
                  className={cls('purokId')}
                  disabled={!barangayId}
                >
                  <option value="">{role === 'resident' ? 'Select purok' : 'All puroks'}</option>
                  {puroks.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                {err('purokId')}
              </div>

              {role === 'official' && (
                <div className="field full">
                  <label>Appointment / ID number</label>
                  <input
                    type="text"
                    placeholder="BRGY-2024-0113"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    className={cls('idNumber')}
                  />
                  {err('idNumber')}
                </div>
              )}

              {role === 'official' && (
                <div className="field">
                  <label>Position</label>
                  <select value={position} onChange={(e) => setPosition(e.target.value)}>
                    {positions.map((pos) => <option key={pos} value={pos}>{pos}</option>)}
                  </select>
                </div>
              )}

              {/* TODO(household setup step): resident household details
              {role === 'resident' && (
                <>
                  <div className="field">
                    <label>Household size</label>
                    <input type="number" placeholder="4" value={householdSize}
                      onChange={(e) => setHouseholdSize(e.target.value)} />
                  </div>
                  <div className="field full">
                    <label>Address</label>
                    <input type="text" placeholder="Blk 6, Purok 3" value={address}
                      onChange={(e) => setAddress(e.target.value)} />
                  </div>
                  <div className="field full">
                    <label>Emergency contact</label>
                    <input type="text" placeholder="0917 xxx xx42" value={emergencyContact}
                      onChange={(e) => setEmergencyContact(e.target.value)} />
                  </div>
                </>
              )}
              */}

              {/* TODO: official office / hotline number (no DB column yet)
              {role === 'official' && (
                <div className="field full">
                  <label>Office / hotline number</label>
                  <input type="text" placeholder="0917 500 1001" value={officeContact}
                    onChange={(e) => setOfficeContact(e.target.value)} />
                </div>
              )}
              */}

              <div className="field">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={cls('password')}
                />
                {err('password')}
              </div>

              <div className="field">
                <label>Confirm password</label>
                <input
                  type="password"
                  placeholder="Re-enter password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className={cls('confirm')}
                />
                {err('confirm')}
              </div>
            </div>

            {formError && <p className="error-text" style={{ marginBottom: 10 }}>{formError}</p>}

            <button className="btn btn-accent btn-block" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Creating account…' : 'Create account'}
            </button>
            <p className="auth-switch">Already registered? <a onClick={() => navigate('/login')}>Log in</a></p>
          </>
        )}
      </div>
    </section>
  );
}