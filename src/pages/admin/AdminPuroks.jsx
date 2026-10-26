import { useEffect, useMemo, useState } from 'react';
import { usePuroks } from '../../context/PurokContext';

export default function AdminPuroks() {
  const { barangays, puroks, loading, error, addPurok, renamePurok, deletePurok } = usePuroks();

  const [barangayId, setBarangayId] = useState('');
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState(null);

  // Manage modal
  const [managing, setManaging] = useState(null); // purok being edited
  const [editName, setEditName] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [saving, setSaving] = useState(false);

  const [toast, setToast] = useState(null);
  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  };

  // Default to the first barangay once the list loads (admins have no barangay of their own).
  useEffect(() => {
    if (!barangayId && barangays.length > 0) setBarangayId(barangays[0].id);
  }, [barangays, barangayId]);

  const visible = useMemo(
    () => puroks.filter((p) => p.barangayId === barangayId),
    [puroks, barangayId]
  );
  const totalHouseholds = visible.reduce((sum, p) => sum + p.households, 0);
  const totalOfficials = visible.reduce((sum, p) => sum + p.officials, 0);

  // ---- add -------------------------------------------------------------------
  const handleAdd = async (e) => {
    e.preventDefault();
    setAdding(true);
    setAddError(null);
    const { error: err } = await addPurok(barangayId, newName);
    setAdding(false);
    if (err) {
      setAddError(err);
      return;
    }
    notify(`${newName.trim()} added`);
    setNewName('');
  };

  // ---- manage ------------------------------------------------------------------
  const openManage = (purok) => {
    setManaging(purok);
    setEditName(purok.name);
    setConfirmDelete(false);
    setModalError(null);
  };

  const closeManage = () => {
    setManaging(null);
    setConfirmDelete(false);
    setModalError(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (editName.trim() === managing.name) {
      closeManage();
      return;
    }
    setSaving(true);
    const { error: err } = await renamePurok(managing.id, editName);
    setSaving(false);
    if (err) {
      setModalError(err);
      return;
    }
    notify('Purok renamed');
    closeManage();
  };

  const handleDelete = async () => {
    setSaving(true);
    const { error: err } = await deletePurok(managing.id);
    setSaving(false);
    if (err) {
      setModalError(err);
      return;
    }
    notify(`${managing.name} removed`);
    closeManage();
  };

  const initialLoad = loading && barangays.length === 0;

  return (
    <div className="screen-enter" style={{ padding: '2px 20px 100px' }}>
      {/* Topbar */}
      <div className="topbar">
        <h2 style={{ fontSize: 20 }}>Puroks / Zones</h2>
      </div>

      <div className="screen-head">
        <p className="sub">Manage barangay zones and view statistics.</p>
      </div>

      {error && <div className="purok-error">{error}</div>}

      {initialLoad ? (
        <p className="small muted" style={{ textAlign: 'center', marginTop: 24 }}>Loading puroks…</p>
      ) : barangays.length === 0 ? (
        <div className="card">
          <p className="small muted" style={{ textAlign: 'center', padding: '16px 0' }}>
            No barangays yet. Add a barangay first.
          </p>
        </div>
      ) : (
        <>
          {/* Barangay picker */}
          <div className="field" style={{ marginBottom: 14 }}>
            <label htmlFor="purok-barangay" className="small muted">Barangay</label>
            <select
              id="purok-barangay"
              value={barangayId}
              onChange={(e) => setBarangayId(e.target.value)}
              style={{
                width: '100%',
                marginTop: 6,
                padding: '11px 14px',
                borderRadius: 12,
                border: '1.5px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--ink)',
                fontFamily: 'var(--font-body)',
                fontSize: '13.5px',
              }}
            >
              {barangays.map((b) => (
                <option key={b.id} value={b.id}>{b.name} · {b.city}</option>
              ))}
            </select>
          </div>

          {/* Summary */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="stat-trio">
              <div>
                <div className="n" style={{ color: 'var(--accent)' }}>{visible.length}</div>
                <div className="l">Puroks</div>
              </div>
              <div>
                <div className="n" style={{ color: 'var(--safe)' }}>{totalHouseholds}</div>
                <div className="l">Households</div>
              </div>
              <div>
                <div className="n" style={{ color: 'var(--cool)' }}>{totalOfficials}</div>
                <div className="l">Officials</div>
              </div>
            </div>
          </div>

          {/* Purok List */}
          <div className="card stack" style={{ gap: 0 }}>
            {visible.length === 0 ? (
              <p className="small muted" style={{ textAlign: 'center', padding: '16px 0' }}>
                No puroks in this barangay yet.
              </p>
            ) : (
              visible.map((purok) => (
                <div key={purok.id} className="list-item">
                  <div>
                    <div style={{ fontWeight: 600 }}>{purok.name}</div>
                    <div className="small muted" style={{ marginTop: 2 }}>
                      {purok.households} {purok.households === 1 ? 'household' : 'households'} · {purok.officials} {purok.officials === 1 ? 'official' : 'officials'}
                    </div>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => openManage(purok)}>Manage</button>
                </div>
              ))
            )}
          </div>

          {/* Add purok */}
          <form onSubmit={handleAdd} className="add-purok">
            <input
              type="text"
              placeholder="New purok name, e.g. Purok 5"
              value={newName}
              maxLength={40}
              onChange={(e) => setNewName(e.target.value)}
            />
            <button type="submit" className="btn btn-accent btn-sm" disabled={adding || !newName.trim()}>
              {adding ? 'Adding…' : 'Add purok'}
            </button>
          </form>
          {addError && <p className="error-text" style={{ marginTop: 8 }}>{addError}</p>}
        </>
      )}

      {toast && <div className="purok-toast" role="status">{toast}</div>}

      {/* Manage modal */}
      {managing && (
        <div className="modal-overlay" onClick={closeManage}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: 20, fontWeight: 600 }}>Manage purok</h2>
              <button className="modal-close" onClick={closeManage}>×</button>
            </div>

            <form onSubmit={handleSave} className="form-grid" style={{ padding: '0 0 20px' }}>
              <div className="field full">
                <label>Name</label>
                <input
                  type="text"
                  value={editName}
                  maxLength={40}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>

              <div className="field full">
                <p className="small muted">
                  {managing.households} {managing.households === 1 ? 'household' : 'households'} ·{' '}
                  {managing.residents} {managing.residents === 1 ? 'resident' : 'residents'} ·{' '}
                  {managing.officials} {managing.officials === 1 ? 'official' : 'officials'}
                </p>
              </div>

              {modalError && <span className="error-text" style={{ gridColumn: '1 / -1' }}>{modalError}</span>}

              {confirmDelete && (
                <div className="field full delete-warning">
                  {managing.households + managing.residents + managing.officials > 0
                    ? `Deleting ${managing.name} will remove the purok from its households and accounts. They stay in the barangay but will have no purok assigned.`
                    : `Delete ${managing.name}? This can't be undone.`}
                </div>
              )}

              <div className="row" style={{ gap: 10, marginTop: 10 }}>
                {confirmDelete ? (
                  <>
                    <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setConfirmDelete(false)} disabled={saving}>
                      Keep it
                    </button>
                    <button type="button" className="btn btn-danger-solid" style={{ flex: 1 }} onClick={handleDelete} disabled={saving}>
                      {saving ? 'Deleting…' : 'Yes, delete'}
                    </button>
                  </>
                ) : (
                  <>
                    <button type="button" className="btn btn-ghost btn-delete" style={{ flex: 1 }} onClick={() => setConfirmDelete(true)} disabled={saving}>
                      Delete
                    </button>
                    <button type="submit" className="btn btn-accent" style={{ flex: 1 }} disabled={saving || !editName.trim()}>
                      {saving ? 'Saving…' : 'Save'}
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 18px 0 14px;
        }
        .screen-head {
          margin: 4px 0 16px;
        }
        .screen-head .sub {
          color: var(--ink-soft);
          font-size: 13.5px;
          margin-top: 3px;
        }
        .purok-error {
          margin-bottom: 12px;
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 13px;
          color: #C1443C;
          background: rgba(193, 68, 60, 0.1);
          border: 1px solid rgba(193, 68, 60, 0.3);
        }
        .add-purok {
          display: flex;
          gap: 10px;
          margin-top: 14px;
        }
        .add-purok input {
          flex: 1;
          min-width: 0;
          padding: 11px 14px;
          border-radius: 12px;
          border: 1.5px solid var(--border);
          background: var(--surface);
          color: var(--ink);
          font-family: var(--font-body);
          font-size: 13.5px;
        }
        .add-purok .btn:disabled,
        .modal-content .btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
        .btn-delete {
          color: #C1443C;
        }
        .btn-danger-solid {
          background: #C1443C;
          color: #fff;
          border: none;
        }
        .delete-warning {
          font-size: 13px;
          padding: 10px 12px;
          border-radius: 10px;
          color: #C1443C;
          background: rgba(193, 68, 60, 0.1);
        }
        .purok-toast {
          position: fixed;
          left: 50%;
          bottom: 96px;
          transform: translateX(-50%);
          z-index: 120;
          max-width: calc(100vw - 40px);
          padding: 10px 16px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 500;
          color: #fff;
          background: rgba(20, 24, 33, 0.92);
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 20px;
          animation: fadeIn 0.2s ease;
        }
        .modal-content {
          background: var(--surface);
          border-radius: 20px;
          width: 100%;
          max-width: 480px;
          max-height: 90vh;
          overflow-y: auto;
          border: 1px solid var(--border);
          animation: slideUp 0.25s ease;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 20px 16px;
          border-bottom: 1px solid var(--border);
        }
        .modal-close {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: none;
          background: var(--surface-alt);
          color: var(--ink);
          font-size: 24px;
          line-height: 1;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .modal-close:hover {
          background: var(--border);
        }
        .modal-content .form-grid {
          padding: 20px;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (min-width: 900px) {
          .topbar {
            padding: 26px 0 20px;
          }
        }
      `}</style>
    </div>
  );
}