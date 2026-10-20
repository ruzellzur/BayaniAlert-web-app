import { useNavigate } from 'react-router-dom';
import { Button, Card } from '../components/ui';
import { PageContainer, Section } from '../components/layout/PageContainer';

export default function WeatherHistory() {
  const navigate = useNavigate();

  const forecast = [
    { time: 'Now', temp: '28°' },
    { time: '7PM', temp: '27°' },
    { time: '8PM', temp: '26°' },
    { time: '9PM', temp: '26°' },
    { time: '10PM', temp: '25°' },
    { time: '11PM', temp: '25°' },
  ];

  const history = [
    { badge: 'S2', label: 'Signal No. 2 raised', time: 'Today · 6:40 PM — 65 km/h winds', active: true },
    { badge: 'S1', label: 'Signal No. 1 raised', time: 'Today · 2:15 PM — 45 km/h winds', active: false },
    { badge: 'ADV', label: 'Heavy rainfall advisory', time: 'Yesterday · 9:00 AM', active: false },
  ];

  return (
    <PageContainer>
      {/* Topbar */}
      <div className="weather-topbar">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/home')}
          aria-label="Go back"
        >
          ←
        </Button>
        <h2>Weather &amp; alerts</h2>
      </div>

      {/* Next 6 Hours Forecast */}
      <Section title="Next 6 hours">
        <div className="forecast-strip">
          {forecast.map((f, i) => (
            <div key={i} className="forecast-cell">
              <div className="forecast-time">{f.time}</div>
              <div className="forecast-temp">{f.temp}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Advisory History */}
      <Section title="Advisory history">
        <Card padding="md">
          {history.map((item, i) => (
            <HistoryItem key={i} item={item} isLast={i === history.length - 1} />
          ))}
        </Card>
      </Section>

      <style>{`
        .weather-topbar {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-2) 0 var(--space-2);
        }
        .weather-topbar h2 {
          font-size: var(--text-lg);
          font-weight: 600;
          margin: 0;
        }
        .forecast-strip {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: var(--space-2);
        }
        .forecast-cell {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: var(--space-2) var(--space-1);
          text-align: center;
          transition: all var(--duration-fast);
        }
        .forecast-cell:hover {
          border-color: var(--primary);
          box-shadow: var(--elevation-1);
        }
        .forecast-time {
          font-size: var(--text-xs);
          color: var(--ink-soft);
          margin-bottom: var(--space-1);
        }
        .forecast-temp {
          font-weight: 600;
          font-size: var(--text-base);
        }
        @media (max-width: 560px) {
          .forecast-strip {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>
    </PageContainer>
  );
}

function HistoryItem({ item, isLast }) {
  return (
    <div className={`history-item ${isLast ? 'last' : ''}`}>
      <span
        className="history-badge"
        style={{
          background: item.active ? 'var(--accent)' : 'var(--surface-alt)',
          color: item.active ? 'var(--accent-ink)' : 'var(--ink-soft)'
        }}
      >
        {item.badge}
      </span>
      <div className="history-info">
        <div className="history-label">{item.label}</div>
        <div className="history-time">{item.time}</div>
      </div>

      <style>{`
        .history-item {
          display: flex;
          gap: var(--space-3);
          padding: var(--space-3) 0;
          border-top: 1px solid var(--border);
        }
        .history-item.last {
          border-top: none;
        }
        .history-item:first-child {
          border-top: none;
          padding-top: 0;
        }
        .history-badge {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--text-xs);
          font-weight: 700;
          flex-shrink: 0;
        }
        .history-info {
          flex: 1;
        }
        .history-label {
          font-weight: 600;
          font-size: var(--text-sm);
        }
        .history-time {
          font-size: var(--text-xs);
          color: var(--ink-soft);
          margin-top: var(--space-1);
        }
      `}</style>
    </div>
  );
}
