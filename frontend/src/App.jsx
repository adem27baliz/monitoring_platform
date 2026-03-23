import { useState } from 'react';
import AgentSelector from './components/AgentSelector';
import MetricsGrid from './components/MetricsGrid';
import StatsCards from './components/StatsCards';
import AnomalyFeed from './components/AnomalyFeed';
import { useMetrics } from './hooks/useMetrics';
import { useAnomalies } from './hooks/useAnomalies';

export default function App() {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const { metrics, loading: metricsLoading } = useMetrics(selectedAgent);
  const { anomalies, stats, loading: anomaliesLoading } = useAnomalies();

  return (
    <div style={styles.app}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logo}>
            <span style={styles.logoDot} />
            <span style={styles.logoText}>AI Monitor</span>
          </div>
          <span style={styles.subtitle}>Anomaly Detection Platform</span>
        </div>
        <AgentSelector selected={selectedAgent} onSelect={setSelectedAgent} />
      </header>

      {/* Main content */}
      <main style={styles.main}>
        {/* Stats row */}
        <section>
          <h2 style={styles.sectionTitle}>Anomaly overview</h2>
          <StatsCards stats={stats} loading={anomaliesLoading} />
        </section>

        {/* Metrics charts */}
        <section>
          <h2 style={styles.sectionTitle}>
            Live metrics
            {selectedAgent && (
              <span style={styles.agentTag}>{selectedAgent}</span>
            )}
          </h2>
          <MetricsGrid metrics={metrics} loading={metricsLoading} />
        </section>

        {/* Anomaly feed */}
        <section>
          <h2 style={styles.sectionTitle}>Recent anomalies</h2>
          <AnomalyFeed anomalies={anomalies} loading={anomaliesLoading} />
        </section>
      </main>
    </div>
  );
}

const styles = {
  app: {
    minHeight: '100vh',
    background: '#030712',
    color: '#f9fafb',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 32px',
    borderBottom: '1px solid #111827',
    background: '#030712',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  logoDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: '#3b82f6',
    boxShadow: '0 0 8px #3b82f6',
  },
  logoText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#f9fafb',
  },
  subtitle: {
    fontSize: 12,
    color: '#4b5563',
    borderLeft: '1px solid #1f2937',
    paddingLeft: 16,
  },
  main: {
    maxWidth: 1400,
    margin: '0 auto',
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    gap: 40,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 500,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  agentTag: {
    fontSize: 11,
    fontWeight: 400,
    background: '#1f2937',
    color: '#9ca3af',
    padding: '2px 8px',
    borderRadius: 4,
    textTransform: 'none',
    letterSpacing: 0,
  },
};
