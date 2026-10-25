import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResources } from '../context/ResourceContext';

const CATEGORIES = ['power', 'water', 'tools', 'medicine', 'transport'];
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export default function Board() {
  const navigate = useNavigate();
  const {
    resources, myRequests, incomingRequests, loading, error,
    addResource, requestItem, respondToRequest,
  } = useResources();

  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);

  // List-a-resource modal
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', category: 'power', desc: '', location: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Request-an-item modal
  const [requestTarget, setRequestTarget] = useState(null);
  const [reqForm, setReqForm] = useState({ quantity: 1, note: '' });
  const [reqError, setReqError] = useState(null);
  const [reqSubmitting, setReqSubmitting] = useState(false);

  // Which incoming request is mid-action
  const [busyRequestId, setBusyRequestId] = useState(null);

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  };

  // listings I already have a live (pending/accepted) request on
  const requestedListingIds = useMemo(
    () => new Set(myRequests.filter((r) => ['pending', 'accepted'].includes(r.status)).map((r) => r.listingId)),
    [myRequests]
  );

  // requests on my listings that still need attention
  const openIncoming = useMemo(
    () => incomingRequests.filter((r) => ['pending', 'accepted'].includes(r.status)),
    [incomingRequests]
  );

  const q = search.toLowerCase();
  const filteredResources = resources.filter((r) => {
    const matchesFilter = filter === 'all' || r.cat === filter;
    const matchesSearch =
      r.name.toLowerCase().includes(q) ||
      r.owner.toLowerCase().includes(q) ||
      (r.desc && r.desc.toLowerCase().includes(q));
    return matchesFilter && matchesSearch;
  });

  // ---- list a resource ---------------------------------------------------
  const closeListModal = () => {
    setShowModal(false);
    setFormData({ name: '', category: 'power', desc: '', location: '' });
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrors({ name: 'Give your item a name first' });
      return;
    }
    setSubmitting(true);
    const { error: err } = await addResource({
      name: formData.name,
      category: formData.category,
      desc: formData.desc,
      pickupNote: formData.location,
    });
    setSubmitting(false);

    if (err) {
      setErrors({ form: err });
      return;
    }
    closeListModal();
    notify('Item listed on the resource board');
  };

  // ---- request an item ---------------------------------------------------
  const openRequest = (res) => {
    setRequestTarget(res);
    setReqForm({ quantity: 1, note: '' });
    setReqError(null);
  };

  const closeRequest = () => {
    setRequestTarget(null);
    setReqError(null);
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    const qty = Number.parseInt(reqForm.quantity, 10);
    if (!Number.isFinite(qty) || qty < 1) {
      setReqError('Quantity must be at least 1.');
      return;
    }
    if (qty > requestTarget.quantity) {
      setReqError(`Only ${requestTarget.quantity} available.`);
      return;
    }
    setReqSubmitting(true);
    const { error: err } = await requestItem(requestTarget.id, { quantity: qty, note: reqForm.note });
    setReqSubmitting(false);

    if (err) {
      setReqError(err);
      return;
    }
    const who = requestTarget.ownerName;
    closeRequest();
    notify(`Request sent to ${who}`);
  };

  // ---- owner actions on incoming requests ----------------------------------
  const handleRespond = async (req, decision) => {
    setBusyRequestId(req.id);
    const { error: err } = await respondToRequest(req.id, decision);
    setBusyRequestId(null);
    if (err) {
      notify(err);
      return;
    }
    const msg = {
      accept: `Accepted — arrange pickup with ${req.requester}`,
      decline: 'Request declined',
      complete: 'Marked as completed',
    }[decision];
    notify(msg);
  };

  // ---- card button state -----------------------------------------------------
  const getAction = (res) => {
    if (res.isMine) return { label: 'Your listing', disabled: true };
    if (res.type === 'request') return null; // a neighbor asking for help, nothing to borrow
    if (requestedListingIds.has(res.id)) return { label: 'Requested', disabled: true };
    if (res.status !== 'available') return { label: 'Reserved', disabled: true };
    return { label: 'Request', disabled: false };
  };

  const getCategoryIcon = (cat) => {
    const icons = {
      power: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2 3 14h7l-1 8 11-14h-8z"/></svg>,
      water: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3s6 7 6 11a6 6 0 1 1-12 0c0-4 6-11 6-11Z"/></svg>,
      tools: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 7l3 3-8 8-3.5.5.5-3.5 8-8Z"/><path d="M17 4l3 3"/></svg>,
      medicine: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="7" width="18" height="12" rx="2"/><path d="M12 10v6M9 13h6"/></svg>,
      transport: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="10" width="18" height="7" rx="2"/><circle cx="7.5" cy="18.5" r="1.5"/><circle cx="16.5" cy="18.5" r="1.5"/></svg>,
    };
    return icons[cat] || icons.tools;
  };

  return (
    <div className="screen-enter" style={{ padding: '2px 20px 100px' }}>
      {/* Topbar */}
      <div className="topbar">
        <div className="row" style={{ gap: 12 }}>
          <button className="btn-ghost btn btn-sm mobile-back" onClick={() => navigate('/home')} aria-label="Go back" style={{ padding: '8px 10px' }}>←</button>
          <h2 style={{ fontSize: 17 }}>Resource board</h2>
        </div>
        <div className="topbar-right">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/requests')}>My requests</button>
          <span className="brgy-pill">{resources.length} shared</span>
        </div>
      </div>

      <div className="screen-head" style={{ marginTop: 2 }}>
        <p className="sub">Borrow what you need, lend what you can spare — arrange pickup with your neighbor.</p>
      </div>

      {error && <div className="board-error">{error}</div>}

      {/* Requests on my listings */}
      {openIncoming.length > 0 && (
        <div className="card incoming-card">
          <p className="incoming-title">
            Requests on your items <span className="incoming-count">{openIncoming.length}</span>
          </p>
          {openIncoming.map((req) => (
            <div key={req.id} className="incoming-row">
              <div className="incoming-info">
                <div className="incoming-name">
                  {req.requester} <span className="muted">wants</span> {req.quantity > 1 ? `${req.quantity}× ` : ''}{req.item}
                </div>
                {req.note && <div className="incoming-note">“{req.note}”</div>}
                <div className="incoming-status">{req.status === 'accepted' ? 'Accepted · waiting for pickup' : 'Pending'}</div>
              </div>
              <div className="incoming-actions">
                {req.status === 'pending' ? (
                  <>
                    <button className="btn btn-ghost btn-sm" disabled={busyRequestId === req.id} onClick={() => handleRespond(req, 'decline')}>
                      Decline
                    </button>
                    <button className="btn btn-primary btn-sm" disabled={busyRequestId === req.id} onClick={() => handleRespond(req, 'accept')}>
                      Accept
                    </button>
                  </>
                ) : (
                  <button className="btn btn-primary btn-sm" disabled={busyRequestId === req.id} onClick={() => handleRespond(req, 'complete')}>
                    Mark completed
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <input
        type="text"
        placeholder="Search items, e.g. generator, water…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: '100%',
          marginBottom: 12,
          padding: '11px 14px',
          borderRadius: 12,
          border: '1.5px solid var(--border)',
          background: 'var(--surface)',
          color: 'var(--ink)',
          fontFamily: 'var(--font-body)',
          fontSize: 13.5
        }}
      />

      {/* Category Chips */}
      <div className="chip-row">
        {['all', ...CATEGORIES].map((cat) => (
          <span
            key={cat}
            className={`chip ${filter === cat ? 'active' : ''}`}
            onClick={() => setFilter(cat)}
          >
            {cat === 'all' ? 'All' : cap(cat)}
          </span>
        ))}
      </div>

      {/* Resource List */}
      <div id="resList" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loading && resources.length === 0 ? (
          <p className="small muted" style={{ textAlign: 'center', marginTop: 18 }}>Loading items…</p>
        ) : filteredResources.length === 0 ? (
          <p className="small muted" style={{ textAlign: 'center', marginTop: 18 }}>No items match your search.</p>
        ) : (
          filteredResources.map((res) => {
            const action = getAction(res);
            return (
              <div
                key={res.id}
                className="card res-card"
                onClick={() => navigate(`/resource/${res.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <span className={`res-ic cat-${res.cat}`}>
                  {getCategoryIcon(res.cat)}
                </span>
                <div className="res-body">
                  <div className="name">
                    {res.name}
                    {res.quantity > 1 && <span className="qty"> ×{res.quantity}</span>}
                  </div>
                  <div className="owner">
                    {res.type === 'request' ? 'Needed by' : 'Shared by'} {res.owner}
                  </div>
                  <div className="res-foot">
                    <span className="dist">{res.dist} away</span>
                    {res.type === 'request' && !res.isMine ? (
                      <span className="tag-needs">Needs help</span>
                    ) : (
                      action && (
                        <button
                          className="btn btn-primary btn-sm"
                          disabled={action.disabled}
                          onClick={(e) => {
                            e.stopPropagation();
                            openRequest(res);
                          }}
                        >
                          {action.label}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Resource Button */}
      <button
        className="btn btn-accent btn-block add-resource-btn"
        onClick={() => setShowModal(true)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ width: 18, height: 18 }}>
          <path d="M12 5v14M5 12h14"/>
        </svg>
        List a resource
      </button>

      {/* Toast */}
      {toast && <div className="board-toast" role="status">{toast}</div>}

      {/* Request Modal */}
      {requestTarget && (
        <div className="modal-overlay" onClick={closeRequest}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: 20, fontWeight: 600 }}>Request item</h2>
              <button className="modal-close" onClick={closeRequest}>×</button>
            </div>

            <form onSubmit={handleRequestSubmit} className="form-grid" style={{ padding: '0 0 20px' }}>
              <div className="field full">
                <p style={{ fontWeight: 600, fontSize: 15 }}>{requestTarget.name}</p>
                <p className="small muted" style={{ marginTop: 2 }}>
                  Shared by {requestTarget.owner} · {requestTarget.quantity} available
                </p>
              </div>

              {requestTarget.quantity > 1 && (
                <div className="field full">
                  <label>How many do you need?</label>
                  <input
                    type="number"
                    min={1}
                    max={requestTarget.quantity}
                    value={reqForm.quantity}
                    onChange={(e) => setReqForm({ ...reqForm, quantity: e.target.value })}
                  />
                </div>
              )}

              <div className="field full">
                <label>Message (optional)</label>
                <textarea
                  className="compose"
                  rows={3}
                  maxLength={500}
                  placeholder="When you need it, who it's for, anything the owner should know"
                  value={reqForm.note}
                  onChange={(e) => setReqForm({ ...reqForm, note: e.target.value })}
                />
              </div>

              {reqError && <span className="error-text" style={{ gridColumn: '1 / -1' }}>{reqError}</span>}

              <div className="row" style={{ gap: 10, marginTop: 10 }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={closeRequest}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={reqSubmitting}>
                  {reqSubmitting ? 'Sending…' : 'Send request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Resource Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeListModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: 20, fontWeight: 600 }}>List a resource</h2>
              <button className="modal-close" onClick={closeListModal}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="form-grid" style={{ padding: '0 0 20px' }}>
              <div className="field full">
                <label>Item name</label>
                <input
                  type="text"
                  placeholder="e.g. Rechargeable lamp"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={errors.name ? 'field-error' : ''}
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>

              <div className="field full">
                <label>Category</label>
                <div className="chip-row" style={{ marginBottom: 0 }}>
                  {CATEGORIES.map((cat) => (
                    <span
                      key={cat}
                      className={`chip ${formData.category === cat ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, category: cat })}
                    >
                      {cap(cat)}
                    </span>
                  ))}
                </div>
              </div>

              <div className="field full">
                <label>Short description</label>
                <textarea
                  className="compose"
                  rows={3}
                  placeholder="Condition, quantity, anything borrowers should know"
                  value={formData.desc}
                  onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                />
              </div>

              <div className="field full">
                <label>Pickup location</label>
                <input
                  type="text"
                  placeholder="Purok 3, near the chapel"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              {errors.form && <span className="error-text" style={{ gridColumn: '1 / -1' }}>{errors.form}</span>}

              <div className="row" style={{ gap: 10, marginTop: 10 }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={closeListModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-accent" style={{ flex: 1 }} disabled={submitting}>
                  {submitting ? 'Listing…' : 'List item'}
                </button>
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
          padding: 18px 20px 14px;
        }
        .brgy-pill {
          font-size: 12px;
          font-weight: 600;
          color: var(--ink-soft);
          background: var(--surface);
          border: 1px solid var(--border);
          padding: 6px 10px;
          border-radius: 999px;
          white-space: nowrap;
        }
        .screen-head {
          margin: 4px 0 16px;
        }
        .screen-head .sub {
          color: var(--ink-soft);
          font-size: 13.5px;
          margin-top: 3px;
        }
        .board-error {
          margin-bottom: 12px;
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 13px;
          color: #C1443C;
          background: rgba(193, 68, 60, 0.1);
          border: 1px solid rgba(193, 68, 60, 0.3);
        }

        /* Requests on my listings */
        .incoming-card {
          margin-bottom: 16px;
        }
        .incoming-title {
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 8px;
        }
        .incoming-count {
          display: inline-block;
          min-width: 20px;
          padding: 1px 7px;
          margin-left: 6px;
          border-radius: 999px;
          font-size: 11.5px;
          text-align: center;
          color: #fff;
          background: var(--grad-accent);
        }
        .incoming-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 10px 0;
          border-top: 1px solid var(--border);
        }
        .incoming-row:first-of-type {
          border-top: none;
        }
        .incoming-info {
          min-width: 0;
        }
        .incoming-name {
          font-size: 13.5px;
          font-weight: 600;
        }
        .incoming-note {
          font-size: 12px;
          color: var(--ink-soft);
          margin-top: 2px;
        }
        .incoming-status {
          font-size: 11.5px;
          color: var(--ink-soft);
          margin-top: 2px;
        }
        .incoming-actions {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }

        .res-card {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }
        .res-ic {
          width: 44px;
          height: 44px;
          border-radius: 13px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--grad-cool);
          color: #fff;
        }
        .res-ic svg {
          width: 21px;
          height: 21px;
        }
        .res-ic.cat-power {
          background: var(--grad-accent);
        }
        .res-ic.cat-water {
          background: linear-gradient(135deg, #6FA8D8, var(--cool) 65%, #274670);
        }
        .res-ic.cat-tools {
          background: var(--grad-cool);
        }
        .res-ic.cat-medicine {
          background: var(--grad-danger);
        }
        .res-ic.cat-transport {
          background: var(--grad-safe);
        }
        .res-body {
          flex: 1;
          min-width: 0;
        }
        .res-body .name {
          font-weight: 600;
          font-size: 14.5px;
        }
        .res-body .qty {
          font-weight: 500;
          font-size: 12.5px;
          color: var(--ink-soft);
        }
        .res-body .owner {
          font-size: 12px;
          color: var(--ink-soft);
          margin-top: 2px;
        }
        .res-foot {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 10px;
        }
        .dist {
          font-size: 11.5px;
          color: var(--ink-soft);
        }
        .tag-needs {
          font-size: 11.5px;
          font-weight: 600;
          color: var(--ink-soft);
          background: var(--surface-alt);
          border: 1px solid var(--border);
          padding: 4px 9px;
          border-radius: 999px;
        }
        .res-foot .btn:disabled,
        .incoming-actions .btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
        #resList {
          flex: 1 1 0;
          min-height: 0;
          overflow-y: auto;
          padding-bottom: 4px;
        }
        .add-resource-btn {
          flex-shrink: 0;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid var(--border);
        }

        .board-toast {
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
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
          animation: slideUp 0.2s ease;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
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
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.3);
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
          .screen-enter {
            max-width: 1180px;
          }
          #resList {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr);
            gap: 14px;
            align-content: start;
          }
          .add-resource-btn {
            max-width: 320px;
            margin-left: auto;
            margin-right: auto;
            border-top: none;
            padding-top: 0;
          }
        }
      `}</style>
    </div>
  );
}