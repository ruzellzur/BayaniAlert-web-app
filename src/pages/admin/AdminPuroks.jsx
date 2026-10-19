import { useApp } from '../../context/AppContext';

export default function AdminPuroks() {
  const { puroks } = useApp();

  const totalHouseholds = puroks.reduce((sum, p) => sum + p.households, 0);
  const totalOfficials = puroks.reduce((sum, p) => sum + p.officials, 0);

  return (
    <div className="screen-enter" style={{ padding: '2px 20px 100px' }}>
      {/* Topbar */}
      <div className="topbar">
        <h2 style={{ fontSize: 20 }}>Puroks / Zones</h2>
      </div>

      <div className="screen-head">
        <p className="sub">Manage barangay zones and view statistics.</p>
      </div>

      {/* Summary */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="stat-trio">
          <div>
            <div className="n" style={{ color: 'var(--accent)' }}>{puroks.length}</div>
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

        @media (min-width: 900px) {
          .topbar {
            padding: 26px 0 20px;
          }
        }
      `}</style>
    </div>
  );
}
