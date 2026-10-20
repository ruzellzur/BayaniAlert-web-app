import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input } from '../components/ui';
import { PageContainer, Section } from '../components/layout/PageContainer';

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
    <PageContainer>
      {/* Topbar */}
      <div className="dir-topbar">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/profile')}
          aria-label="Go back"
        >
          ←
        </Button>
        <h2>Barangay hotlines</h2>
      </div>

      {/* Search */}
      <Input
        placeholder="Search contacts…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Barangay Officials */}
      <Section title="Barangay officials">
        <Card padding="md">
          {filteredOfficials.map((official, i) => (
            <ContactItem
              key={i}
              contact={official}
              isLast={i === filteredOfficials.length - 1}
            />
          ))}
        </Card>
      </Section>

      {/* Emergency Services */}
      <Section title="Emergency services">
        <Card padding="md">
          {filteredEmergency.map((service, i) => (
            <ContactItem
              key={i}
              contact={service}
              isLast={i === filteredEmergency.length - 1}
            />
          ))}
        </Card>
      </Section>
    </PageContainer>
  );
}

function ContactItem({ contact, isLast }) {
  return (
    <div className={`contact-item ${isLast ? 'last' : ''}`}>
      <span
        className="contact-avatar"
        style={{
          background: contact.isEmergency ? 'var(--danger-bg)' : 'var(--grad-cool)',
          color: contact.isEmergency ? 'var(--danger)' : '#fff',
        }}
      >
        {contact.initials}
      </span>
      <div className="contact-info">
        <div className="contact-name">{contact.name}</div>
        <div className="contact-role">{contact.role}</div>
      </div>
      <button
        className="contact-call"
        onClick={() => alert(`Would dial ${contact.phone}`)}
        aria-label={`Call ${contact.phone}`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 2 .7 3a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.2-1.3a2 2 0 0 1 2.1-.5c1 .4 2 .6 3 .7a2 2 0 0 1 1.7 2Z"/>
        </svg>
      </button>

      <style>{`
        .dir-topbar {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-2) 0 var(--space-4);
        }
        .dir-topbar h2 {
          font-size: var(--text-lg);
          font-weight: 600;
          margin: 0;
        }
        .contact-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) 0;
          border-top: 1px solid var(--border);
        }
        .contact-item.last {
          border-top: none;
          padding-bottom: 0;
        }
        .contact-item:first-child {
          border-top: none;
          padding-top: 0;
        }
        .contact-avatar {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-weight: 600;
          font-size: var(--text-base);
          flex-shrink: 0;
        }
        .contact-info {
          flex: 1;
          min-width: 0;
        }
        .contact-name {
          font-weight: 600;
          font-size: var(--text-sm);
        }
        .contact-role {
          font-size: var(--text-xs);
          color: var(--ink-soft);
          margin-top: var(--space-1);
        }
        .contact-call {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          background: var(--surface);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--ink-soft);
          transition: all var(--duration-fast);
          flex-shrink: 0;
        }
        .contact-call:hover {
          background: var(--surface-alt);
          color: var(--primary);
        }
        .contact-call svg {
          width: 18px;
          height: 18px;
        }
      `}</style>
    </div>
  );
}
