import { useApp } from '../../context/app-context';

export default function AdminPuroks() {
  const { puroks } = useApp();

  const totalHouseholds = puroks.reduce((sum, p) => sum + p.households, 0);
  const totalOfficials = puroks.reduce((sum, p) => sum + p.officials, 0);

  return (
    <div className="screen-enter">
      {/* Header */}
      <div className="admin-head">
        <h2>Puroks / Zones</h2>
        <p>Manage barangay zones and view statistics.</p>
      </div>

      {/* Summary */}
      <div className="admin-stat-grid">
        <div className="admin-stat accent">
          <div className="n">{puroks.length}</div>
          <div className="l">Puroks</div>
        </div>
        <div className="admin-stat safe">
          <div className="n">{totalHouseholds}</div>
          <div className="l">Households</div>
        </div>
        <div className="admin-stat cool">
          <div className="n">{totalOfficials}</div>
          <div className="l">Officials</div>
        </div>
      </div>

      {/* Purok List */}
      <div className="card admin-list">
        {puroks.map((purok) => (
          <div key={purok.id} className="list-item">
            <div>
              <div style={{ fontWeight: 600 }}>{purok.name}</div>
              <div className="small muted" style={{ marginTop: 2 }}>
                {purok.households} households · {purok.officials} officials
              </div>
            </div>
            <button className="btn btn-ghost btn-sm">Manage</button>
          </div>
        ))}
      </div>

      <style>{`
        .admin-head {
          text-align: center;
          padding: 8px 0 22px;
        }
        .admin-head h2 {
          font-size: 24px;
          font-weight: 600;
        }
        .admin-head p {
          color: var(--ink-soft);
          font-size: 13.5px;
          margin-top: 6px;
        }
        .admin-stat-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 18px;
        }
        .admin-stat {
          position: relative;
          overflow: hidden;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 18px;
          padding: 18px 10px;
          text-align: center;
          box-shadow: var(--card-shadow);
          transition: transform 0.22s var(--ease), box-shadow 0.22s ease;
        }
        .admin-stat::after {
          content: "";
          position: absolute;
          top: -24px;
          right: -24px;
          width: 72px;
          height: 72px;
          border-radius: 50%;
          opacity: 0.16;
        }
        .admin-stat.accent::after { background: var(--accent); }
        .admin-stat.safe::after { background: var(--safe); }
        .admin-stat.cool::after { background: var(--cool); }
        .admin-stat .n {
          position: relative;
          font-family: var(--font-display);
          font-size: 28px;
          font-weight: 600;
          line-height: 1.1;
        }
        .admin-stat.accent .n { color: var(--accent); }
        .admin-stat.safe .n { color: var(--safe); }
        .admin-stat.cool .n { color: var(--cool); }
        .admin-stat .l {
          position: relative;
          font-size: 11px;
          color: var(--ink-soft);
          font-weight: 700;
          margin-top: 5px;
        }
        @media (hover: hover) {
          .admin-stat:hover {
            transform: translateY(-4px);
            box-shadow: 0 16px 32px -12px rgba(21,35,61,0.3);
          }
        }
        .admin-list { padding: 4px 16px; }
        .amenity-tags { display: flex; flex-wrap: wrap; gap: 7px; }
        .amenity-tag {
          cursor: pointer;
          transition: transform 0.18s var(--ease), box-shadow 0.18s ease;
        }
        @media (hover: hover) {
          .amenity-tag:hover { transform: translateY(-2px) scale(1.04); box-shadow: var(--card-shadow); }
        }

      `}</style>
    </div>
  );
}
