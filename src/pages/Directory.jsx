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
    <div className="screen-enter" style={{ padding: '2px 20px 100px' }}>
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
        placeholder="Search contacts…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: '100%',
          marginBottom: 14,
          padding: '11px 14px',
          borderRadius: 12,
          border: '1.5px solid var(--border)',
          background: 'var(--surface)',
          color: 'var(--ink)',
          fontFamily: 'var(--font-body)',
          fontSize: '13.5px'
        }}
      />

      {/* Barangay Officials */}
      <div className="section-label" style={{ marginTop: 0 }}>
        <h3>Barangay officials</h3>
      </div>
      <div className="card" style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 0 }}>
        {filteredOfficials.map((official, i) => (
          <div key={i} className="dir-item" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 0',
            borderTop: i > 0 ? '1px solid var(--border)' : 'none'
          }}>
            <span className="avatar" style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'var(--grad-cool)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: 14,
              flexShrink: 0
            }}>
              {official.initials}
            </span>
            <div className="info" style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '13.5px' }}>{official.name}</div>
              <div className="small muted">{official.role}</div>
            </div>
            <button className="dir-call" onClick={() => alert(`Would dial ${official.phone}`)} aria-label={`Call ${official.phone}`} style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--ink-soft)'
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 2 .7 3a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.2-1.3a2 2 0 0 1 2.1-.5c1 .4 2 .6 3 .7a2 2 0 0 1 1.7 2Z"/>
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Emergency Services */}
      <div className="section-label" style={{ marginTop: 0 }}>
        <h3>Emergency services</h3>
      </div>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {filteredEmergency.map((service, i) => (
          <div key={i} className="dir-item" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 0',
            borderTop: i > 0 ? '1px solid var(--border)' : 'none'
          }}>
            <span className="avatar" style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: service.isEmergency ? 'var(--danger-bg)' : 'var(--grad-cool)',
              color: service.isEmergency ? 'var(--danger)' : '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: 14,
              flexShrink: 0
            }}>
              {service.initials}
            </span>
            <div className="info" style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '13.5px' }}>{service.name}</div>
              <div className="small muted">{service.role}</div>
            </div>
            <button className="dir-call" onClick={() => alert(`Would dial ${service.phone}`)} aria-label={`Call ${service.phone}`} style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--ink-soft)'
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 2 .7 3a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.2-1.3a2 2 0 0 1 2.1-.5c1 .4 2 .6 3 .7a2 2 0 0 1 1.7 2Z"/>
              </svg>
            </button>
          </div>
        ))}
      </div>

      <style>{`
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 18px 20px 14px;
        }

        @media (min-width: 900px) {
          .mobile-back {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
