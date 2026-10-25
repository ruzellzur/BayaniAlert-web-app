import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext'; // theme still lives in the mock

export default function Profile() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { cycleTheme, theme } = useApp();

  const isOfficial = user?.role === 'official';
  const isAdmin = user?.role === 'admin';
  const isResident = !isOfficial && !isAdmin;

  const perms = isOfficial ? user?.permissions : null;
  const canAnnounce = !!perms?.announce;
  const canEvac = !!perms?.evac;
  const canRescue = !!perms?.rescue;

  const themeLabels = { system: 'System', light: 'Light', dark: 'Dark' };

  const handleLogout = async () => {
    if (!confirm('Log out of BayaniAlert?')) return;
    await signOut();                       // ends the Supabase session, clears user
    navigate('/', { replace: true });
  };

  const subtitle = isAdmin
    ? 'System administrator'
    : isOfficial
      ? `${user?.position || 'Official'} · ${user?.purokName || 'All puroks'}`
      : [user?.purokName, user?.barangayName].filter(Boolean).join(' · ');
  
  
  const household = user?.household ?? null;
  const primaryContact = household?.emergency_contacts?.[0] ?? null;    

  useEffect(() => {
    if (user && user.role !== 'resident') navigate('/profile', { replace: true });
  }, [user, navigate]);

  return (
    <div className="screen-enter" style={{ padding: '2px 20px 100px' }}>
      {/* Topbar */}
      <div className="topbar">
        <div className="row" style={{ gap: 12 }}>
          <button className="btn-ghost btn btn-sm mobile-back" onClick={() => navigate(isAdmin ? '/admin/approvals' : '/home')} aria-label="Go back" style={{ padding: '8px 10px' }}>←</button>
          <h2 style={{ fontSize: 17 }}>My profile</h2>
        </div>
      </div>

      {/* Profile Header */}
      <div className="prof-head">
        <div className="avatar">{user?.initials}</div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15.5 }}>{user?.officialName || user?.name}</div>
          <div className="muted small">{subtitle}</div>
        </div>
      </div>

      {/* Info Card */}
      <div className="card" style={{ marginBottom: 16 }}>
        {isAdmin && (
          <>
            <div className="list-item">
              <span>Username</span>
              <span className="val">{user?.username || '—'}</span>
            </div>
            <div className="list-item">
              <span>Role</span>
              <span className="val">Administrator</span>
            </div>
          </>
        )}

        {isOfficial && (
          <>
            <div className="list-item">
              <span>Position</span>
              <span className="val">{user?.position || '—'}</span>
            </div>
            <div className="list-item">
              <span>Barangay</span>
              <span className="val">{user?.barangayName || '—'}</span>
            </div>
            <div className="list-item">
              <span>Assigned zone</span>
              <span className="val">{user?.purokName || 'All puroks'}</span>
            </div>
            <div className="list-item">
              <span>Mobile number</span>
              <span className="val">{user?.phone || '—'}</span>
            </div>
            <div className="list-item">
              <span>Permissions</span>
              <span className="val">
                {[
                  canAnnounce && 'Announcements',
                  canEvac && 'Evacuation centers',
                  canRescue && 'Check-in response',
                ].filter(Boolean).join(', ') || 'View only'}
              </span>
            </div>
          </>
        )}

        {isResident && (
          <>
            <div className="list-item">
              <span>Mobile number</span>
              <span className="val">{user?.phone || '—'}</span>
            </div>
            <div className="list-item">
              <span>Barangay</span>
              <span className="val">{user?.barangayName || '—'}</span>
            </div>
            <div className="list-item">
              <span>Purok</span>
              <span className="val">{user?.purokName || '—'}</span>
            </div>
            <div className="list-item">
              <span>Family members</span>
              <span className="val">{household?.members_count ?? '—'}</span>
            </div>
            <div className="list-item">
              <span>Emergency contact</span>
              <span className="val">
                {primaryContact ? `${primaryContact.name} · ${primaryContact.phone}` : '—'}
              </span>
            </div>
            <div className="list-item">
              <span>Address</span>
              <span className="val">{household?.address || '—'}</span>
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
        <div className="list-item" onClick={() => navigate('/edit-profile')} style={{ cursor: 'pointer' }}>
          <span>Edit profile</span>
          <span className="val">›</span>
        </div>
        {isResident && (
          <div className="list-item" onClick={() => navigate('/household-setup')} style={{ cursor: 'pointer' }}>
            <span>{user?.household ? 'Edit household' : 'Set up household'}</span>
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