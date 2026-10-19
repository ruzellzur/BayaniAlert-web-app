import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

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
    <div className="screen-enter" style={{ padding: '2px 20px 100px' }}>
      {/* Topbar */}
      <div className="topbar">
        <div className="row" style={{ gap: 12 }}>
          <button className="btn-ghost btn btn-sm mobile-back" onClick={() => navigate('/home')} aria-label="Go back" style={{ padding: '8px 10px' }}>←</button>
          <h2 style={{ fontSize: 17 }}>{isOfficial ? 'My profile' : 'Household'}</h2>
        </div>
      </div>

      {/* Profile Header */}
      <div className="prof-head">
        <div className="avatar">{user?.initials || 'RG'}</div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15.5 }}>{user?.officialName || user?.name || 'Ruzel G.'}</div>
          <div className="muted small">
            {isOfficial
              ? `${user?.position || 'Kagawad'} · ${user?.purok || 'Purok 3'}`
              : `Household #${user?.household || '142'} · ${user?.purok || 'Purok 3'}`
            }
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="card" style={{ marginBottom: 16 }}>
        {isOfficial ? (
          <>
            <div className="list-item">
              <span>Position</span>
              <span className="val">{user?.position || 'Kagawad'}</span>
            </div>
            <div className="list-item">
              <span>Assigned zone</span>
              <span className="val">{user?.purok || 'Purok 3'}</span>
            </div>
            <div className="list-item">
              <span>Office contact</span>
              <span className="val">{user?.officeContact || '0917 500 1042'}</span>
            </div>
            <div className="list-item">
              <span>Permissions</span>
              <span className="val">
                {[
                  canAnnounce && 'Announcements',
                  canEvac && 'Evacuation centers',
                ].filter(Boolean).join(', ') || 'View only'}
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="list-item">
              <span>Family members</span>
              <span className="val">{user?.size || '4'}</span>
            </div>
            <div className="list-item">
              <span>Emergency contact</span>
              <span className="val">{user?.contact || '0917 xxx xx42'}</span>
            </div>
            <div className="list-item">
              <span>Address</span>
              <span className="val">{user?.address || 'Purok 3, Blk 6'}</span>
            </div>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="list-item" onClick={() => navigate('/directory')} style={{ cursor: 'pointer' }}>
          <span>Barangay hotlines</span>
          <span className="val">›</span>
        </div>
        {!isOfficial && (
          <div className="list-item" onClick={() => navigate('/edit-profile')} style={{ cursor: 'pointer' }}>
            <span>Edit household info</span>
            <span className="val">›</span>
          </div>
        )}
      </div>

      {/* Settings */}
      <div className="section-label" style={{ marginTop: 4 }}>
        <h3>Settings</h3>
      </div>
      <div className="card">
        {canAnnounce && (
          <div className="list-item" onClick={() => navigate('/announcements')} style={{ cursor: 'pointer' }}>
            <span>Manage announcements</span>
            <span className="val">›</span>
          </div>
        )}
        {canEvac && (
          <div className="list-item" onClick={() => navigate('/map')} style={{ cursor: 'pointer' }}>
            <span>Manage evacuation centers</span>
            <span className="val">›</span>
          </div>
        )}
        <div className="list-item" onClick={cycleTheme} style={{ cursor: 'pointer' }}>
          <span>Appearance</span>
          <span className="val">{themeLabels[theme] || 'System'}</span>
        </div>
        <div className="list-item" onClick={() => alert('Notification settings would open here')} style={{ cursor: 'pointer' }}>
          <span>Alert notifications</span>
          <span className="val">On</span>
        </div>
        <div className="list-item" onClick={() => alert('Language settings would open here')} style={{ cursor: 'pointer' }}>
          <span>Language</span>
          <span className="val">Filipino / English</span>
        </div>
        <div className="list-item" onClick={handleLogout} style={{ cursor: 'pointer' }}>
          <span>Log out</span>
          <span className="val">›</span>
        </div>
      </div>

      <style>{`
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 18px 20px 14px;
        }
        .prof-head {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 6px 0 18px;
        }
        .prof-head .avatar {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: var(--grad-primary);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 20px;
          box-shadow: 0 6px 16px rgba(27,42,74,0.25);
        }
        .list-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 0;
          border-top: 1px solid var(--border);
          font-size: 13.5px;
          font-weight: 600;
        }
        .list-item:first-child {
          border-top: none;
        }
        .list-item .val {
          color: var(--ink-soft);
          font-weight: 500;
        }

        @media (min-width: 900px) {
          .topbar {
            padding: 26px 0 20px;
          }
        }
      `}</style>
    </div>
  );
}
