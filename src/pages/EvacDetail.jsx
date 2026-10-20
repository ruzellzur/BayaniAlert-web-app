import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button, Card, Input } from '../components/ui';
import { PageContainer, Section } from '../components/layout/PageContainer';

export default function EvacDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { evacCenters, updateEvacCenter, user } = useApp();

  const evacId = parseInt(id, 10);
  const evac = evacCenters[id] || evacCenters[0];

  if (!evac) {
    return (
      <PageContainer>
        <div className="evac-topbar">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/map')}
            aria-label="Go back"
          >
            ←
          </Button>
          <h2>Evacuation center</h2>
        </div>
        <Card padding="lg" style={{ textAlign: 'center', marginTop: 'var(--space-5)' }}>
          <p className="muted">Evacuation center not found</p>
        </Card>
      </PageContainer>
    );
  }

  const isOfficial = user?.role === 'official';
  const canManageEvac = user?.permissions?.evac;

  const getAmenityStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'var(--safe)';
      case 'Limited': return 'var(--accent)';
      case 'Unavailable': return 'var(--danger)';
      default: return 'var(--ink-soft)';
    }
  };

  return (
    <PageContainer>
      {/* Topbar */}
      <div className="evac-topbar">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/map')}
          aria-label="Go back"
        >
          ←
        </Button>
        <h2>Evacuation center</h2>
      </div>

      {/* Main Info Card */}
      <Card padding="lg">
        <div className="evac-name">{evac.name}</div>
        <div className="evac-addr">{evac.addr}</div>
        <div className="cap-bar">
          <div
            className="cap-fill"
            style={{ width: `${(evac.cap / evac.max) * 100}%` }}
          />
        </div>
        <div className="cap-labels">
          <span className="cap-label">Capacity</span>
          <span className="cap-value">{evac.cap} / {evac.max}</span>
        </div>
      </Card>

      {/* Update Capacity (Officials Only) */}
      {isOfficial && canManageEvac && (
        <Section title="Update capacity">
          <Card padding="md">
            <Input
              label="Current occupancy"
              type="number"
              min="0"
              defaultValue={evac.cap}
              onChange={(e) => {
                const newCap = parseInt(e.target.value, 10);
                if (!isNaN(newCap)) {
                  updateEvacCenter(evacCenters.indexOf(evac), { cap: newCap });
                }
              }}
            />
            <Button
              variant="accent"
              block
              onClick={() => alert('Capacity updated!')}
              style={{ marginTop: 'var(--space-3)' }}
            >
              Save capacity
            </Button>
          </Card>
        </Section>
      )}

      {isOfficial && !canManageEvac && (
        <p className="permission-note">
          Your position doesn't include evacuation-center management. A Barangay Captain, Kagawad, or BDRRM Officer can update capacity here.
        </p>
      )}

      {/* On-site Amenities */}
      <Section title="On-site">
        <Card padding="md">
          {evac.amenities.map((amenity, i) => (
            <div key={i} className="amenity-item">
              <span>{amenity.name}</span>
              <span
                className="amenity-status"
                style={{ color: getAmenityStatusColor(amenity.status) }}
              >
                {amenity.status}
              </span>
            </div>
          ))}
        </Card>
      </Section>

      {/* Get Directions Button */}
      <Button
        variant="primary"
        block
        onClick={() => alert('Directions would open here')}
      >
        Get directions
      </Button>

      <style>{`
        .evac-topbar {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-2) 0 var(--space-4);
        }
        .evac-topbar h2 {
          font-size: var(--text-lg);
          font-weight: 600;
          margin: 0;
        }
        .evac-name {
          font-weight: 600;
          font-size: var(--text-lg);
        }
        .evac-addr {
          font-size: var(--text-sm);
          color: var(--ink-soft);
          margin-top: var(--space-1);
        }
        .cap-bar {
          height: 9px;
          border-radius: var(--radius-full);
          background: var(--surface-alt);
          overflow: hidden;
          margin-top: var(--space-4);
          box-shadow: inset 0 1px 3px rgba(0,0,0,0.10);
        }
        .cap-fill {
          height: 100%;
          border-radius: var(--radius-full);
          background: var(--grad-safe);
          transition: width var(--duration-base);
        }
        .cap-labels {
          display: flex;
          justify-content: space-between;
          margin-top: var(--space-2);
        }
        .cap-label, .cap-value {
          font-size: var(--text-sm);
          color: var(--ink-soft);
        }
        .permission-note {
          font-size: var(--text-sm);
          color: var(--ink-soft);
          margin: calc(-1 * var(--space-1)) 0 var(--space-4);
        }
        .amenity-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-2) 0;
          border-top: 1px solid var(--border);
          font-size: var(--text-sm);
        }
        .amenity-item:first-child {
          border-top: none;
        }
        .amenity-status {
          font-weight: 600;
          font-size: var(--text-xs);
        }
      `}</style>
    </PageContainer>
  );
}
