import { useEffect, useMemo, useState } from 'react';
import { useEvac, AMENITY_STATUSES, PRESET_AMENITIES } from '../../context/EvacContext';
import LocationPicker from '../../components/LocationPicker'; // adjust path

const amenityColors = {
  Available: 'var(--safe)',
  Limited: 'var(--accent)',
  Unavailable: 'var(--danger)',
};

const STATUS_LABEL = { open: 'Open', full: 'Full', closed: 'Closed' };

const emptyForm = () => ({ name: '', address: '', capacity: '', lat: '', lng: '', openNow: false, amenities: [] });

const DEFAULT_CENTER = [14.6507, 120.9726];

// Head-count control with its own draft so typing doesn't hit the server per keystroke.
function OccupancyControl({ center, disabled, onSet }) {
  const [draft, setDraft] = useState(String(center.occupancy));
  useEffect(() => setDraft(String(center.occupancy)), [center.occupancy]);

  const commit = async (value) => {
    const n = Number.parseInt(value, 10);
    if (!Number.isFinite(n) || n === center.occupancy) {
      setDraft(String(center.occupancy));
      return;
    }
    const res = await onSet(n);
    if (res?.error) setDraft(String(center.occupancy));
  };

  return (
    <div className="occ-control">
      <button
        className="btn btn-ghost btn-sm"
        disabled={disabled || center.occupancy <= 0}
        onClick={() => commit(center.occupancy - 1)}
        aria-label="Decrease occupancy"
      >−</button>
      <input
        type="number"
        min={0}
        max={center.capacity}
        value={draft}
        disabled={disabled}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => commit(draft)}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        aria-label="Current occupancy"
      />
      <button
        className="btn btn-ghost btn-sm"
        disabled={disabled || center.occupancy >= center.capacity}
        onClick={() => commit(center.occupancy + 1)}
        aria-label="Increase occupancy"
      >+</button>
    </div>
  );
}

export default function AdminEvac() {
  const {
    centers, barangays, loading, error, canManage, isAdmin,
    addCenter, updateCenter, setOccupancy, openCenter, closeCenter,
    setAmenityStatus, deleteCenter,
  } = useEvac();

  const [barangayId, setBarangayId] = useState('');
  const [toast, setToast] = useState(null);
  const [busyId, setBusyId] = useState(null);

  // Add / edit modal
  const [modal, setModal] = useState(null); // { mode: 'add' } | { mode: 'edit', center }
  const [form, setForm] = useState(emptyForm(null));
  const [amenityInput, setAmenityInput] = useState('');
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  };

  useEffect(() => {
    if (isAdmin && !barangayId && barangays.length > 0) setBarangayId(barangays[0].id);
  }, [isAdmin, barangays, barangayId]);

const selectedBarangay = isAdmin
  ? barangays.find((b) => b.id === barangayId) || null
  : barangays[0] || null; // non-admins only receive their own barangay
  
  const latNum = parseFloat(form.lat);
  const lngNum = parseFloat(form.lng);
  const pinned = Number.isFinite(latNum) && Number.isFinite(lngNum) ? { lat: latNum, lng: lngNum } : null;
  const mapCenter = selectedBarangay
    ? [selectedBarangay.center_lat, selectedBarangay.center_lng]
    : DEFAULT_CENTER;

  // admins see one barangay at a time; officials only ever have their own
  const visible = useMemo(
    () => (isAdmin ? centers.filter((c) => c.barangayId === barangayId) : centers),
    [centers, isAdmin, barangayId]
  );

  const openCount = visible.filter((c) => c.status !== 'closed').length;
  const totalCapacity = visible.filter((c) => c.status !== 'closed').reduce((s, c) => s + c.capacity, 0);
  const totalOccupancy = visible.filter((c) => c.status !== 'closed').reduce((s, c) => s + c.occupancy, 0);

  // ---- card actions --------------------------------------------------------
  const act = async (id, fn, okMsg) => {
    setBusyId(id);
    const res = await fn();
    setBusyId(null);
    notify(res?.error ?? okMsg);
    return res;
  };

  const cycleAmenity = (center, index) => {
    const current = center.amenities[index];
    const next = AMENITY_STATUSES[(AMENITY_STATUSES.indexOf(current.status) + 1) % AMENITY_STATUSES.length];
    return act(center.id, () => setAmenityStatus(center.id, index, next), `${current.name}: ${next}`);
  };

  const toggleOpen = (center) =>
    center.status === 'closed'
      ? act(center.id, () => openCenter(center.id), `${center.name} opened`)
      : act(center.id, () => closeCenter(center.id), `${center.name} closed`);

  const handleOccupancy = async (center, n) => {
    setBusyId(center.id);
    const res = await setOccupancy(center.id, n);
    setBusyId(null);
    if (res?.error) notify(res.error);
    else if (res.center.status === 'full' && center.status !== 'full') notify(`${center.name} is now full`);
    return res;
  };

  // ---- modal -----------------------------------------------------------------
  const openAdd = () => {
    setForm(emptyForm(selectedBarangay));
    setAmenityInput('');
    setFormError(null);
    setConfirmDelete(false);
    setModal({ mode: 'add' });
  };

  const openEdit = (center) => {
    setForm({
      name: center.name,
      address: center.address || '',
      capacity: String(center.capacity),
      lat: String(center.lat),
      lng: String(center.lng),
      openNow: false,
      amenities: center.amenities.map((a) => ({ ...a })),
    });
    setAmenityInput('');
    setFormError(null);
    setConfirmDelete(false);
    setModal({ mode: 'edit', center });
  };

  const closeModal = () => {
    setModal(null);
    setFormError(null);
    setConfirmDelete(false);
  };

  const addAmenity = () => {
    const name = amenityInput.trim();
    if (!name) return;
    if (form.amenities.some((a) => a.name.toLowerCase() === name.toLowerCase())) {
      setAmenityInput('');
      return;
    }
    setForm({ ...form, amenities: [...form.amenities, { name, status: 'Available' }] });
    setAmenityInput('');
  };

  const removeAmenity = (index) =>
    setForm({ ...form, amenities: form.amenities.filter((_, i) => i !== index) });

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setFormError('Location is not available on this device.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setForm((f) => ({ ...f, lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) })),
      () => setFormError('Could not get your location. Enter the coordinates manually.'),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    const res = modal.mode === 'add'
      ? await addCenter(barangayId, form)
      : await updateCenter(modal.center.id, form);
    setSaving(false);

    if (res.error) {
      setFormError(res.error);
      return;
    }
    notify(modal.mode === 'add' ? `${form.name.trim()} added` : 'Evacuation center updated');
    closeModal();
  };

  const handleDelete = async () => {
    setSaving(true);
    const res = await deleteCenter(modal.center.id);
    setSaving(false);
    if (res.error) {
      setFormError(res.error);
      return;
    }
    notify(`${modal.center.name} removed`);
    closeModal();
  };

  const initialLoad = loading && centers.length === 0;

  return (
    <div className="screen-enter" style={{ padding: '2px 20px 100px' }}>
      {/* Topbar */}
      <div className="topbar">
        <h2 style={{ fontSize: 20 }}>Evacuation Centers</h2>
        {canManage && (!isAdmin || barangayId) && (
          <button className="btn btn-accent btn-sm" onClick={openAdd}>+ Add center</button>
        )}
      </div>

      <div className="screen-head">
        <p className="sub">Manage evacuation center capacity and status.</p>
      </div>

      {error && <div className="evac-error">{error}</div>}

      {/* Barangay picker (admins manage every barangay) */}
      {isAdmin && barangays.length > 0 && (
        <div className="field" style={{ marginBottom: 14 }}>
          <label htmlFor="evac-barangay" className="small muted">Barangay</label>
          <select
            id="evac-barangay"
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
      )}

      {initialLoad ? (
        <p className="small muted" style={{ textAlign: 'center', marginTop: 24 }}>Loading evacuation centers…</p>
      ) : (
        <>
          {/* Summary */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="stat-trio">
              <div>
                <div className="n" style={{ color: 'var(--safe)' }}>{openCount}</div>
                <div className="l">Open</div>
              </div>
              <div>
                <div className="n" style={{ color: 'var(--accent)' }}>{totalOccupancy}</div>
                <div className="l">Evacuees</div>
              </div>
              <div>
                <div className="n" style={{ color: 'var(--cool)' }}>{totalCapacity}</div>
                <div className="l">Open capacity</div>
              </div>
            </div>
          </div>

          <div className="stack">
            {visible.length === 0 ? (
              <div className="card">
                <p className="small muted" style={{ textAlign: 'center', padding: '16px 0' }}>
                  No evacuation centers yet.{canManage ? ' Use “Add center” to create one.' : ''}
                </p>
              </div>
            ) : (
              visible.map((center) => {
                const ratio = center.capacity > 0 ? center.occupancy / center.capacity : 0;
                const busy = busyId === center.id;
                return (
                  <div key={center.id} className="card">
                    <div className="row between" style={{ alignItems: 'flex-start', gap: 10 }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>{center.name}</div>
                        <div className="muted small" style={{ marginTop: 2 }}>{center.address || 'No address given'}</div>
                      </div>
                      <span className={`evac-status ${center.status}`}>{STATUS_LABEL[center.status]}</span>
                    </div>

                    {/* Capacity Bar */}
                    <div className="cap-bar" style={{ marginTop: 14 }}>
                      <div
                        className="cap-fill"
                        style={{
                          width: `${Math.min(100, ratio * 100)}%`,
                          background: center.status === 'closed'
                            ? 'var(--border)'
                            : ratio > 0.9 ? 'var(--danger)' : 'var(--safe)',
                        }}
                      ></div>
                    </div>

                    <div className="row between" style={{ marginTop: 8, alignItems: 'center' }}>
                      <span className="small muted">Capacity: {center.occupancy} / {center.capacity}</span>
                      {canManage && (
                        <OccupancyControl
                          center={center}
                          disabled={busy}
                          onSet={(n) => handleOccupancy(center, n)}
                        />
                      )}
                    </div>

                    {/* Amenities */}
                    <div className="section-label" style={{ marginTop: 12, marginBottom: 6 }}>
                      <h3 style={{ fontSize: 13 }}>On-site amenities</h3>
                    </div>
                    {center.amenities.length === 0 ? (
                      <p className="small muted">None listed.</p>
                    ) : (
                      <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
                        {center.amenities.map((amenity, ai) => (
                          <span
                            key={`${amenity.name}-${ai}`}
                            className="tag"
                            onClick={canManage && !busy ? () => cycleAmenity(center, ai) : undefined}
                            style={{
                              background: `${amenityColors[amenity.status]}20`,
                              color: amenityColors[amenity.status],
                              cursor: canManage ? 'pointer' : 'default',
                            }}
                          >
                            {amenity.name} · {amenity.status}
                          </span>
                        ))}
                      </div>
                    )}

                    {canManage && (
                      <div className="row" style={{ gap: 8, marginTop: 14 }}>
                        <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} disabled={busy} onClick={() => openEdit(center)}>
                          Edit
                        </button>
                        <button
                          className={`btn btn-sm ${center.status === 'closed' ? 'btn-primary' : 'btn-ghost'}`}
                          style={{ flex: 1 }}
                          disabled={busy}
                          onClick={() => toggleOpen(center)}
                        >
                          {center.status === 'closed' ? 'Open center' : 'Close center'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {toast && <div className="evac-toast" role="status">{toast}</div>}

      {/* Add / edit modal */}
      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: 20, fontWeight: 600 }}>
                {modal.mode === 'add' ? 'Add evacuation center' : 'Edit evacuation center'}
              </h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="form-grid" style={{ padding: '0 0 20px' }}>
              {modal.mode === 'add' && isAdmin && selectedBarangay && (
                <div className="field full">
                  <p className="small muted">Adding to {selectedBarangay.name}</p>
                </div>
              )}

              <div className="field full">
                <label>Name</label>
                <input
                  type="text"
                  placeholder="e.g. San Isidro Elementary School"
                  value={form.name}
                  maxLength={80}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="field full">
                <label>Address</label>
                <input
                  type="text"
                  placeholder="Purok 2, near the chapel"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>

              <div className="field full">
                <label>Capacity (people)</label>
                <input
                  type="number"
                  min={1}
                  placeholder="e.g. 200"
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                />
              </div>

              <div className="field full">
                <label>Location</label>
                <LocationPicker
                  value={pinned}
                  center={mapCenter}
                  height={240}
                  onChange={({ lat, lng }) =>
                    setForm((f) => ({ ...f, lat: lat.toFixed(6), lng: lng.toFixed(6) }))
                  }
                />
                <p className="small muted" style={{ marginTop: 6 }}>
                  Tap the map or drag the pin to set the exact spot.
                </p>
                <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 6 }} onClick={useMyLocation}>
                  Use my current location
                </button>
              </div>

              {/* Amenities */}
              <div className="field full">
                <label>Amenities</label>
                {form.amenities.length > 0 && (
                  <div className="row" style={{ flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                    {form.amenities.map((a, i) => (
                      <span key={`${a.name}-${i}`} className="tag amenity-chip">
                        {a.name}
                        <button type="button" onClick={() => removeAmenity(i)} aria-label={`Remove ${a.name}`}>×</button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="row" style={{ gap: 8 }}>
                  <input
                    type="text"
                    list="amenity-presets"
                    placeholder="Add an amenity…"
                    value={amenityInput}
                    onChange={(e) => setAmenityInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addAmenity();
                      }
                    }}
                    style={{ flex: 1, minWidth: 0 }}
                  />
                  <datalist id="amenity-presets">
                    {PRESET_AMENITIES.filter((p) => !form.amenities.some((a) => a.name === p)).map((p) => (
                      <option key={p} value={p} />
                    ))}
                  </datalist>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={addAmenity} disabled={!amenityInput.trim()}>
                    Add
                  </button>
                </div>
                <p className="small muted" style={{ marginTop: 6 }}>
                  Tap an amenity on the center's card to cycle Available, Limited, Unavailable.
                </p>
              </div>

              {modal.mode === 'add' && (
                <div className="field full">
                  <label className="row" style={{ gap: 8, alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={form.openNow}
                      onChange={(e) => setForm({ ...form, openNow: e.target.checked })}
                    />
                    <span>Open immediately</span>
                  </label>
                  <p className="small muted" style={{ marginTop: 4 }}>
                    Centers start closed so residents don't see them until you're ready.
                  </p>
                </div>
              )}

              {formError && <span className="error-text" style={{ gridColumn: '1 / -1' }}>{formError}</span>}

              {confirmDelete && (
                <div className="field full delete-warning">
                  Delete {modal.center.name}? This can't be undone.
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
                    {modal.mode === 'edit' ? (
                      <button type="button" className="btn btn-ghost btn-delete" style={{ flex: 1 }} onClick={() => setConfirmDelete(true)} disabled={saving}>
                        Delete
                      </button>
                    ) : (
                      <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={closeModal} disabled={saving}>
                        Cancel
                      </button>
                    )}
                    <button type="submit" className="btn btn-accent" style={{ flex: 1 }} disabled={saving}>
                      {saving ? 'Saving…' : modal.mode === 'add' ? 'Add center' : 'Save'}
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
        .evac-error {
          margin-bottom: 12px;
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 13px;
          color: #C1443C;
          background: rgba(193, 68, 60, 0.1);
          border: 1px solid rgba(193, 68, 60, 0.3);
        }
        .evac-status {
          flex-shrink: 0;
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 600;
        }
        .evac-status.open { background: var(--safe); color: #fff; }
        .evac-status.full { background: var(--danger); color: #fff; }
        .evac-status.closed { background: var(--surface-alt); color: var(--ink-soft); }

        .occ-control {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .occ-control input {
          width: 64px;
          text-align: center;
          padding: 6px 4px;
          border-radius: 8px;
          border: 1.5px solid var(--border);
          background: var(--surface);
          color: var(--ink);
          font-family: var(--font-body);
          font-size: 13px;
        }
        .btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
        .amenity-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--surface-alt);
          color: var(--ink);
        }
        .amenity-chip button {
          border: none;
          background: transparent;
          color: var(--ink-soft);
          font-size: 15px;
          line-height: 1;
          cursor: pointer;
          padding: 0;
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
        .evac-toast {
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