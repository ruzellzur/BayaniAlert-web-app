import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/app-context';

export default function Checkin() {
  const navigate = useNavigate();
  const { user, households, myStatus, setStatus, updateHouseholdStatus } = useApp();
  const [filter, setFilter] = useState('all');

  const isOfficial = user?.role === 'official';
  const canRescue = user?.permissions?.rescue;

  // Stats
  const safeCount = households.filter(h => h.status === 'safe').length;
  const helpCount = households.filter(h => h.status === 'help').length;
  const noResponseCount = households.filter(h => h.status === 'none').length;
  const respondedCount = safeCount + helpCount;

  const filteredHouseholds = households.filter(h =>
    filter === 'all' || h.status === filter
  );

  const statColors = {
    safe: 'var(--grad-safe)',
    help: 'var(--grad-danger)',
    none: 'var(--ink-soft)'
  };

  const handleHouseholdClick = (index) => {
    if (canRescue) {
      const newStatus = prompt('Set status for Hh. ' + households[index].id + ' — type "safe", "help", or "none"', households[index].status);
      if (newStatus && ['safe', 'help', 'none'].includes(newStatus.trim().toLowerCase())) {
        updateHouseholdStatus(index, newStatus.trim().toLowerCase());
      }
    } else {
      const h = households[index];
      const label = h.status === 'help' ? 'needs help' : h.status === 'safe' ? 'checked in safe' : 'has not responded';
      alert('Hh. ' + h.id + ' — ' + label);
    }
  };

  return (
    <div className="screen-enter">
      {/* Topbar */}
      <div className="topbar">
        <div className="row" style={{ gap: 12 }}>
          <button className="btn-ghost btn btn-sm mobile-back" onClick={() => navigate('/home')} aria-label="Go back" style={{ padding: '8px 10px' }}>←</button>
          <h2 style={{ fontSize: 17 }}>Safety check-in</h2>
        </div>
      </div>

      {/* Resident View */}
      {!isOfficial && (
        <div className="card me-card">
          <div className="avatar">{user?.initials || 'RG'}</div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>
            {user?.name || 'Ruzel G.'} — Household #{user?.household || '142'}
          </div>
          <div className="me-status">
            <span className={`live-dot ${myStatus === 'none' ? 'is-idle' : ''}`} aria-hidden="true" />
            {myStatus === 'safe' ? 'Marked safe' : myStatus === 'help' ? 'Help requested' : "Not checked in for tonight's advisory"}
          </div>
          <div className="status-btns">
            <button className="btn btn-safe" onClick={() => setStatus('safe')}>I'm safe</button>
            <button className="btn btn-danger" onClick={() => setStatus('help')}>Need help</button>
          </div>
        </div>
      )}

      {/* Official View */}
      {isOfficial && (
        <div className="card">
          <div className="row between">
            <span style={{ fontWeight: 600, fontSize: 14 }}>Purok 3 check-in status</span>
            <span className="small muted">{respondedCount} / {households.length} responded</span>
          </div>
          <div className="cap-bar" style={{ marginTop: 10 }}>
            <div className="cap-fill" style={{ width: `${(respondedCount / households.length) * 100}%` }}></div>
          </div>
          <div className="stat-trio">
            <div>
              <div className="n" style={{ color: 'var(--safe)' }}>{safeCount}</div>
              <div className="l">Safe</div>
            </div>
            <div>
              <div className="n" style={{ color: 'var(--danger)' }}>{helpCount}</div>
              <div className="l">Need help</div>
            </div>
            <div>
              <div className="n" style={{ color: 'var(--ink-soft)' }}>{noResponseCount}</div>
              <div className="l">No response</div>
            </div>
          </div>
        </div>
      )}

      {/* Household Grid */}
      <div className="section-label">
        <h3>Purok 3 households</h3>
        <span className="muted small">{respondedCount} of {households.length} checked in</span>
      </div>

      <div className="chip-row filter-chips" style={{ marginBottom: 10 }}>
        {['all', 'safe', 'help', 'none'].map((f) => (
          <span
            key={f}
            className={`chip ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : f === 'help' ? 'Needs help' : f === 'none' ? 'No response' : 'Safe'}
          </span>
        ))}
      </div>

      <div className="card">
        <div className="house-grid">
          {filteredHouseholds.length === 0 ? (
            <div className="empty-state" style={{ gridColumn: '1/-1' }}>
              <span className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 21V9l9-6 9 6v12"/>
                  <path d="M9 21v-6h6v6"/>
                </svg>
              </span>
              <h4>No households here</h4>
              <p>No households in Purok 3 match this filter right now.</p>
            </div>
          ) : (
            filteredHouseholds.map((h) => (
              <div
                key={h.id}
                className={`house ${h.status === 'none' ? 'is-none' : ''}`}
                onClick={() => handleHouseholdClick(households.indexOf(h))}
              >
                <div className="dot" style={{ background: statColors[h.status] || statColors.safe }}>
                  {h.initials}
                </div>
                <div className="nm">Hh. {h.id}</div>
              </div>
            ))
          )}
        </div>
      </div>

      <p className="demo-note">
        {canRescue
          ? 'You can tap a household to update its status directly — for rescue/response duty.'
          : isOfficial
            ? 'Your position can view but not update other households\' check-in status. A BDRRM Officer or Rescue Team member can update directly.'
            : `${user?.officialName || 'Kagawad Reyes'} can see this board live to know who may need assistance.`
        }
      </p>

      <style>{`
        .me-card {
          text-align: center;
          padding: 26px 18px;
          background:
            radial-gradient(120% 90% at 50% -20%, var(--accent-soft), transparent 60%),
            var(--surface);
        }
        .me-card .avatar {
          width: 66px;
          height: 66px;
          border-radius: 50%;
          margin: 0 auto 14px;
          background: var(--grad-primary);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 23px;
          box-shadow: 0 10px 24px -8px rgba(21,35,61,0.6);
          animation: floaty 5s ease-in-out infinite;
        }
        .me-status {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--ink-soft);
          margin-top: 6px;
          background: var(--surface-alt);
          padding: 7px 14px;
          border-radius: 999px;
        }
        .status-btns {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }
        .status-btns .btn { flex: 1; }

        .house-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-top: 4px;
        }
        .house .dot {
          position: relative;
          transition: transform 0.2s var(--ease);
        }
        .house .dot::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 2px solid currentColor;
          opacity: 0;
          animation: pulseRing 2.6s ease-out infinite;
        }
        .house.is-none .dot::after { opacity: 0.5; }

        .filter-chips { justify-content: center; }
        @media (min-width: 560px) {
          .house-grid { grid-template-columns: repeat(auto-fill, minmax(72px, 1fr)); }
        }
        @media (min-width: 900px) {
          .house-grid { grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 16px; }
        }

      `}</style>
    </div>
  );
}
