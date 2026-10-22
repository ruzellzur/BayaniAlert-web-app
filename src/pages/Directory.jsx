import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Directory() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const officials = [
    { initials: 'EL', name: 'Brgy. Captain Elena Lira', role: 'Barangay Captain', phone: '0917 500 1001' },
    { initials: 'MR', name: 'Kagawad Mario Reyes', role: 'Disaster risk reduction', phone: '0917 500 1042' },
  ];

  const emergencyServices = [
    { initials: 'FR', name: 'Fire & Rescue', role: '24/7 hotline', phone: '911', isEmergency: true },
    { initials: 'PN', name: 'Police Station', role: 'Purok 1 outpost', phone: '0917 500 9110' },
  ];

  const filteredOfficials = officials.filter(o =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.role.toLowerCase().includes(search.toLowerCase())
  );

  const filteredEmergency = emergencyServices.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="screen-enter">
      {/* Topbar */}
      <div className="topbar">
        <div className="row" style={{ gap: 12 }}>
          <button className="btn-ghost btn btn-sm mobile-back" onClick={() => navigate('/profile')} aria-label="Go back" style={{ padding: '8px 10px' }}>←</button>
          <h2 style={{ fontSize: 17 }}>Barangay hotlines</h2>
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        className="search-input"
        placeholder="Search contacts…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Barangay Officials */}
      <div className="section-label" style={{ marginTop: 0 }}>
        <h3>Barangay officials</h3>
      </div>
      <div className="card dir-list" style={{ marginBottom: 18 }}>
        {filteredOfficials.length === 0 ? (
          <div className="empty-state">
            <span className="ic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7"/>
                <path d="m20 20-3.5-3.5"/>
              </svg>
            </span>
            <h4>No matches</h4>
            <p>No barangay official matches "{search}".</p>
          </div>
        ) : (
          filteredOfficials.map((official, i) => (
            <div key={i} className="dir-item">
              <span className="avatar">{official.initials}</span>
              <div className="info">
                <div className="nm">{official.name}</div>
                <div className="small muted">{official.role}</div>
              </div>
              <button className="dir-call" onClick={() => alert(`Would dial ${official.phone}`)} aria-label={`Call ${official.phone}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 2 .7 3a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.2-1.3a2 2 0 0 1 2.1-.5c1 .4 2 .6 3 .7a2 2 0 0 1 1.7 2Z"/>
                </svg>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Emergency Services */}
      <div className="section-label" style={{ marginTop: 0 }}>
        <h3>Emergency services</h3>
      </div>
      <div className="card dir-list dir-emergency">
        {filteredEmergency.length === 0 ? (
          <div className="empty-state">
            <span className="ic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7"/>
                <path d="m20 20-3.5-3.5"/>
              </svg>
            </span>
            <h4>No matches</h4>
            <p>No emergency service matches "{search}".</p>
          </div>
        ) : (
          filteredEmergency.map((service, i) => (
            <div key={i} className="dir-item">
              <span className="avatar" style={service.isEmergency ? undefined : { background: 'var(--grad-cool)' }}>
                {service.initials}
              </span>
              <div className="info">
                <div className="nm">{service.name}</div>
                <div className="small muted">{service.role}</div>
              </div>
              <button className="dir-call" onClick={() => alert(`Would dial ${service.phone}`)} aria-label={`Call ${service.phone}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 2 .7 3a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.2-1.3a2 2 0 0 1 2.1-.5c1 .4 2 .6 3 .7a2 2 0 0 1 1.7 2Z"/>
                </svg>
              </button>
            </div>
          ))
        )}
      </div>

      <style>{`
        .dir-group {
          margin-bottom: 18px;
        }
        .dir-list { padding: 4px 16px; }
        .dir-emergency .dir-item .avatar {
          background: var(--grad-danger);
          box-shadow: 0 5px 14px -6px rgba(201,74,61,0.85);
        }
        .dir-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        .dir-card {
          display: flex;
          align-items: center;
          gap: 13px;
        }
        .dir-card .info { flex: 1; min-width: 0; }

        @media (min-width: 760px) {
          .dir-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 900px) {
          .dir-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
        }

      `}</style>
    </div>
  );
}
