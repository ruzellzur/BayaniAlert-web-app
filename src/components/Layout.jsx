import { Outlet } from 'react-router-dom';
import { useApp } from '../context/AppContext';
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
        }

        .toast {
          position: absolute;
          left: 20px;
          right: 20px;
          bottom: 96px;
          background: var(--strong);
          color: var(--on-strong);
          padding: 13px 16px;
          border-radius: 14px;
          font-size: 13px;
          font-weight: 600;
          text-align: center;
          transform: translateY(20px);
          opacity: 0;
          pointer-events: none;
          transition: all 0.25s ease;
          box-shadow: 0 10px 24px rgba(0,0,0,0.25);
          z-index: 30;
        }
        .toast.show {
          transform: translateY(0);
          opacity: 1;
        }

        @media (min-width: 900px) {
          body.authed .toast {
            position: fixed;
            left: calc(252px + 44px);
            right: auto;
            width: 340px;
            bottom: 34px;
          }
        }

        /* Screens */
        .screen {
          display: none;
          flex: 1;
          flex-direction: column;
          padding: 2px 20px 100px;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }
        .screen.active {
          display: flex;
          animation: screenFade 0.18s ease;
        }
        .screen > * {
          flex-shrink: 0;
        }
        @keyframes screenFade {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .screen-enter {
          display: flex;
          flex: 1;
          flex-direction: column;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }
        .screen-enter > * {
          flex-shrink: 0;
        }

        /* Common elements */
        .section-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 22px 0 10px;
        }
        .section-label h3 {
          font-size: 15px;
          font-weight: 600;
        }
        .section-label a {
          font-size: 12.5px;
          font-weight: 600;
          color: var(--ink-soft);
          cursor: pointer;
        }

        .alert-card {
          border-radius: 20px;
          padding: 18px;
          color: #fff;
          background: var(--grad-primary);
          box-shadow: var(--shadow);
          position: relative;
          overflow: hidden;
        }
        .alert-card::after {
          content: "";
          position: absolute;
          right: -30px;
          top: -30px;
          width: 140px;
          height: 140px;
          background: radial-gradient(circle, rgba(226,154,59,0.35), transparent 70%);
        }
        .alert-card::before {
          content: "";
          position: absolute;
          left: -20px;
          bottom: -40px;
          width: 120px;
          height: 120px;
          background: radial-gradient(circle, rgba(110,143,199,0.28), transparent 70%);
        }
        .alert-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .signal-badge {
          background: var(--grad-accent);
          color: var(--accent-ink);
          font-weight: 700;
          font-size: 12.5px;
          padding: 6px 11px;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(226,154,59,0.35);
        }
        .alert-card h3 {
          color: #fff;
          font-size: 19px;
          margin-top: 12px;
          font-weight: 600;
        }
        .alert-meta {
          display: flex;
          gap: 16px;
          margin-top: 14px;
        }
        .alert-meta div {
          font-size: 11px;
          color: #B9C4DA;
        }
        .alert-meta strong {
          display: block;
          font-size: 15px;
          color: #fff;
          font-weight: 600;
          margin-top: 2px;
        }

        .cap-bar {
          height: 9px;
          border-radius: 999px;
          background: var(--surface-alt);
          overflow: hidden;
          margin-top: 10px;
          box-shadow: inset 0 1px 3px rgba(0,0,0,0.10);
        }
        .cap-fill {
          height: 100%;
          border-radius: 999px;
          background: var(--grad-safe);
        }

        .chip-row {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 4px;
          margin-bottom: 14px;
        }
        .chip-row::-webkit-scrollbar {
          display: none;
        }
        .chip {
          border: 1.5px solid var(--border);
          background: var(--surface);
          color: var(--ink-soft);
          font-size: 12.5px;
          font-weight: 600;
          padding: 7px 13px;
          border-radius: 999px;
          cursor: pointer;
          white-space: nowrap;
        }
        .chip.active {
          background: var(--grad-primary);
          color: var(--on-strong);
          border-color: transparent;
        }

        .stack {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .between {
          justify-content: space-between;
        }
        .muted {
          color: var(--ink-soft);
        }
        .small {
          font-size: 12.5px;
        }
        .tag {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11.5px;
          font-weight: 600;
          padding: 4px 9px;
          border-radius: 999px;
        }

        textarea.compose {
          width: 100%;
          border: 1.5px solid var(--border);
          border-radius: 14px;
          padding: 12px;
          font-family: var(--font-body);
          font-size: 13.5px;
          resize: none;
          background: var(--surface);
          color: var(--ink);
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 14px;
        }
        .field.full {
          grid-column: 1 / -1;
        }
        .field label {
          font-size: 12px;
          font-weight: 600;
          color: var(--ink-soft);
        }
        .field input,
        .field select {
          border: 1.5px solid var(--border);
          border-radius: 12px;
          padding: 11px 13px;
          font-family: var(--font-body);
          font-size: 13.5px;
          background: var(--surface);
          color: var(--ink);
          width: 100%;
        }
        .field input:focus,
        .field select:focus {
          outline: 2px solid var(--accent);
          outline-offset: 1px;
        }
        .field input.field-error,
        .field select.field-error {
          border-color: var(--danger) !important;
          animation: fieldShake 0.32s ease;
        }
        @keyframes fieldShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .error-text {
          font-size: 11px;
          color: var(--danger);
          font-weight: 600;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
        }

        .auth-switch {
          text-align: center;
          font-size: 13px;
          color: var(--ink-soft);
          margin-top: 10px;
        }
        .auth-switch a {
          color: var(--ink);
          font-weight: 600;
          cursor: pointer;
          text-decoration: underline;
        }

        @media (min-width: 900px) {
          .form-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </div>
  );
}
