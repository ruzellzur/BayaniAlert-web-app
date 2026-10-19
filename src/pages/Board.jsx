import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Board() {
  const navigate = useNavigate();
  const { user, resources, addResource, requestItem } = useApp();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'power',
    desc: '',
    location: ''
  });
  const [errors, setErrors] = useState({});

  const filteredResources = resources.filter((r) => {
    const matchesFilter = filter === 'all' || r.cat === filter;
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.owner.toLowerCase().includes(search.toLowerCase()) ||
      (r.desc && r.desc.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Give your item a name first';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    addResource({
      name: formData.name,
      owner: `${user?.name || 'You'} · ${user?.purok || 'Purok 3'}`,
      cat: formData.category,
      dist: 'You',
      desc: formData.desc || 'No additional description.',
    });

    setShowModal(false);
    setFormData({ name: '', category: 'power', desc: '', location: '' });
    setErrors({});
  };

  const getCategoryIcon = (cat) => {
    const icons = {
      power: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2 3 14h7l-1 8 11-14h-8z"/></svg>,
      water: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3s6 7 6 11a6 6 0 1 1-12 0c0-4 6-11 6-11Z"/></svg>,
      tools: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 7l3 3-8 8-3.5.5.5-3.5 8-8Z"/><path d="M17 4l3 3"/></svg>,
      firstaid: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="7" width="18" height="12" rx="2"/><path d="M12 10v6M9 13h6"/></svg>,
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
        {['all', 'power', 'water', 'tools', 'firstaid', 'transport'].map((cat) => (
          <span
            key={cat}
            className={`chip ${filter === cat ? 'active' : ''}`}
            onClick={() => setFilter(cat)}
          >
            {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </span>
        ))}
      </div>

      {/* Resource List */}
      <div id="resList" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filteredResources.length === 0 ? (
          <p className="small muted" style={{ textAlign: 'center', marginTop: 18 }}>No items match your search.</p>
        ) : (
          filteredResources.map((res) => (
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
                <div className="name">{res.name}</div>
                <div className="owner">Shared by {res.owner}</div>
                <div className="res-foot">
                  <span className="dist">{res.dist} away</span>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      requestItem(res.id);
                    }}
                  >
                    Request
                  </button>
                </div>
              </div>
            </div>
          ))
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

      {/* Add Resource Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: 20, fontWeight: 600 }}>List a resource</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
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
                  {['power', 'water', 'tools', 'firstaid', 'transport'].map((cat) => (
                    <span
                      key={cat}
                      className={`chip ${formData.category === cat ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, category: cat })}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
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

              <div className="row" style={{ gap: 10, marginTop: 10 }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-accent" style={{ flex: 1 }}>
                  List item
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
        .res-ic.cat-firstaid {
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
