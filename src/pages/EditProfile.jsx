import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, showToast } = useApp();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    householdSize: user?.householdSize || '4',
    address: user?.address || '',
    emergencyContact: user?.emergencyContact || ''
  });

  const handleSubmit = () => {
    showToast('Profile updated successfully!');
    navigate('/profile');
  };

  return (
    <div className="screen-enter" style={{ padding: '2px 20px 100px' }}>
      {/* Topbar */}
      <div className="topbar">
        <div className="row" style={{ gap: 12 }}>
          <button className="btn-ghost btn btn-sm mobile-back" onClick={() => navigate('/profile')} aria-label="Go back" style={{ padding: '8px 10px' }}>←</button>
          <h2 style={{ fontSize: 17 }}>Edit household info</h2>
        </div>
      </div>

      {/* Form */}
      <div className="form-grid">
        <div className="field">
          <label>Full name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Juan Dela Cruz"
          />
        </div>
        <div className="field">
          <label>Household size</label>
          <input
            type="number"
            value={formData.householdSize}
            onChange={(e) => setFormData({ ...formData, householdSize: e.target.value })}
            placeholder="4"
          />
        </div>
        <div className="field full">
          <label>Address</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Blk 6, Purok 3"
          />
        </div>
        <div className="field full">
          <label>Emergency contact</label>
          <input
            type="text"
            value={formData.emergencyContact}
            onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
            placeholder="0917 xxx xx42"
          />
        </div>
      </div>

      <button className="btn btn-accent btn-block" style={{ marginTop: 18 }} onClick={handleSubmit}>
        Save changes
      </button>

      <style>{`
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 18px 20px 14px;
        }

        @media (min-width: 900px) {
          .mobile-back {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
