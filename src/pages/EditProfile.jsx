import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button, Input, Card } from '../components/ui';
import { PageContainer, Section } from '../components/layout/PageContainer';

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, showToast } = useApp();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    householdSize: user?.householdSize || '4',
    address: user?.address || '',
    emergencyContact: user?.emergencyContact || ''
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.householdSize || formData.householdSize < 1) {
      newErrors.householdSize = 'Household size must be at least 1';
    }
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.emergencyContact.trim()) {
      newErrors.emergencyContact = 'Emergency contact is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      showToast('Profile updated successfully!');
      navigate('/profile');
    }
  };

  return (
    <PageContainer>
      {/* Topbar */}
      <div className="edit-topbar">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/profile')}
          aria-label="Go back"
        >
          ←
        </Button>
        <h2>Edit household info</h2>
      </div>

      <Card padding="lg">
        <div className="form-grid">
          <div className="field">
            <Input
              label="Full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Juan Dela Cruz"
              error={errors.name}
            />
          </div>
          <div className="field">
            <Input
              label="Household size"
              type="number"
              value={formData.householdSize}
              onChange={(e) => setFormData({ ...formData, householdSize: e.target.value })}
              placeholder="4"
              error={errors.householdSize}
            />
          </div>
          <div className="field full">
            <Input
              label="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Blk 6, Purok 3"
              error={errors.address}
            />
          </div>
          <div className="field full">
            <Input
              label="Emergency contact"
              value={formData.emergencyContact}
              onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
              placeholder="0917 xxx xx42"
              error={errors.emergencyContact}
            />
          </div>
        </div>

        <Button
          variant="accent"
          block
          onClick={handleSubmit}
          style={{ marginTop: 'var(--space-5)' }}
        >
          Save changes
        </Button>
      </Card>

      <style>{`
        .edit-topbar {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-2) 0 var(--space-4);
        }
        .edit-topbar h2 {
          font-size: var(--text-lg);
          font-weight: 600;
          margin: 0;
        }
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-4);
        }
        .field.full {
          grid-column: 1 / -1;
        }
        @media (max-width: 560px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </PageContainer>
  );
}
