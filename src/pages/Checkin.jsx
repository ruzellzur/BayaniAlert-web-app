import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

/**
 * Safety Check-in Page
 *
 * Markup matches the prototype's `#screen-checkin`:
 *   .topbar > .row (mobile-back + h2)
 *   .role-swap[data-role=resident] > .card.me-card
 *   .role-swap[data-role=official] > .card (cap-bar + .stat-trio)
 *   .section-label
 *   .chip-row#houseChipRow
 *   .card > .house-grid#houseGrid
 *   .demo-note
 *
 * All visual rules live in src/styles/prototype.css.
 *
 * Behavior preserved from the design-system version:
 * - Resident: current status, "I'm safe" / "Need help" buttons
 * - Official: stats, response progress bar, household grid
 * - Status filter chips (All / Safe / Needs help / No response)
 * - Permission gate: only positions with `permissions.rescue` may update another
 *   household's status (prompt); everyone else gets a read-only alert.
 * - Role-aware explainer note
 * - Back button to /home
 */
export default function Checkin() {
  const navigate = useNavigate();
  const { user, myStatus, setStatus, households, updateHouseholdStatus } = useApp();

  const [filter, setFilter] = useState('all');

  const isOfficial = user?.role === 'official';
  const canRescue = user?.permissions?.rescue;

  // Stats
  const safeCount = households.filter((h) => h.status === 'safe').length;
  const helpCount = households.filter((h) => h.status === 'help').length;
  const noResponseCount = households.filter(
    (h) => h.status === 'none' || !h.status
  ).length;
  const respondedCount = safeCount + helpCount;

  const filteredHouseholds = households.filter(
    (h) => filter === 'all' || h.status === filter
  );

  const statColors = {
    safe: 'var(--grad-safe)',
    help: 'var(--grad-danger)',
    none: 'var(--ink-soft)',
  };

  const filterOptions = [
    { id: 'all', label: 'All' },
    { id: 'safe', label: 'Safe' },
    { id: 'help', label: 'Needs help' },
    { id: 'none', label: 'No response' },
  ];

  const handleHouseholdClick = (index) => {
    if (canRescue) {
      const newStatus = prompt(
        'Set status for Hh. ' + households[index].id + ' — type "safe", "help", or "none"',
        households[index].status
      );
      if (newStatus && ['safe', 'help', 'none'].includes(newStatus.trim().toLowerCase())) {
        updateHouseholdStatus(index, newStatus.trim().toLowerCase());
      }
    } else {
      const h = households[index];
      const label =
        h.status === 'help'
          ? 'needs help'
          : h.status === 'safe'
          ? 'checked in safe'
          : 'has not responded';
      alert('Hh. ' + h.id + ' — ' + label);
    }
  };

  const meStatusText =
    myStatus === 'safe'
      ? 'Marked safe'
      : myStatus === 'help'
      ? 'Help requested'
      : "Not checked in for tonight's advisory";

  const meStatusColor =
    myStatus === 'safe' ? 'var(--safe)' : myStatus === 'help' ? 'var(--danger)' : undefined;

  return (
    <section className="screen active" id="screen-checkin">
      {/* Topbar */}
      <div className="topbar">
        <div className="row" style={{ gap: 12 }}>
          <button
            className="btn-ghost btn btn-sm mobile-back"
            onClick={() => navigate('/home')}
            aria-label="Go back"
            style={{ padding: '8px 10px' }}
          >
            ←
          </button>
          <h2 style={{ fontSize: 17 }}>Safety check-in</h2>
        </div>
      </div>

      {isOfficial ? (
        /* Official view */
        <div className="role-swap" data-role="official">
          <div className="card">
            <div className="row between">
              <span style={{ fontWeight: 600, fontSize: 14 }}>Purok 3 check-in status</span>
              <span className="small muted">
                {respondedCount} / {households.length} responded
              </span>
            </div>
            <div className="cap-bar" style={{ marginTop: 10 }}>
              <div
                className="cap-fill"
                style={{
                  width: `${households.length ? (respondedCount / households.length) * 100 : 0}%`,
                }}
              />
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
        </div>
      ) : (
        /* Resident view */
        <div className="role-swap" data-role="resident">
          <div className="card me-card">
            <div className="avatar">{user?.initials || 'RG'}</div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>
              {user?.name || 'Ruzel G.'} — Household #{user?.household || '142'}
            </div>
            <div className="me-status" style={{ color: meStatusColor }}>{meStatusText}</div>
            <div className="status-btns">
              <button
                className="btn btn-safe"
                style={{ flex: 1 }}
                onClick={() => setStatus('safe')}
              >
                I'm safe
              </button>
              <button
                className="btn btn-danger"
                style={{ flex: 1 }}
                onClick={() => setStatus('help')}
              >
                Need help
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="section-label">
        <h3>Purok 3 households</h3>
        <span className="muted small">
          {respondedCount} of {households.length} checked in
        </span>
      </div>

      <div className="chip-row" id="houseChipRow" style={{ marginBottom: 10 }}>
        {filterOptions.map((f) => (
          <span
            key={f.id}
            className={`chip ${filter === f.id ? 'active' : ''}`}
            data-hf={f.id}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </span>
        ))}
      </div>

      <div className="card">
        <div className="house-grid" id="houseGrid">
          {filteredHouseholds.length === 0 ? (
            <p
              className="small muted"
              style={{ gridColumn: '1/-1', textAlign: 'center', padding: '10px 0' }}
            >
              No households match this filter.
            </p>
          ) : (
            filteredHouseholds.map((household) => (
              <div
                key={household.id}
                className="house"
                onClick={() => handleHouseholdClick(households.indexOf(household))}
                style={{ cursor: 'pointer' }}
              >
                <div
                  className="dot"
                  style={{ background: statColors[household.status] || statColors.safe }}
                >
                  {household.initials}
                </div>
                <div className="nm">Hh. {household.id}</div>
              </div>
            ))
          )}
        </div>
      </div>

      <p className="demo-note">
        {canRescue
          ? 'You can tap a household to update its status directly — for rescue/response duty.'
          : 'Kagawad Reyes can see this board live to know who may need assistance.'}
      </p>
    </section>
  );
}
