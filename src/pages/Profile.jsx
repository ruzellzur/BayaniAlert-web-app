import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeftIcon } from '../components/icons';

/**
 * Household / Profile Page
 *
 * Markup matches the prototype's `#screen-profile`:
 *   .topbar > .row (mobile-back + h2 "Household")
 *   .role-swap[data-role=resident] > .prof-head + .card of .list-item
 *   .role-swap[data-role=official] > .prof-head + .card of .list-item
 *   .card (Barangay hotlines / Edit household info)
 *   .section-label > h3 Settings + .card of .list-item
 *
 * All visual rules live in src/styles/prototype.css.
 */
const THEME_LABEL = { system: 'System', light: 'Light', dark: 'Dark' };

export default function Profile() {
  const navigate = useNavigate();
  const { user, theme, cycleTheme, logout, showToast } = useApp();

  const isOfficial = user?.role === 'official';

  const residentName = user?.name || 'Ruzel G.';
  const residentInitials = residentName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const officialName = user?.officialName || user?.name || 'Kagawad Mario Reyes';
  const officialInitials = officialName
    .split(' ')
    .filter((w) => /[A-Za-z]/.test(w[0]))
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const perms = user?.permissions || {};
  const permLabels = [];
  if (perms.announce) permLabels.push('Announcements');
  if (perms.evac) permLabels.push('Evacuation centers');
  if (perms.rescue) permLabels.push('Rescue / response');

  const handleLogout = () => {
    if (window.confirm('Log out of BayaniAlert?')) {
      logout?.();
      navigate('/');
    }
  };

  return (
    <section className="screen active" id="screen-profile">
      {/* Topbar */}
      <div className="topbar">
        <div className="row" style={{ gap: 12 }}>
          <button
            className="btn-ghost btn btn-sm mobile-back"
            onClick={() => navigate('/home')}
            aria-label="Go back"
            style={{ padding: '8px 10px' }}
          >
            <ArrowLeftIcon />
          </button>
          <h2 style={{ fontSize: 17 }}>Household</h2>
        </div>
      </div>

      {/* Resident block */}
      <div className="role-swap" data-role="resident">
        <div className="prof-head">
          <div className="avatar">{residentInitials}</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15.5 }}>{residentName}</div>
            <div className="muted small">
              Household #{user?.household || '142'} · {user?.purok || 'Purok 3'}
            </div>
          </div>
        </div>
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="list-item">
            <span>Family members</span>
            <span className="val">{user?.householdSize || 4}</span>
          </div>
          <div className="list-item">
            <span>Emergency contact</span>
            <span className="val">{user?.emergencyContact || '0917 xxx xx42'}</span>
          </div>
          <div className="list-item">
            <span>Address</span>
            <span className="val">{user?.address || 'Purok 3, Blk 6'}</span>
          </div>
        </div>
      </div>

      {/* Official block */}
      <div className="role-swap" data-role="official">
        <div className="prof-head">
          <div className="avatar">{officialInitials}</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15.5 }}>{officialName}</div>
            <div className="muted small">
              Disaster risk reduction · {user?.purok || 'Purok 3'}
            </div>
          </div>
        </div>
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="list-item">
            <span>Position</span>
            <span className="val">{user?.position || 'Kagawad'}</span>
          </div>
          <div className="list-item">
            <span>Assigned zone</span>
            <span className="val">{user?.zone || user?.purok || 'Purok 3'}</span>
          </div>
          <div className="list-item">
            <span>Office contact</span>
            <span className="val">{user?.officeContact || '0917 500 1042'}</span>
          </div>
          <div className="list-item">
            <span>Permissions</span>
            <span className="val">{permLabels.length ? permLabels.join(', ') : 'None'}</span>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div
          className="list-item"
          onClick={() => navigate('/directory')}
          style={{ cursor: 'pointer' }}
        >
          <span>Barangay hotlines</span>
          <span className="val">›</span>
        </div>
        <div
          className="list-item role-swap"
          data-role="resident"
          onClick={() => navigate('/edit-profile')}
          style={{ cursor: 'pointer' }}
        >
          <span>Edit household info</span>
          <span className="val">›</span>
        </div>
      </div>

      {/* Settings */}
      <div className="section-label" style={{ marginTop: 4 }}>
        <h3>Settings</h3>
      </div>
      <div className="card">
        {isOfficial && perms.announce && (
          <div
            className="list-item role-swap"
            data-role="official"
            onClick={() => navigate('/announcements')}
            style={{ cursor: 'pointer' }}
          >
            <span>Manage announcements</span>
            <span className="val">›</span>
          </div>
        )}
        {isOfficial && perms.evac && (
          <div
            className="list-item role-swap"
            data-role="official"
            onClick={() => navigate('/map')}
            style={{ cursor: 'pointer' }}
          >
            <span>Manage evacuation centers</span>
            <span className="val">›</span>
          </div>
        )}
        <div className="list-item" onClick={() => cycleTheme?.()} style={{ cursor: 'pointer' }}>
          <span>Appearance</span>
          <span className="val">{THEME_LABEL[theme] || 'System'}</span>
        </div>
        <div
          className="list-item"
          onClick={() => showToast?.('Notification settings would open here')}
          style={{ cursor: 'pointer' }}
        >
          <span>Alert notifications</span>
          <span className="val">On</span>
        </div>
        <div
          className="list-item"
          onClick={() => showToast?.('Language settings would open here')}
          style={{ cursor: 'pointer' }}
        >
          <span>Language</span>
          <span className="val">Filipino / English</span>
        </div>
        <div className="list-item" onClick={handleLogout} style={{ cursor: 'pointer' }}>
          <span>Log out</span>
          <span className="val">›</span>
        </div>
      </div>
    </section>
  );
}
