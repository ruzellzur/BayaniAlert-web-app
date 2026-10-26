import { Outlet } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Sidebar, AdminSidebar, BottomNav, AdminBottomNav } from './Sidebar';

/**
 * Layout
 *
 * Renders the prototype's `.shell` → `.app` scaffold. All visual rules
 * (.shell, .app, .screen, .toast, .tabbar, .sidebar) come from
 * src/styles/prototype.css, which is imported after index.css in main.jsx.
 *
 * The `authed` / `role-official` body classes that gate the desktop layout
 * are toggled in main.jsx's AppRoutes().
 */
export default function Layout() {
  const { user, toast } = useApp();

  const isAdmin = user?.role === 'admin';
  const isAuthed = !!user;

  return (
    <div className="shell">
      {/* Desktop sidebar */}
      {isAuthed && !isAdmin && <Sidebar />}
      {isAuthed && isAdmin && <AdminSidebar />}

      {/* Main column */}
      <div className="app">
        <Outlet />

        {/* Toast (styling: .toast / .toast.show in prototype.css) */}
        {toast && <div className="toast">{toast}</div>}

        {/* Mobile bottom nav */}
        {isAuthed && !isAdmin && <BottomNav />}
        {isAuthed && isAdmin && <AdminBottomNav />}
      </div>
    </div>
  );
}
