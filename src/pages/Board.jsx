import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

/**
 * Resource Board Page
 *
 * Markup matches the prototype's `#screen-board`:
 *   .topbar > .row (mobile-back + h2) + .topbar-right
 *   .screen-head > .sub
 *   #resSearch (input)
 *   .chip-row > .chip (category filters)
 *   #resList (resource cards)
 *   .add-resource-btn (list a resource button)
 *
 * All visual rules live in src/styles/prototype.css.
 */
export default function Board() {
  const navigate = useNavigate();
  const { user, resources, addResource, requestItem } = useApp();

  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newResource, setNewResource] = useState({
    name: '',
    cat: 'power',
    desc: '',
    location: '',
  });

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'power', label: 'Power' },
    { id: 'water', label: 'Water' },
    { id: 'tools', label: 'Tools' },
    { id: 'firstaid', label: 'First aid' },
    { id: 'transport', label: 'Transport' },
  ];

  const filteredResources = resources.filter((r) => {
    const matchesFilter = filter === 'all' || r.cat === filter;
    const q = query.trim().toLowerCase();
    const matches =
      !q ||
      r.name.toLowerCase().includes(q) ||
      (r.owner || '').toLowerCase().includes(q) ||
      (r.desc || '').toLowerCase().includes(q);
    return matchesFilter && matches;
  });

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

  const handleAddResource = (e) => {
    e?.preventDefault();
    if (!newResource.name.trim()) return;

    const descParts = [newResource.desc.trim()];
    if (newResource.location.trim()) {
      descParts.push(`Pickup: ${newResource.location.trim()}`);
    }

    addResource({
      name: newResource.name.trim(),
      owner: `${user?.name || 'You'} · ${user?.purok || 'Purok 3'}`,
      cat: newResource.cat,
      dist: 'You',
      desc: descParts.filter(Boolean).join(' · ') || 'No additional description.',
    });

    setNewResource({ name: '', cat: 'power', desc: '', location: '' });
    setShowAddForm(false);
  };

  return (
    <section className="screen active" id="screen-board">
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
        id="resSearch"
        placeholder="Search items, e.g. generator, water…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ width: '100%', marginBottom: 12, padding: '11px 14px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--ink)', fontSize: '13.5px' }}
      />

      {/* Add Resource Form (inline, like prototype's listResource screen) */}
      {showAddForm && (
        <div className="form-grid" style={{ marginBottom: 16 }}>
          <div className="field">
            <label>Item name</label>
            <input
              type="text"
              placeholder="e.g. Rechargeable lamp"
              value={newResource.name}
              onChange={(e) => setNewResource((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div className="field">
            <label>Category</label>
            <div className="chip-row" style={{ marginBottom: 0 }}>
              {categories.filter((c) => c.id !== 'all').map((cat) => (
                <span
                  key={cat.id}
                  className={`chip ${newResource.cat === cat.id ? 'active' : ''}`}
                  onClick={() => setNewResource((p) => ({ ...p, cat: cat.id }))}
                >
                  {cat.label}
                </span>
              ))}
            </div>
          </div>
          <div className="field">
            <label>Short description</label>
            <textarea
              className="compose"
              rows={3}
              placeholder="Condition, quantity, anything borrowers should know"
              value={newResource.desc}
              onChange={(e) => setNewResource((p) => ({ ...p, desc: e.target.value }))}
            />
          </div>
          <div className="field">
            <label>Pickup location</label>
            <input
              type="text"
              placeholder="Purok 3, near the chapel"
              value={newResource.location}
              onChange={(e) => setNewResource((p) => ({ ...p, location: e.target.value }))}
            />
          </div>
          <button className="btn btn-accent btn-block" style={{ marginTop: 18 }} onClick={handleAddResource}>List item</button>
        </div>
      )}

      {/* Category Chips */}
      <div className="chip-row" id="chipRow">
        {categories.map((cat) => (
          <span
            key={cat.id}
            className={`chip ${filter === cat.id ? 'active' : ''}`}
            data-f={cat.id}
            onClick={() => setFilter(cat.id)}
          >
            {cat.label}
          </span>
        ))}
      </div>

      {/* Resource List */}
      <div id="resList">
        {filteredResources.length === 0 ? (
          <p className="small muted" style={{ textAlign: 'center', padding: 20 }}>
            {query.trim() ? 'No items match your search.' : 'No resources found in this category'}
          </p>
        ) : (
          filteredResources.map((resource, i) => (
            <div
              key={resource.id || i}
              className="card res-card"
              onClick={() => navigate(`/resource/${resource.id}`)}
              style={{ cursor: 'pointer', marginBottom: 10 }}
            >
              <span className={`res-ic cat-${resource.cat}`}>
                {getCategoryIcon(resource.cat)}
              </span>
              <div className="res-body">
                <div className="name">{resource.name}</div>
                <div className="owner">Shared by {resource.owner}</div>
                <button
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: 10 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    requestItem(resource.id);
                  }}
                >
                  Request
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Resource Button */}
      <button
        className="btn btn-accent btn-block add-resource-btn"
        onClick={() => setShowAddForm(!showAddForm)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ width: 18, height: 18 }}>
          <path d="M12 5v14M5 12h14" />
        </svg>
        {showAddForm ? 'Cancel' : 'List a resource'}
      </button>
    </section>
  );
}