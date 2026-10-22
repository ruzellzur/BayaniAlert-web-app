import { Outlet } from 'react-router-dom';
import { useApp } from '../context/app-context';
import { Sidebar, AdminSidebar, BottomNav, AdminBottomNav } from './Sidebar';

export default function Layout() {
  const { user, toast } = useApp();

  const isAdmin = user?.role === 'admin';
  const isAuthed = !!user;

  return (
    <div className="shell">
      {/* Desktop Sidebar */}
      {isAuthed && !isAdmin && <Sidebar />}
      {isAuthed && isAdmin && <AdminSidebar />}

      {/* Main Content */}
      <div className="app">
        <Outlet />

        {/* Toast Notification */}
        {toast && (
          <div className="toast show">{toast}</div>
        )}

        {/* Mobile Bottom Nav */}
        {isAuthed && !isAdmin && <BottomNav />}
        {isAuthed && isAdmin && <AdminBottomNav />}
      </div>

      <style>{`
        .shell {
          display: block;
          min-height: 100vh;
        }

        .shell.authenticated {
          display: flex;
          flex-direction: row;
        }

        .app {
          max-width: 480px;
          margin: 0 auto;
          height: 100vh;
          height: 100dvh;
          overflow: hidden;
          background: var(--bg);
          position: relative;
          display: flex;
          flex-direction: column;
        }

        body.authed .shell {
          display: flex;
          flex-direction: row;
        }

        body:not(.authed) .app {
          max-width: none;
          margin: 0;
          height: auto;
          min-height: 100vh;
          overflow: visible;
          border-radius: 0;
          box-shadow: none;
          border: none;
        }

        @media (min-width: 560px) {
          body:not(.desktop-mode) {
            background: var(--surface-alt);
          }
          .app {
            margin: 24px auto 40px;
            height: calc(100vh - 64px);
            height: calc(100dvh - 64px);
            border-radius: 32px;
            overflow: hidden;
            box-shadow: 0 30px 60px rgba(15,25,45,0.18);
            border: 1px solid var(--border);
          }
          body:not(.authed) .app {
            height: auto;
            min-height: 100vh;
          }
        }

        @media (min-width: 900px) {
          .shell {
            display: flex;
            align-items: stretch;
          }
          .app {
            flex: 1;
            min-width: 0;
          }
          body.authed .app {
            max-width: none;
            margin: 0;
            border-radius: 0;
            box-shadow: none;
            border: none;
            height: auto;
            min-height: 100vh;
            overflow: visible;
            flex: 1;
          }
          body.authed .screen,
          body.authed .screen-enter {
            overflow-y: visible;
            height: auto;
          }
          body.authed .screen-enter {
            max-width: 1080px;
            margin: 0 auto;
            padding: 10px 48px 80px;
          }
        }

        /* Toast */
        .toast {
          position: absolute;
          left: 20px;
          right: 20px;
          bottom: 96px;
          background: var(--grad-primary);
          color: var(--on-strong);
          padding: 14px 18px;
          border-radius: 16px;
          font-size: 13px;
          font-weight: 600;
          text-align: center;
          transform: translateY(20px) scale(0.96);
          opacity: 0;
          pointer-events: none;
          transition: all 0.28s cubic-bezier(0.22, 1, 0.36, 1);
          box-shadow: 0 18px 40px -12px rgba(15,25,45,0.55);
          border: 1px solid rgba(255,255,255,0.12);
          z-index: 30;
        }
        .toast.show {
          transform: translateY(0) scale(1);
          opacity: 1;
        }

        @media (min-width: 900px) {
          body.authed .toast {
            position: fixed;
            left: calc(252px + 48px);
            right: auto;
            width: 360px;
            bottom: 34px;
          }
        }
      `}</style>
    </div>
  );
}
