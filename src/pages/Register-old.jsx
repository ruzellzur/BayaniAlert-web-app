import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Brand from '../components/Brand';

export default function Register() {
  const navigate = useNavigate();
  const { login, puroks } = useApp();
  const [role, setRole] = useState('resident');

  // Resident fields
  const [residentName, setResidentName] = useState('');
  const [residentMobile, setResidentMobile] = useState('');
  const [residentPurok, setResidentPurok] = useState('Purok 3');
  const [householdSize, setHouseholdSize] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  // Official fields
  const [officialName, setOfficialName] = useState('');
  const [officialMobile, setOfficialMobile] = useState('');
  const [position, setPosition] = useState('Kagawad');
  const [assignedZone, setAssignedZone] = useState('Purok 3');
  const [officeContact, setOfficeContact] = useState('');
  const [idNumber, setIdNumber] = useState('');

  const positions = [
    'Barangay Captain',
    'Kagawad',
    'SK Chairperson',
    'Barangay Tanod',
    'BDRRM Officer',
    'Rescue/Response Team',
  ];

  const handleSubmit = () => {
    if (role === 'resident') {
      const userData = {
        role: 'resident',
        name: residentName || 'New Resident',
        initials: residentName ? residentName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'NR',
        household: '142',
        purok: residentPurok,
        householdSize: householdSize || '4',
        address: address,
        emergencyContact: emergencyContact,
      };
      login(userData);
      navigate('/home');
    } else {
      const userData = {
        role: 'official',
        name: officialName || 'New Official',
        initials: officialName ? officialName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'NO',
        purok: assignedZone,
        position: position,
        officeContact: officeContact,
        officialName: `${position} ${officialName || 'Official'}`,
      };
      login(userData);
      navigate('/announcements');
    }
  };

  return (
    <section className="screen active" id="screen-register">
      <div className="auth-visual">
        <span className="hero-badge">Barangay San Isidro</span>
        <h2>Kapag may bagyo,<br /><i>magkasama tayo.</i></h2>
        <p>One account gets your household weather alerts, the resource board, and a way to check in safe during a storm.</p>
      </div>
      <div className="auth-wrap">
        <Brand />
        <div className="auth-head">
          <h2 id="registerTitle">{role === 'resident' ? 'Create your household account' : 'Create official account'}</h2>
          <p id="registerSub">{role === 'resident' ? "One account per household — you'll use it for check-ins and the resource board." : 'Officials need admin approval before they can post announcements.'}</p>
        </div>
        <div className="role-switch">
          <button className={role === 'resident' ? 'active' : ''} id="registerRoleResident" onClick={() => setRole('resident')}>Resident</button>
          <button className={role === 'official' ? 'active' : ''} id="registerRoleOfficial" onClick={() => setRole('official')}>Barangay official</button>
        </div>

        {role === 'resident' && (
          <div className="form-grid" id="registerResidentFields">
            <div className="field">
              <label>Full name</label>
              <input
                type="text"
                placeholder="Juan Dela Cruz"
                value={residentName}
                onChange={(e) => setResidentName(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Mobile number</label>
              <input
                type="text"
                placeholder="0917 123 4567"
                value={residentMobile}
                onChange={(e) => setResidentMobile(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Purok / Zone</label>
              <select value={residentPurok} onChange={(e) => setResidentPurok(e.target.value)}>
                {puroks.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Household size</label>
              <input
                type="number"
                placeholder="4"
                value={householdSize}
                onChange={(e) => setHouseholdSize(e.target.value)}
              />
            </div>
            <div className="field full">
              <label>Address</label>
              <input
                type="text"
                placeholder="Blk 6, Purok 3"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div className="field full">
              <label>Emergency contact</label>
              <input
                type="text"
                placeholder="0917 xxx xx42"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
              />
            </div>
          </div>
        )}

        {role === 'official' && (
          <div className="form-grid" id="registerOfficialFields">
            <div className="field">
              <label>Full name</label>
              <input
                type="text"
                id="regOfficialName"
                placeholder="Mario Reyes"
                value={officialName}
                onChange={(e) => setOfficialName(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Mobile number</label>
              <input
                type="text"
                placeholder="0917 500 1042"
                value={officialMobile}
                onChange={(e) => setOfficialMobile(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Position</label>
              <select id="regPositionSelect" value={position} onChange={(e) => setPosition(e.target.value)}>
                {positions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Assigned purok / zone</label>
              <select id="regZoneSelect" value={assignedZone} onChange={(e) => setAssignedZone(e.target.value)}>
                <option value="All puroks">All puroks</option>
                {puroks.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="field full">
              <label>Office / hotline number</label>
              <input
                type="text"
                id="regOfficeContact"
                placeholder="0917 500 1001"
                value={officeContact}
                onChange={(e) => setOfficeContact(e.target.value)}
              />
            </div>
            <div className="field full">
              <label>Appointment / ID number</label>
              <input
                type="text"
                placeholder="BRGY-2024-0113"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
              />
            </div>
          </div>
        )}

        <button className="btn btn-accent btn-block" onClick={handleSubmit}>Create account</button>
        <p className="auth-switch">Already registered? <a onClick={() => navigate('/login')}>Log in</a></p>
      </div>
    </section>
  );
}
