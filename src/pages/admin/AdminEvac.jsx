import { useApp } from '../../context/AppContext';
import PageContainer from '../../components/layout/PageContainer';

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
    <PageContainer>
      <div className="screen-head">
        <h2>Evacuation Centers</h2>
        <p className="sub">Manage evacuation center capacity and status.</p>
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
            <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
              {center.amenities.map((amenity, ai) => (
                <span
                  key={ai}
                  className="tag"
                  onClick={() => cycleAmenityStatus(i, ai)}
                  style={{
                    background: `${amenityColors[amenity.status]}20`,
                    color: amenityColors[amenity.status],
                    cursor: 'pointer'
                  }}
                >
                  {amenity.name} · {amenity.status}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
