import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { HomeIcon, BoardIcon, MapIcon, CheckinIcon, AnnounceIcon, ProfileIcon } from './icons';
import Brand from './Brand';

/**
 * Navigation components.
 *
 * All visual rules (.sidebar, .side-brand, .side-nav, .side-link,
 * .side-foot, .side-house, .tabbar, .tab) come from
 * src/styles/prototype.css, which is imported after index.css in main.jsx.
 *
 * The sidebar is hidden by default and revealed at >=900px by
 * `body.authed .sidebar{display:flex}`; the tabbar is the inverse
 * (`body.authed .tabbar{display:none !important}` at >=900px). Both body
 * classes are toggled in main.jsx's AppRoutes().
 */
export function Sidebar() {
  const { user, logout } = useApp();
  const navigate = useNavigate();

  if (!user || user.role === 'admin') return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { to: '/home', icon: <HomeIcon />, label: 'Home' },
    { to: '/board', icon: <BoardIcon />, label: 'Resource board' },
    { to: '/map', icon: <MapIcon />, label: 'Map' },
    { to: '/checkin', icon: <CheckinIcon />, label: 'Safety check-in' },
    { to: '/announcements', icon: <AnnounceIcon />, label: 'Announcements' },
    { to: '/profile', icon: <ProfileIcon />, label: user.role === 'resident' ? 'Household' : 'My profile' },
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
        <button
          type="button"
          className="side-house"
          onClick={handleLogout}
          aria-label={'Log out of ' + user.name}
        >
          <span className="av">{user.initials}</span>
          <div>
            <div className="nm">{user.name}</div>
            <div className="hh">
              {user.role === 'resident' ? `Household ${user.household}` : user.position}
            </div>
          </div>
        </button>
      </div>
    </aside>
  );
}

export function AdminSidebar() {
  const { user, logout } = useApp();
  const navigate = useNavigate();

  if (!user || user.role !== 'admin') return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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
        <button
          type="button"
          className="side-house"
          onClick={handleLogout}
          aria-label={'Log out of ' + (user.name || 'this account')}
        >
          <span className="av">{user.initials || 'SA'}</span>
          <div>
            <div className="nm">{user.name || 'System admin'}</div>
            <div className="hh">Tap to log out</div>
          </div>
        </button>
      </div>
    </aside>
  );
}

export function BottomNav() {
  const { user } = useApp();

  if (!user || user.role === 'admin') return null;

  const navItems = [
    { to: '/home', icon: <HomeIcon />, label: 'Home' },
    { to: '/board', icon: <BoardIcon />, label: 'Board' },
    { to: '/map', icon: <MapIcon />, label: 'Map' },
    { to: '/checkin', icon: <CheckinIcon />, label: 'Check-in' },
    { to: '/profile', icon: <ProfileIcon />, label: 'Me' },
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
    </nav>
  );
}

export function AdminBottomNav() {
  const { user } = useApp();

  if (!user || user.role !== 'admin') return null;

  const navItems = [
    { to: '/admin/approvals', icon: <CheckinIcon />, label: 'Approvals' },
    { to: '/admin/puroks', icon: <MapIcon />, label: 'Puroks' },
    { to: '/admin/evac', icon: <BoardIcon />, label: 'Evac' },
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
    </nav>
  );
}
