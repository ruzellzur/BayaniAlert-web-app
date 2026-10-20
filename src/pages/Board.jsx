import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button, Card, Chip } from '../components/ui';
import { PageContainer } from '../components/layout/PageContainer';
import Brand from '../components/Brand';

/**
 * Resource Board Page
 *
 * Modern design system UI on top of the ORIGINAL functionality — nothing removed:
 * - Search across item name, owner and description
 * - "My requests" shortcut to /requests
 * - Per-card Request button (calls requestItem)
 * - Add-resource form with category chips, description AND pickup location
 * - "shared" counter pill
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
  const [errors, setErrors] = useState({});

  const categories = [
    { id: 'all', label: 'All', icon: '📦' },
    { id: 'power', label: 'Power', icon: '⚡' },
    { id: 'water', label: 'Water', icon: '💧' },
    { id: 'tools', label: 'Tools', icon: '🔧' },
    { id: 'firstaid', label: 'First Aid', icon: '🏥' },
    { id: 'transport', label: 'Transport', icon: '🚗' },
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
    e.preventDefault();

    if (!newResource.name.trim()) {
      setErrors({ name: 'Give your item a name first' });
      return;
    }

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
    setErrors({});
    setShowAddForm(false);
  };

  return (
    <PageContainer variant="dashboard" className="board-page">
      {/* Topbar */}
      <div className="topbar">
        <Brand />
        <div className="topbar-right">
          <span className="brgy-pill">{resources.length} shared</span>
          <Button variant="ghost" size="sm" onClick={() => navigate('/requests')}>
            My requests
          </Button>
          <Button variant="accent" size="sm" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? 'Cancel' : '+ List item'}
          </Button>
        </div>
      </div>

      <div className="board-head">
        <h2>Resource board</h2>
        <p className="sub">
          Borrow what you need, lend what you can spare — arrange pickup with your
          neighbor.
        </p>
      </div>

      {/* Search */}
      <div className="board-search">
        <input
          type="text"
          placeholder="Find items, e.g. generator, water…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Find resources"
        />
      </div>

      {/* Add Resource Form */}
      {showAddForm && (
        <Card padding="md" className="add-form">
          <form onSubmit={handleAddResource}>
            <div className="form-field">
              <label htmlFor="res-name">Item name</label>
              <input
                id="res-name"
                type="text"
                value={newResource.name}
                onChange={(e) => {
                  setNewResource((prev) => ({ ...prev, name: e.target.value }));
                  if (errors.name) setErrors({});
                }}
                placeholder="e.g. Rechargeable lamp"
                aria-invalid={!!errors.name}
                required
              />
              {errors.name && (
                <span className="field-error" role="alert">
                  {errors.name}
                </span>
              )}
            </div>

            <div className="form-field">
              <label>Category</label>
              <div className="chip-row">
                {categories.filter((c) => c.id !== 'all').map((cat) => (
                  <Chip
                    key={cat.id}
                    active={newResource.cat === cat.id}
                    onClick={() => setNewResource((prev) => ({ ...prev, cat: cat.id }))}
                  >
                    {cat.icon} {cat.label}
                  </Chip>
                ))}
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="res-desc">Short description</label>
              <textarea
                id="res-desc"
                value={newResource.desc}
                onChange={(e) => setNewResource((prev) => ({ ...prev, desc: e.target.value }))}
                placeholder="Condition, quantity, anything borrowers should know"
                rows={3}
              />
            </div>

            {/* Pickup location */}
            <div className="form-field">
              <label htmlFor="res-location">Pickup location</label>
              <input
                id="res-location"
                type="text"
                value={newResource.location}
                onChange={(e) =>
                  setNewResource((prev) => ({ ...prev, location: e.target.value }))
                }
                placeholder="Purok 3, near the chapel"
              />
            </div>

            <div className="form-actions">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowAddForm(false);
                  setErrors({});
                }}
                block
              >
                Cancel
              </Button>
              <Button type="submit" variant="accent" block>
                List item
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Filter Chips */}
      <div className="chip-section">
        <div className="chip-row">
          {categories.map((cat) => (
            <Chip
              key={cat.id}
              active={filter === cat.id}
              onClick={() => setFilter(cat.id)}
            >
              {cat.icon} {cat.label}
            </Chip>
          ))}
        </div>
      </div>

      {/* Resource List */}
      <div className="res-list-wrap">
        {filteredResources.length === 0 ? (
          <Card padding="lg" style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--ink-soft)', margin: 0 }}>
              {query.trim()
                ? 'No items match your search.'
                : 'No resources found in this category'}
            </p>
          </Card>
        ) : (
          <div className="res-list">
            {filteredResources.map((resource, i) => (
              <Card
                key={resource.id || i}
                interactive
                onClick={() => navigate(`/resource/${resource.id}`)}
              >
                <div className="res-row">
                  <span className={`res-ic cat-${resource.cat}`}>
                    {getCategoryIcon(resource.cat)}
                  </span>
                  <div className="res-body">
                    <div className="name">{resource.name}</div>
                    <div className="owner">Shared by {resource.owner}</div>
                    <div className="res-foot">
                      <span className="dist">📍 {resource.dist} away</span>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          requestItem(resource.id);
                        }}
                      >
                        Request
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .board-page {
          padding-bottom: 100px;
        }

        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-3);
          padding: var(--space-5) var(--space-5) var(--space-3);
          background: var(--bg);
          position: sticky;
          top: 0;
          z-index: var(--z-sticky);
          flex-wrap: wrap;
        }

        .topbar-right {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          flex-wrap: wrap;
        }

        .brgy-pill {
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--ink-soft);
          background: var(--surface);
          border: 1px solid var(--border);
          padding: 6px 10px;
          border-radius: var(--radius-full);
          white-space: nowrap;
        }

        .board-head {
          padding: 0 var(--space-5);
          margin-bottom: var(--space-4);
        }

        .board-head h2 {
          font-size: var(--text-xl);
          font-weight: 600;
          margin: 0;
        }

        .board-head .sub {
          color: var(--ink-soft);
          font-size: var(--text-sm);
          margin-top: var(--space-1);
          line-height: 1.5;
        }

        .board-search {
          padding: 0 var(--space-5);
          margin-bottom: var(--space-3);
        }

        .board-search input {
          width: 100%;
          padding: 11px 14px;
          font-size: var(--text-base);
          font-family: var(--font-body);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-md);
          background: var(--surface);
          color: var(--ink);
          transition: border-color var(--duration-fast), box-shadow var(--duration-fast);
        }

        .board-search input:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: var(--focus-ring);
        }

        .add-form {
          margin: 0 var(--space-5) var(--space-4);
        }

        .form-field {
          margin-bottom: var(--space-3);
        }

        .form-field > label {
          display: block;
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--ink-soft);
          margin-bottom: var(--space-2);
        }

        .form-field input,
        .form-field textarea {
          width: 100%;
          padding: 11px 13px;
          font-size: var(--text-base);
          font-family: var(--font-body);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-md);
          background: var(--surface);
          color: var(--ink);
          transition: border-color var(--duration-fast), box-shadow var(--duration-fast);
        }

        .form-field textarea {
          resize: vertical;
          min-height: 76px;
        }

        .form-field input:focus,
        .form-field textarea:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: var(--focus-ring);
        }

        .form-field input[aria-invalid='true'] {
          border-color: var(--danger);
        }

        .field-error {
          display: block;
          margin-top: var(--space-1);
          font-size: var(--text-xs);
          color: var(--danger);
        }

        .chip-row {
          display: flex;
          gap: var(--space-2);
          overflow-x: auto;
          padding-bottom: var(--space-1);
          scrollbar-width: none;
        }

        .chip-row::-webkit-scrollbar {
          display: none;
        }

        .chip-row > * {
          flex-shrink: 0;
        }

        .form-actions {
          display: flex;
          gap: var(--space-2);
          margin-top: var(--space-4);
        }

        .chip-section {
          padding: 0 var(--space-5);
          margin-bottom: var(--space-4);
        }

        .res-list-wrap {
          padding: 0 var(--space-5);
        }

        .res-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .res-row {
          display: flex;
          gap: var(--space-3);
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

        .res-ic.cat-power { background: var(--grad-accent); }
        .res-ic.cat-water { background: linear-gradient(135deg, #6FA8D8, #3E6C9E 65%, #274670); }
        .res-ic.cat-tools { background: var(--grad-cool); }
        .res-ic.cat-firstaid { background: var(--grad-danger); }
        .res-ic.cat-transport { background: var(--grad-safe); }

        .res-body {
          flex: 1;
          min-width: 0;
        }

        .res-body .name {
          font-weight: 600;
          font-size: var(--text-md);
        }

        .res-body .owner {
          font-size: var(--text-sm);
          color: var(--ink-soft);
          margin-top: var(--space-1);
        }

        .res-foot {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: var(--space-3);
          gap: var(--space-2);
        }

        .dist {
          font-size: var(--text-xs);
          color: var(--ink-soft);
        }

        @media (min-width: 900px) {
          .topbar {
            padding: var(--space-6) 44px var(--space-4);
            flex-wrap: nowrap;
          }

          .topbar .brand {
            display: none;
          }

          .board-head,
          .board-search,
          .chip-section,
          .res-list-wrap {
            padding-left: 44px;
            padding-right: 44px;
          }

          .add-form {
            margin-left: 44px;
            margin-right: 44px;
            max-width: 560px;
          }

          .res-list {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: var(--space-4);
          }
        }

        @media (max-width: 560px) {
          .topbar-right .brgy-pill {
            display: none;
          }
        }
      `}</style>
    </PageContainer>
  );
}
