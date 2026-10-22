import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/app-context';

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
    <div className="screen-enter">
      {/* Topbar */}
      <div className="topbar">
        <div className="row" style={{ gap: 12 }}>
          <button className="btn-ghost btn btn-sm mobile-back" onClick={() => navigate('/profile')} aria-label="Go back" style={{ padding: '8px 10px' }}>←</button>
          <h2 style={{ fontSize: 17 }}>Edit household info</h2>
        </div>
      </div>

      {/* Form */}
      <div className="card form-card">
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

        <div className="edit-actions">
          <button className="btn btn-accent" onClick={handleSubmit}>Save changes</button>
          <button className="btn btn-ghost" onClick={() => navigate('/profile')}>Cancel</button>
        </div>
      </div>

      <style>{`
        .form-card {
          padding: 22px 18px;
          background:
            radial-gradient(120% 100% at 0% 0%, var(--accent-soft), transparent 55%),
            var(--surface);
        }
        .edit-actions {
          margin-top: 20px;
          display: flex;
          gap: 10px;
        }
        .edit-actions .btn { flex: 1; }

      `}</style>
    </div>
  );
}
