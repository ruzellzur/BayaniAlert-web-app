import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeftIcon } from '../components/icons';

/**
 * Edit Household Info Page
 *
 * Markup matches the prototype's `#screen-editProfile`:
 *   .topbar > .row (mobile-back + h2 "Edit household info")
 *   .form-grid > .field (Full name / Household size) + .field.full (Address / Emergency contact)
 *   .btn.btn-accent.btn-block (Save changes)
 *
 * All visual rules live in src/styles/prototype.css.
 */
export default function EditProfile() {
  const navigate = useNavigate();
  const { user, updateProfile, showToast } = useApp();

  const [name, setName] = useState(user?.name || 'Ruzel G.');
  const [size, setSize] = useState(user?.householdSize || 4);
  const [address, setAddress] = useState(user?.address || 'Purok 3, Blk 6');
  const [contact, setContact] = useState(user?.emergencyContact || '0917 xxx xx42');

  const handleSave = () => {
    if (!name.trim()) {
      showToast?.('Full name is required');
      return;
    }
    const payload = {
      name: name.trim(),
      householdSize: parseInt(size, 10) || 0,
      address: address.trim(),
      emergencyContact: contact.trim(),
    };
    if (updateProfile) updateProfile(payload);
    showToast?.('Household info saved');
    navigate('/profile');
  };

  return (
    <section className="screen active" id="screen-editProfile">
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
          <h2 style={{ fontSize: 17 }}>Edit household info</h2>
        </div>
      </div>

      <div className="form-grid">
        <div className="field">
          <label>Full name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label>Household size</label>
          <input type="number" value={size} onChange={(e) => setSize(e.target.value)} />
        </div>
        <div className="field full">
          <label>Address</label>
          <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
        <div className="field full">
          <label>Emergency contact</label>
          <input type="text" value={contact} onChange={(e) => setContact(e.target.value)} />
        </div>
      </div>

      <button className="btn btn-accent btn-block" style={{ marginTop: 18 }} onClick={handleSave}>
        Save changes
      </button>
    </section>
  );
}
