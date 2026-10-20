import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui';
import { PageContainer, Section } from '../components/layout/PageContainer';

export default function Profile() {
  const navigate = useNavigate();
  const { user, cycleTheme, theme, logout } = useApp();

  const isOfficial = user?.role === 'official';
  const canAnnounce = user?.permissions?.announce;
  const canEvac = user?.permissions?.evac;

  const themeLabels = { system: 'System', light: 'Light', dark: 'Dark' };

  const handleLogout = () => {
    if (confirm('Log out of BayaniAlert?')) {
      logout();
      navigate('/');
    }
  };

  return (
    <PageContainer>
      {/* Topbar */}
      <div className="prof-topbar">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/home')}
          aria-label="Go back"
        >
          ←
        </Button>
        <h2>{isOfficial ? 'My profile' : 'Household'}</h2>
      </div>

      {/* Profile Header */}
      <div className="prof-head">
        <div className="avatar">{user?.initials || 'RG'}</div>
        <div>
          <div className="prof-name">{user?.officialName || user?.name || 'Ruzel G.'}</div>
          <div className="prof-subtitle">
            {isOfficial
              ? `${user?.position || 'Kagawad'} · ${user?.purok || 'Purok 3'}`
              : `Household #${user?.household || '142'} · ${user?.purok || 'Purok 3'}`
            }
          </div>
        </div>
      </div>

      {/* Info Card */}
      <Section title={isOfficial ? "Official Information" : "Household Information"}>
        <div className="info-list">
          {isOfficial ? (
            <>
              <InfoItem label="Position" value={user?.position || 'Kagawad'} />
              <InfoItem label="Assigned zone" value={user?.purok || 'Purok 3'} />
              <InfoItem label="Office contact" value={user?.officeContact || '0917 500 1042'} />
              <InfoItem
                label="Permissions"
                value={[
                  canAnnounce && 'Announcements',
                  canEvac && 'Evacuation centers',
                ].filter(Boolean).join(', ') || 'View only'}
              />
            </>
          ) : (
            <>
              <InfoItem label="Family members" value={user?.size || '4'} />
              <InfoItem label="Emergency contact" value={user?.contact || '0917 xxx xx42'} />
              <InfoItem label="Address" value={user?.address || 'Purok 3, Blk 6'} />
            </>
          )}
        </div>
      </Section>

      {/* Quick Actions */}
      <Section title="Quick Actions">
        <div className="action-list">
          <ActionItem label="Barangay hotlines" onClick={() => navigate('/directory')} />
          {!isOfficial && (
            <ActionItem label="Edit household info" onClick={() => navigate('/edit-profile')} />
          )}
        </div>
      </Section>

      {/* Settings */}
      <Section title="Settings">
        <div className="action-list">
          {canAnnounce && (
            <ActionItem label="Manage announcements" onClick={() => navigate('/announcements')} />
          )}
          {canEvac && (
            <ActionItem label="Manage evacuation centers" onClick={() => navigate('/map')} />
          )}
          <ActionItem
            label="Appearance"
            value={themeLabels[theme] || 'System'}
            onClick={cycleTheme}
          />
          <ActionItem
            label="Alert notifications"
            value="On"
            onClick={() => alert('Notification settings would open here')}
          />
          <ActionItem
            label="Language"
            value="Filipino / English"
            onClick={() => alert('Language settings would open here')}
          />
          <ActionItem
            label="Log out"
            onClick={handleLogout}
            danger
          />
        </div>
      </Section>

      <style>{`
        .prof-topbar {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-2) 0 var(--space-2);
        }
        .prof-topbar h2 {
          font-size: var(--text-lg);
          font-weight: 600;
          margin: 0;
        }
        .prof-head {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          padding: var(--space-2) 0 var(--space-6);
        }
        .prof-head .avatar {
          width: 56px;
          height: 56px;
          border-radius: var(--radius-lg);
          background: var(--grad-primary);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-weight: 600;
          font-size: var(--text-xl);
          box-shadow: var(--elevation-3);
        }
        .prof-name {
          font-weight: 600;
          font-size: var(--text-lg);
        }
        .prof-subtitle {
          font-size: var(--text-sm);
          color: var(--ink-soft);
          margin-top: var(--space-1);
        }
        .info-list {
          display: flex;
          flex-direction: column;
        }
        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-3) 0;
          border-top: 1px solid var(--border);
          font-size: var(--text-sm);
        }
        .info-item:first-child {
          border-top: none;
        }
        .info-item .label {
          font-weight: 600;
        }
        .info-item .value {
          color: var(--ink-soft);
          font-weight: 500;
        }
        .action-list {
          display: flex;
          flex-direction: column;
        }
        .action-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-3) 0;
          border-top: 1px solid var(--border);
          font-size: var(--text-sm);
          font-weight: 600;
          cursor: pointer;
          transition: opacity var(--duration-fast);
        }
        .action-item:hover {
          opacity: 0.8;
        }
        .action-item:first-child {
          border-top: none;
        }
        .action-item .chevron {
          color: var(--ink-soft);
        }
        .action-item.danger {
          color: var(--danger);
        }
      `}</style>
    </PageContainer>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="info-item">
      <span className="label">{label}</span>
      <span className="value">{value}</span>
    </div>
  );
}

function ActionItem({ label, value, onClick, danger }) {
  return (
    <div className={`action-item ${danger ? 'danger' : ''}`} onClick={onClick}>
      <span>{label}</span>
      <span className="chevron">{value || '›'}</span>
    </div>
  );
}
