import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HomeIcon, BoardIcon, MapIcon, CheckinIcon, AnnounceIcon, ProfileIcon, LogoutIcon } from './icons';
import Brand from './Brand';
import { useMessages } from '../context/MessagesContext';

// Same stroke style as the other nav icons. Swap for one in ./icons if you add it there.
const InboxIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />
  </svg>
);

const NavBadge = ({ count }) =>
  count > 0 ? <span className="nav-badge">{count > 99 ? '99+' : count}</span> : null;

// Shared by Sidebar and AdminSidebar (the admin copy used to be missing the
// display:none, so it showed on phones too).
const SIDEBAR_CSS = `
  .sidebar {
    display: none;
    width: 252px;
    flex-shrink: 0;
    background: linear-gradient(180deg, var(--surface) 0%, var(--surface-alt) 100%);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-right: 1px solid var(--border);
    flex-direction: column;
    padding: 22px 16px 18px;
    position: sticky;
    top: 0;
    height: 100vh;
  }
  .side-brand {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 6px 10px 22px;
  }
  .side-brand .word {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 19px;
  }
  .side-brand .word em {
    font-style: italic;
    color: var(--accent);
  }
  .side-nav {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin-top: 6px;
  }
  .side-link {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 11px 12px;
    border-radius: 12px;
    color: var(--ink-soft);
    font-weight: 600;
    font-size: 13.5px;
    cursor: pointer;
    border: none;
    background: none;
    text-align: left;
    width: 100%;
    text-decoration: none;
  }
  .side-link svg {
    width: 19px;
    height: 19px;
    flex-shrink: 0;
  }
  .side-link .nav-badge {
    margin-left: auto;
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    border-radius: 999px;
    background: var(--danger);
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .side-link:hover {
    background: var(--surface-alt);
  }
  .side-link.active {
    background: var(--grad-primary);
    color: var(--on-strong);
    box-shadow: 0 4px 14px rgba(27,42,74,0.25);
  }
  .side-link.active svg {
    stroke: var(--accent);
  }
  .side-foot {
    margin-top: auto;
    padding-top: 14px;
    border-top: 1px solid var(--border);
  }
  .side-foot .side-link {
    margin-top: 6px;
  }
  .side-house {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border-radius: 12px;
  }
  .side-house:hover {
    background: var(--surface-alt);
  }
  .side-house .av {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    background: var(--grad-cool);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 13px;
  }
  .side-house .nm {
    font-size: 12.5px;
    font-weight: 600;
  }
  .side-house .hh {
    font-size: 11px;
    color: var(--ink-soft);
  }

  @media (min-width: 900px) {
    .sidebar {
      display: flex;
    }
  }
`;

const TABBAR_CSS = `
  .tabbar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: space-around;
    align-items: stretch;
    background: var(--surface);
    border-top: 1px solid var(--border);
    padding: 8px 6px calc(10px + env(safe-area-inset-bottom, 0px));
    z-index: 50;
  }
  .tab {
    background: none;
    border: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    color: var(--ink-soft);
    font-size: 10.5px;
    font-weight: 600;
    padding: 6px 4px;
    border-radius: 10px;
    cursor: pointer;
    flex: 1;
    text-decoration: none;
    position: relative;
  }
  .tab .nav-badge {
    position: absolute;
    top: 0;
    left: calc(50% + 4px);
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    border-radius: 999px;
    background: var(--danger);
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .tab svg {
    width: 21px;
    height: 21px;
  }
  .tab.active {
    background: linear-gradient(180deg, rgba(226,154,59,0.14), transparent);
    color: var(--accent);
  }
  .tab.active svg {
    stroke: var(--accent);
  }

  @media (min-width: 900px) {
    .tabbar {
      display: none !important;
    }
  }
`;

// Confirm, end the real Supabase session, then go to the welcome page.
function useLogout() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  return async () => {
    if (!confirm('Log out of BayaniAlert?')) return;
    await signOut();
    navigate('/', { replace: true });
  };
}

export function Sidebar() {
  const { user } = useAuth();
  const { unreadCount } = useMessages();
  const navigate = useNavigate();
  const handleLogout = useLogout();

  if (!user || user.role === 'admin') return null;

  const navItems = [
    { to: '/home', icon: <HomeIcon />, label: 'Home' },
    { to: '/board', icon: <BoardIcon />, label: 'Resource board' },
    { to: '/messages', icon: <InboxIcon />, label: 'Messages', badge: unreadCount },
    { to: '/map', icon: <MapIcon />, label: 'Map' },
    { to: '/checkin', icon: <CheckinIcon />, label: 'Safety check-in' },
    { to: '/announcements', icon: <AnnounceIcon />, label: 'Announcements' },
    { to: '/profile', icon: <ProfileIcon />, label: user.role === 'resident' ? 'Household' : 'My profile' },
  ];

  const subtitle =
    user.role === 'resident'
      ? user.householdNo ? `Household #${user.householdNo}` : user.purokName || 'Resident'
      : user.position || 'Official';

  return (
    <aside className="sidebar">
      <div className="side-brand">
        <Brand />
      </div>
      <nav className="side-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            {item.label}
            <NavBadge count={item.badge} />
          </NavLink>
        ))}
      </nav>
      <div className="side-foot">
        <div className="side-house" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
          <span className="av">{user.initials}</span>
          <div>
            <div className="nm">{user.name}</div>
            <div className="hh">{subtitle}</div>
          </div>
        </div>
        <button className="side-link" onClick={handleLogout}>
          <LogoutIcon />
          Log out
        </button>
      </div>

      <style>{SIDEBAR_CSS}</style>
    </aside>
  );
}

export function AdminSidebar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const handleLogout = useLogout();

  if (!user || user.role !== 'admin') return null;

  const navItems = [
    { to: '/admin/approvals', icon: <CheckinIcon />, label: 'Approvals' },
    { to: '/admin/puroks', icon: <MapIcon />, label: 'Puroks / zones' },
    { to: '/admin/evac', icon: <BoardIcon />, label: 'Evacuation centers' },
  ];

  return (
    <aside className="sidebar">
      <div className="side-brand">
        <Brand />
      </div>
      <nav className="side-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="side-foot">
        <div className="side-house" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
          <span className="av">{user.initials || 'SA'}</span>
          <div>
            <div className="nm">{user.name || user.username || 'System admin'}</div>
            <div className="hh">Administrator</div>
          </div>
        </div>
        <button className="side-link" onClick={handleLogout}>
          <LogoutIcon />
          Log out
        </button>
      </div>

      <style>{SIDEBAR_CSS}</style>
    </aside>
  );
}

export function BottomNav() {
  const { user } = useAuth();
  const { unreadCount } = useMessages();

  if (!user || user.role === 'admin') return null;

  const navItems = [
    { to: '/home', icon: <HomeIcon />, label: 'Home' },
    { to: '/board', icon: <BoardIcon />, label: 'Board' },
    { to: '/messages', icon: <InboxIcon />, label: 'Inbox', badge: unreadCount },
    { to: '/map', icon: <MapIcon />, label: 'Map' },
    { to: '/checkin', icon: <CheckinIcon />, label: 'Check-in' },
    { to: '/announcements', icon: <AnnounceIcon />, label: 'Alerts' },
    // Profile (and log out) was unreachable on phones: Home hides its avatar below 900px.
    { to: '/profile', icon: <ProfileIcon />, label: 'Profile' },
  ];

  return (
    <nav className="tabbar">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}
        >
          {item.icon}
          {item.label}
          <NavBadge count={item.badge} />
        </NavLink>
      ))}

      <style>{TABBAR_CSS}</style>
    </nav>
  );
}

export function AdminBottomNav() {
  const { user } = useAuth();

  if (!user || user.role !== 'admin') return null;

  const navItems = [
    { to: '/admin/approvals', icon: <CheckinIcon />, label: 'Approvals' },
    { to: '/admin/puroks', icon: <MapIcon />, label: 'Puroks' },
    { to: '/admin/evac', icon: <BoardIcon />, label: 'Evac' },
    { to: '/profile', icon: <ProfileIcon />, label: 'Profile' }, // has the log out button
  ];

  return (
    <nav className="tabbar">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}
        >
          {item.icon}
          {item.label}
        </NavLink>
      ))}

      <style>{TABBAR_CSS}</style>
    </nav>
  );
}