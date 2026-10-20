import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

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
    <div className="screen-enter" style={{ padding: '2px 20px 100px' }}>
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
            {myStatus === 'safe' ? 'Marked safe' : myStatus === 'help' ? 'Help requested' : "Not checked in for tonight's advisory"}
          </div>
          <div className="status-btns">
            <button className="btn btn-safe" style={{ flex: 1 }} onClick={() => setStatus('safe')}>I'm safe</button>
            <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => setStatus('help')}>Need help</button>
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

      <div className="chip-row" style={{ marginBottom: 10 }}>
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
            <p className="small muted" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '10px 0' }}>No households match this filter.</p>
          ) : (
            filteredHouseholds.map((h, i) => (
              <div
                key={h.id}
                className="house"
                onClick={() => handleHouseholdClick(households.indexOf(h))}
                style={{ cursor: 'pointer' }}
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
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 18px 20px 14px;
        }
        .me-card {
          text-align: center;
          padding: 22px 16px;
        }
        .me-card .avatar {
          width: 58px;
          height: 58px;
          border-radius: 50%;
          margin: 0 auto 12px;
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
        .me-status {
          font-size: 13px;
          color: var(--ink-soft);
          margin-top: 4px;
        }
        .status-btns {
          display: flex;
          gap: 10px;
          margin-top: 18px;
        }
        .house-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-top: 4px;
        }
        .house {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }
        .house .dot {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 14px;
          color: #fff;
        }
        .house .nm {
          font-size: 10.5px;
          text-align: center;
          color: var(--ink-soft);
          font-weight: 600;
          line-height: 1.2;
        }
        .stat-trio {
          display: flex;
          gap: 22px;
          margin-top: 14px;
        }
        .stat-trio .n {
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 18px;
        }
        .stat-trio .l {
          font-size: 11px;
          color: var(--ink-soft);
          margin-top: 2px;
        }
        .demo-note {
          font-size: 11px;
          color: var(--ink-soft);
          text-align: center;
          margin-top: 16px;
          line-height: 1.5;
        }

        @media (min-width: 900px) {
          .topbar {
            padding: 26px 0 20px;
          }
          .house-grid {
            grid-template-columns: repeat(auto-fill, minmax(64px, 1fr));
          }
        }
      `}</style>
    </div>
  );
}
