import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/app-context';

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
    <div className="screen-enter">
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
          <div className="prof-name">{user?.officialName || user?.name || 'Ruzel G.'}</div>
          <div className="prof-meta">
            {isOfficial
              ? `${user?.position || 'Kagawad'} · ${user?.purok || 'Purok 3'}`
              : `Household #${user?.household || '142'} · ${user?.purok || 'Purok 3'}`
            }
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="card settings-card" style={{ marginBottom: 16 }}>
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
      <div className="card settings-card" style={{ marginBottom: 16 }}>
        <div className="list-item clickable" onClick={() => navigate('/directory')}>
          <span>Barangay hotlines</span>
          <span className="val">›</span>
        </div>
        {!isOfficial && (
          <div className="list-item clickable" onClick={() => navigate('/edit-profile')}>
            <span>Edit household info</span>
            <span className="val">›</span>
          </div>
        )}
      </div>

      {/* Settings */}
      <div className="section-label" style={{ marginTop: 4 }}>
        <h3>Settings</h3>
      </div>
      <div className="card settings-card">
        {canAnnounce && (
          <div className="list-item clickable" onClick={() => navigate('/announcements')}>
            <span>Manage announcements</span>
            <span className="val">›</span>
          </div>
        )}
        {canEvac && (
          <div className="list-item clickable" onClick={() => navigate('/map')}>
            <span>Manage evacuation centers</span>
            <span className="val">›</span>
          </div>
        )}
        <div className="list-item clickable" onClick={cycleTheme}>
          <span>Appearance</span>
          <span className="val">{themeLabels[theme] || 'System'}</span>
        </div>
        <div className="list-item clickable" onClick={() => alert('Notification settings would open here')}>
          <span>Alert notifications</span>
          <span className="val">On</span>
        </div>
        <div className="list-item clickable" onClick={() => alert('Language settings would open here')}>
          <span>Language</span>
          <span className="val">Filipino / English</span>
        </div>
        <div className="list-item clickable" onClick={handleLogout}>
          <span>Log out</span>
          <span className="val">›</span>
        </div>
      </div>

      <style>{`
        .prof-head {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 14px;
          padding: 10px 0 24px;
        }
        .prof-head .avatar {
          width: 84px;
          height: 84px;
          border-radius: 50%;
          background: var(--grad-primary);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 30px;
          box-shadow: 0 14px 32px -10px rgba(21,35,61,0.65);
          position: relative;
          animation: floaty 6s ease-in-out infinite;
        }
        .prof-head .avatar::after {
          content: "";
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          border: 2px solid var(--accent);
          opacity: 0.5;
          animation: pulseRing 2.8s ease-out infinite;
        }
        .prof-name {
          font-family: var(--font-display);
          font-size: 21px;
          font-weight: 600;
          line-height: 1.2;
        }
        .prof-meta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--ink-soft);
          background: var(--surface);
          border: 1px solid var(--border);
          padding: 6px 14px;
          border-radius: 999px;
          box-shadow: var(--card-shadow);
        }

        .settings-card { padding: 4px 16px; }
        .list-item.clickable { transition: color 0.18s ease; }

        @media (min-width: 900px) {
          .prof-head { padding: 14px 0 30px; }
          .prof-name { font-size: 27px; }
          .prof-head .avatar { width: 100px; height: 100px; font-size: 36px; }
        }

      `}</style>
    </div>
  );
}
