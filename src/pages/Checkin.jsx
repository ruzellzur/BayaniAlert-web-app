import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button, Card, Chip, Tag } from '../components/ui';
import { PageContainer, Section } from '../components/layout/PageContainer';
import Brand from '../components/Brand';

/**
 * Safety Check-in Page
 *
 * Modern design-system UI on top of the ORIGINAL functionality — nothing removed:
 * - Resident: current status, "I'm safe" / "Need help", household number tip
 * - Official: stats trio, response progress bar, household grid
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
    none: 'var(--surface-alt)',
  };

  const handleStatusChange = (status) => {
    setStatus(status);
  };

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

  const filterOptions = [
    { id: 'all', label: 'All' },
    { id: 'safe', label: 'Safe' },
    { id: 'help', label: 'Needs help' },
    { id: 'none', label: 'No response' },
  ];

  return (
    <PageContainer variant="dashboard" className="checkin-page">
      {/* Topbar */}
      <div className="topbar">
        <div className="topbar-left">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/home')}
            aria-label="Go back"
          >
            ←
          </Button>
          <Brand />
        </div>
        <div className="topbar-right">
          {isOfficial && (
            <span className="purok-pill">Purok 3</span>
          )}
        </div>
      </div>

      {isOfficial ? (
        /* Official View - Household Check-in Board */
        <>
          {/* Stats */}
          <div className="stat-grid">
            <Card padding="md" style={{ textAlign: 'center' }}>
              <div className="stat-n" style={{ color: 'var(--safe)' }}>
                {safeCount}
              </div>
              <div className="stat-l">Safe</div>
            </Card>
            <Card padding="md" style={{ textAlign: 'center' }}>
              <div className="stat-n" style={{ color: 'var(--danger)' }}>
                {helpCount}
              </div>
              <div className="stat-l">Need Help</div>
            </Card>
            <Card padding="md" style={{ textAlign: 'center' }}>
              <div className="stat-n" style={{ color: 'var(--ink-soft)' }}>
                {noResponseCount}
              </div>
              <div className="stat-l">No Response</div>
            </Card>
          </div>

          {/* Response Progress */}
          <Section title="Response Progress">
            <Card padding="md">
              <div className="progress-head">
                <span className="progress-label">
                  {respondedCount} / {households.length} households responded
                </span>
              </div>
              <div className="cap-bar">
                <div
                  className="cap-fill"
                  style={{
                    width: `${(respondedCount / households.length) * 100}%`,
                  }}
                />
              </div>
            </Card>
          </Section>

          {/* Household Grid + filters */}
          <Section title="Purok 3 households">
            <div className="house-section">
              <div className="section-sub">
                {respondedCount} of {households.length} checked in
              </div>

              <div className="chip-row">
                {filterOptions.map((f) => (
                  <Chip
                    key={f.id}
                    active={filter === f.id}
                    onClick={() => setFilter(f.id)}
                  >
                    {f.label}
                  </Chip>
                ))}
              </div>

              <div className="house-grid">
                {filteredHouseholds.length === 0 ? (
                  <p className="empty-note">No households match this filter.</p>
                ) : (
                  filteredHouseholds.map((household) => (
                    <button
                      key={household.id}
                      className="house"
                      onClick={() =>
                        handleHouseholdClick(households.indexOf(household))
                      }
                      aria-label={`Household ${household.id}`}
                    >
                      <span
                        className="dot"
                        style={{
                          background:
                            statColors[household.status] || statColors.none,
                          color:
                            household.status === 'none' || !household.status
                              ? 'var(--ink-soft)'
                              : '#fff',
                        }}
                      >
                        {household.initials}
                      </span>
                      <span className="nm">Hh. {household.id}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </Section>

          <p className="demo-note">
            {canRescue
              ? 'You can tap a household to update its status directly — for rescue/response duty.'
              : "Your position can view but not update other households' check-in status. A BDRRM Officer or Rescue Team member can update directly."}
          </p>
        </>
      ) : (
        /* Resident View - Personal Check-in */
        <>
          {/* Current Status */}
          <div className="resident-block">
            <Card padding="lg" style={{ textAlign: 'center' }}>
              <div className="me-avatar">{user?.initials || 'RG'}</div>
              <div className="me-name">
                {user?.name || 'Ruzel G.'} — Household #{user?.household || '142'}
              </div>
              <h3 className="me-heading">Your Current Status</h3>
              {myStatus ? (
                <>
                  <Tag
                    variant={myStatus === 'safe' ? 'accepted' : 'declined'}
                    style={{ fontSize: 'var(--text-md)', padding: '8px 16px' }}
                  >
                    {myStatus === 'safe' ? '✓ Marked Safe' : '⚠ Needs Help'}
                  </Tag>
                  <p className="me-meta">
                    Status recorded at {new Date().toLocaleTimeString()}
                  </p>
                </>
              ) : (
                <p className="me-meta">
                  Not checked in for tonight's advisory
                </p>
              )}
            </Card>
          </div>

          {/* Check-in Buttons */}
          <Section title="Update Your Status">
            <div className="status-grid">
              <Card
                interactive
                onClick={() => handleStatusChange('safe')}
                padding="lg"
                style={{
                  textAlign: 'center',
                  background: myStatus === 'safe' ? 'var(--safe-bg)' : 'var(--surface)',
                  border: myStatus === 'safe' ? '2px solid var(--safe)' : undefined,
                }}
              >
                <div className="status-ic safe">✓</div>
                <h4 className="status-title">I'm Safe</h4>
                <p className="status-sub">Let others know you're okay</p>
              </Card>

              <Card
                interactive
                onClick={() => handleStatusChange('help')}
                padding="lg"
                style={{
                  textAlign: 'center',
                  background: myStatus === 'help' ? 'var(--danger-bg)' : 'var(--surface)',
                  border: myStatus === 'help' ? '2px solid var(--danger)' : undefined,
                }}
              >
                <div className="status-ic help">⚠</div>
                <h4 className="status-title">Need Help</h4>
                <p className="status-sub">Officials will be notified</p>
              </Card>
            </div>
          </Section>

          {/* Info */}
          <div className="resident-tip">
            <Card
              padding="md"
              style={{
                background: 'var(--surface-alt)',
                border: '1px solid var(--border)',
              }}
            >
              <p className="tip-text">
                💡 <strong>Tip:</strong> Check in regularly during emergencies to keep
                officials updated on your status. Your household number is{' '}
                <strong>{user?.household || '#142'}</strong>.
              </p>
            </Card>
          </div>

          <p className="demo-note">
            {user?.officialName || 'Kagawad Reyes'} can see this board live to know who
            may need assistance.
          </p>
        </>
      )}

      <style>{`
        .checkin-page {
          padding-bottom: 100px;
        }

        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-3);
          padding: var(--space-5) var(--space-5) var(--space-4);
          background: var(--bg);
          position: sticky;
          top: 0;
          z-index: var(--z-sticky);
        }

        .topbar-left {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .topbar-right {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .purok-pill {
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--ink-soft);
          background: var(--surface);
          border: 1px solid var(--border);
          padding: 6px 10px;
          border-radius: var(--radius-full);
          white-space: nowrap;
        }

        .stat-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-3);
          padding: 0 var(--space-5);
          margin-bottom: var(--space-5);
        }

        .stat-n {
          font-size: var(--text-3xl);
          font-weight: 600;
          font-family: var(--font-display);
        }

        .stat-l {
          font-size: var(--text-sm);
          color: var(--ink-soft);
          margin-top: var(--space-1);
        }

        .progress-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-3);
        }

        .progress-label {
          font-size: var(--text-base);
          font-weight: 600;
        }

        .cap-bar {
          height: 9px;
          border-radius: 999px;
          background: var(--surface-alt);
          overflow: hidden;
          box-shadow: inset 0 1px 3px rgba(0,0,0,0.10);
        }

        .cap-fill {
          height: 100%;
          border-radius: 999px;
          background: var(--grad-safe);
          transition: width var(--duration-base) var(--ease-out);
        }

        .house-section {
          padding: 0 var(--space-5);
        }

        .section-sub {
          font-size: var(--text-xs);
          color: var(--ink-soft);
          margin-bottom: var(--space-3);
        }

        .chip-row {
          display: flex;
          gap: var(--space-2);
          overflow-x: auto;
          padding-bottom: var(--space-2);
          margin-bottom: var(--space-3);
          scrollbar-width: none;
        }

        .chip-row::-webkit-scrollbar {
          display: none;
        }

        .chip-row > * {
          flex-shrink: 0;
        }

        .house-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-3);
        }

        .house {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-2);
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          font-family: inherit;
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
          font-size: var(--text-md);
          transition: transform var(--duration-fast) var(--ease-out);
        }

        .house:hover .dot {
          transform: scale(1.06);
        }

        .house .nm {
          font-size: var(--text-xs);
          text-align: center;
          color: var(--ink-soft);
          font-weight: 600;
          line-height: 1.2;
        }

        .empty-note {
          grid-column: 1 / -1;
          text-align: center;
          padding: var(--space-3) 0;
          font-size: var(--text-sm);
          color: var(--ink-soft);
          margin: 0;
        }

        .demo-note {
          font-size: var(--text-xs);
          color: var(--ink-soft);
          text-align: center;
          margin: var(--space-4) var(--space-5) 0;
          line-height: 1.5;
        }

        .resident-block {
          padding: 0 var(--space-5);
          margin-bottom: var(--space-5);
        }

        .me-avatar {
          width: 58px;
          height: 58px;
          border-radius: 50%;
          margin: 0 auto var(--space-3);
          background: var(--grad-primary);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-weight: 600;
          font-size: var(--text-xl);
          box-shadow: var(--elevation-2);
        }

        .me-name {
          font-weight: 600;
          font-size: var(--text-md);
        }

        .me-heading {
          margin: var(--space-4) 0 var(--space-2);
          font-size: var(--text-lg);
          font-weight: 600;
        }

        .me-meta {
          margin: var(--space-3) 0 0;
          font-size: var(--text-sm);
          color: var(--ink-soft);
        }

        .status-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-4);
          padding: 0 var(--space-5);
        }

        .status-ic {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto var(--space-3);
          font-size: 28px;
          color: #fff;
        }

        .status-ic.safe {
          background: var(--grad-safe);
        }

        .status-ic.help {
          background: var(--grad-danger);
        }

        .status-title {
          margin: 0 0 var(--space-2);
          font-size: var(--text-lg);
          font-weight: 600;
        }

        .status-sub {
          margin: 0;
          font-size: var(--text-sm);
          color: var(--ink-soft);
        }

        .resident-tip {
          padding: var(--space-5);
          margin-top: var(--space-4);
        }

        .tip-text {
          margin: 0;
          font-size: var(--text-sm);
          color: var(--ink-soft);
          line-height: 1.5;
        }

        @media (min-width: 900px) {
          .topbar {
            padding: var(--space-6) 44px var(--space-5);
          }

          .topbar .brand {
            display: none;
          }

          .stat-grid,
          .house-section {
            padding-left: 44px;
            padding-right: 44px;
          }

          .house-grid {
            grid-template-columns: repeat(8, 1fr);
          }
        }
      `}</style>
    </PageContainer>
  );
}
