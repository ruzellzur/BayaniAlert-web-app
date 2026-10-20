import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button, Card } from '../components/ui';
import { PageContainer, Section } from '../components/layout/PageContainer';

export default function ResourceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { resources, user } = useApp();

  // Convert string ID from URL to number for matching
  const resourceId = parseInt(id, 10);
  const resource = resources.find(r => r.id === resourceId);

  if (!resource) {
    return (
      <PageContainer>
        <div className="detail-topbar">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/board')}
            aria-label="Go back"
          >
            ←
          </Button>
          <h2>Item details</h2>
        </div>
        <Card padding="lg" style={{ textAlign: 'center', marginTop: 'var(--space-5)' }}>
          <p className="muted">Resource not found</p>
        </Card>
      </PageContainer>
    );
  }

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

  const handleRequest = () => {
    alert('Request sent! The owner will be notified.');
  };

  const handleMessage = () => {
    navigate(`/thread/${id}`);
  };

  const ownerName = resource.owner.split('·')[0].trim();
  const ownerInitials = ownerName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <PageContainer>
      {/* Topbar */}
      <div className="detail-topbar">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/board')}
          aria-label="Go back"
        >
          ←
        </Button>
        <h2>Item details</h2>
      </div>

      {/* Detail Hero */}
      <div className="detail-hero">
        <span className={`res-icon cat-${resource.cat}`}>
          {getCategoryIcon(resource.cat)}
        </span>
        <div>
          <div className="detail-name">{resource.name}</div>
          <div className="detail-dist">{resource.dist} away</div>
        </div>
      </div>

      {/* About Card */}
      <Card padding="md">
        <p className="about-label">About this item</p>
        <p className="about-text">{resource.desc || 'No additional description provided.'}</p>
      </Card>

      {/* Owner Section */}
      <Section title="Shared by">
        <Card padding="md">
          <div className="owner-card">
            <span className="owner-avatar">{ownerInitials}</span>
            <div>
              <div className="owner-name">{ownerName}</div>
              <div className="owner-meta">Member since 2022 · {Math.floor(Math.random() * 20) + 1} items shared</div>
            </div>
          </div>
        </Card>
      </Section>

      {/* Action Buttons */}
      <Button variant="primary" block onClick={handleRequest}>
        Request this item
      </Button>
      <Button variant="ghost" block onClick={handleMessage} style={{ marginTop: 'var(--space-3)' }}>
        Message owner
      </Button>

      <style>{`
        .detail-topbar {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-2) 0;
        }
        .detail-topbar h2 {
          font-size: var(--text-lg);
          font-weight: 600;
          margin: 0;
        }
        .detail-hero {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          padding: var(--space-4) 0;
          margin-bottom: var(--space-2);
        }
        .res-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-lg);
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--grad-cool);
          color: #fff;
        }
        .res-icon svg {
          width: 23px;
          height: 23px;
        }
        .res-icon.cat-power { background: var(--grad-accent); }
        .res-icon.cat-water { background: linear-gradient(135deg, #5FA8D3, #4A90B8); }
        .res-icon.cat-tools { background: linear-gradient(135deg, #7B8794, #5C6370); }
        .res-icon.cat-firstaid { background: linear-gradient(135deg, #E57373, #C1443C); }
        .res-icon.cat-transport { background: linear-gradient(135deg, #81C784, #5FA864); }
        .detail-name {
          font-weight: 600;
          font-size: var(--text-xl);
        }
        .detail-dist {
          font-size: var(--text-sm);
          color: var(--ink-soft);
          margin-top: var(--space-1);
        }
        .about-label {
          font-size: var(--text-sm);
          font-weight: 600;
          margin-bottom: var(--space-2);
        }
        .about-text {
          font-size: var(--text-sm);
          color: var(--ink-soft);
          line-height: 1.6;
        }
        .owner-card {
          display: flex;
          gap: var(--space-3);
          align-items: center;
        }
        .owner-avatar {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-lg);
          background: var(--grad-cool);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-weight: 600;
          font-size: var(--text-base);
          flex-shrink: 0;
        }
        .owner-name {
          font-weight: 600;
          font-size: var(--text-sm);
        }
        .owner-meta {
          font-size: var(--text-xs);
          color: var(--ink-soft);
          margin-top: var(--space-1);
        }
      `}</style>
    </PageContainer>
  );
}
