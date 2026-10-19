import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { HomeIcon, BoardIcon, MapIcon, CheckinIcon, AnnounceIcon, ProfileIcon, LogoutIcon } from './icons';

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
        <span className="word">Bayani<em>Alert</em></span>
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
        <div className="side-house" onClick={handleLogout} style={{ cursor: 'pointer' }}>
          <span className="av">{user.initials}</span>
          <div>
            <div className="nm">{user.name}</div>
            <div className="hh">
              {user.role === 'resident' ? `Household ${user.household}` : user.position}
            </div>
          </div>
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
        .side-link.active svg {
          stroke: var(--accent);
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
        <span className="word">Bayani<em>Alert</em></span>
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
        <div className="side-house" onClick={handleLogout} style={{ cursor: 'pointer' }}>
          <span className="av">SA</span>
          <div>
            <div className="nm">System admin</div>
            <div className="hh">Log out</div>
          </div>
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

      <style>{`
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
      `}</style>
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

      <style>{`
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
      `}</style>
    </nav>
  );
}
