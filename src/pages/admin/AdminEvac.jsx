import { useApp } from '../../context/app-context';

export default function AdminEvac() {
  const { evacCenters, updateEvacCenter, showToast } = useApp();

  const cycleAmenityStatus = (centerIndex, amenityIndex) => {
    const center = evacCenters[centerIndex];
    if (!center) return;

    const amenity = center.amenities[amenityIndex];
    const statuses = ['Available', 'Limited', 'Unavailable'];
    const currentIndex = statuses.indexOf(amenity.status);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];

    const newAmenities = [...center.amenities];
    newAmenities[amenityIndex] = { ...amenity, status: nextStatus };

    updateEvacCenter(centerIndex, { amenities: newAmenities });
    showToast(`${amenity.name}: ${nextStatus}`);
  };

  const amenityColors = {
    Available: 'var(--safe)',
    Limited: 'var(--accent)',
    Unavailable: 'var(--danger)'
  };

  return (
    <div className="screen-enter">
      {/* Header */}
      <div className="admin-head">
        <h2>Evacuation Centers</h2>
        <p>Manage evacuation center capacity and status.</p>
      </div>

      <div className="stack">
        {evacCenters.map((center, i) => (
          <div key={i} className="card">
            <div style={{ fontWeight: 600, fontSize: 15 }}>{center.name}</div>
            <div className="muted small" style={{ marginTop: 2 }}>{center.addr}</div>

            {/* Capacity Bar */}
            <div className="cap-bar" style={{ marginTop: 14 }}>
              <div
                className="cap-fill"
                style={{
                  width: `${(center.cap / center.max) * 100}%`,
                  background: center.cap / center.max > 0.9 ? 'var(--grad-danger)' : 'var(--grad-safe)'
                }}
              ></div>
            </div>

            <div className="row between" style={{ marginTop: 8 }}>
              <span className="small muted">Capacity: {center.cap} / {center.max}</span>
            </div>

            {/* Amenities */}
            <div className="section-label" style={{ marginTop: 12, marginBottom: 6 }}>
              <h3 style={{ fontSize: 13 }}>On-site amenities</h3>
            </div>
            <div className="amenity-tags">
              {center.amenities.map((amenity, ai) => (
                <span
                  key={ai}
                  className="tag amenity-tag"
                  onClick={() => cycleAmenityStatus(i, ai)}
                  style={{
                    background: `${amenityColors[amenity.status]}20`,
                    color: amenityColors[amenity.status]
                  }}
                >
                  {amenity.name} · {amenity.status}
                </span>
              ))}
            </div>
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
