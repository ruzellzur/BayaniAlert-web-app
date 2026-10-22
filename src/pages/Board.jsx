import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/app-context';

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
    <div className="screen-enter">
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
        className="search-input"
        placeholder="Search items, e.g. generator, water…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
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
      <div id="resList" className="res-list">
        {filteredResources.length === 0 ? (
          <div className="empty-state">
            <span className="ic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7"/>
                <path d="m20 20-3.5-3.5"/>
              </svg>
            </span>
            <h4>No items match</h4>
            <p>Try a different search term, or be the first to share something with your neighbors.</p>
          </div>
        ) : (
          filteredResources.map((res) => (
            <div
              key={res.id}
              className="card card-hover res-card"
              onClick={() => navigate(`/resource/${res.id}`)}
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
        .res-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .add-resource-btn {
          flex-shrink: 0;
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px solid var(--border);
        }

        @media (min-width: 900px) {
          .res-list {
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

      }</style>
      `}</style>
    </div>
  );
}
