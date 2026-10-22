import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/app-context';
import { HomeIcon, BoardIcon, MapIcon, CheckinIcon, AnnounceIcon, ProfileIcon, LogoutIcon } from './icons';
import Brand from './Brand';

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
        <div className="side-house">
          <span className="av">{user.initials}</span>
          <div className="side-house-info">
            <div className="nm">{user.name}</div>
            <div className="hh">
              {user.role === 'resident' ? `Household ${user.household}` : user.position}
            </div>
          </div>
          <button className="side-logout" onClick={handleLogout} aria-label="Log out">
            <LogoutIcon />
          </button>
        </div>
      </div>

      <style>{`
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
          position: relative;
          transition: all 0.2s var(--ease);
        }
        .side-link svg {
          width: 19px;
          height: 19px;
          flex-shrink: 0;
          transition: transform 0.24s var(--ease);
        }
        .side-link:hover {
          background: var(--surface-alt);
          color: var(--ink);
          transform: translateX(3px);
        }
        .side-link:hover svg {
          transform: scale(1.14);
        }
        .side-link.active {
          background: var(--grad-primary);
          color: var(--on-strong);
          box-shadow: 0 8px 20px -8px rgba(21,35,61,0.75);
        }
        .side-link.active::before {
          content: "";
          position: absolute;
          left: -16px;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 22px;
          border-radius: 0 999px 999px 0;
          background: var(--grad-accent);
        }
        .side-link.active svg {
          stroke: var(--accent-2);
        }
        .side-foot {
          margin-top: auto;
          padding-top: 14px;
          border-top: 1px solid var(--border);
        }
        .side-house {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 10px;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.2s var(--ease);
        }
        .side-house:hover {
          background: var(--surface-alt);
          transform: translateY(-2px);
        }
        .side-house-info { flex: 1; min-width: 0; }
        .side-logout {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          border: none;
          background: transparent;
          color: var(--ink-soft);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.2s var(--ease);
        }
        .side-logout svg { width: 17px; height: 17px; }
        .side-logout:hover {
          background: var(--danger-soft);
          color: var(--danger);
          transform: translateX(2px);
        }
        .side-house .av {
          width: 36px;
          height: 36px;
          border-radius: 12px;
          background: var(--grad-cool);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 13px;
          box-shadow: var(--glow-cool);
          flex-shrink: 0;
        }
        .side-house .nm {
          font-size: 12.5px;
          font-weight: 600;
        }
        .side-house .hh {
          font-size: 11px;
          color: var(--ink-soft);
        }
        .side-house-info { flex: 1; min-width: 0; }
        .side-logout {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          border: none;
          background: transparent;
          color: var(--ink-soft);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.2s var(--ease);
        }
        .side-logout svg { width: 17px; height: 17px; }
        .side-logout:hover {
          background: var(--danger-soft);
          color: var(--danger);
          transform: translateX(2px);
        }

        @media (min-width: 900px) {
          .sidebar {
            display: flex;
          }
        }
      `}</style>
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
        <div className="side-house">
          <span className="av">SA</span>
          <div className="side-house-info">
            <div className="nm">System admin</div>
            <div className="hh">Barangay San Isidro</div>
          </div>
          <button className="side-logout" onClick={handleLogout} aria-label="Log out">
            <LogoutIcon />
          </button>
        </div>
      </div>

      <style>{`
        .sidebar {
          width: 252px;
          flex-shrink: 0;
          background: linear-gradient(180deg, var(--surface) 0%, var(--surface-alt) 100%);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-right: 1px solid var(--border);
          display: flex;
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
        .side-link:hover {
          background: var(--surface-alt);
        }
        .side-link.active {
          background: var(--grad-primary);
          color: var(--on-strong);
          box-shadow: 0 4px 14px rgba(27,42,74,0.25);
        }
        .side-foot {
          margin-top: auto;
          padding-top: 14px;
          border-top: 1px solid var(--border);
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
        .side-house-info { flex: 1; min-width: 0; }
        .side-logout {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          border: none;
          background: transparent;
          color: var(--ink-soft);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.2s var(--ease);
        }
        .side-logout svg { width: 17px; height: 17px; }
        .side-logout:hover {
          background: var(--danger-soft);
          color: var(--danger);
          transform: translateX(2px);
        }
      `}</style>
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
    { to: '/announcements', icon: <AnnounceIcon />, label: 'Alerts' },
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
