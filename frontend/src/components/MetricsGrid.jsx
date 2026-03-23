import MetricChart from './MetricChart';

const CHARTS = [
  { title: 'CPU Usage', dataKey: 'cpu', color: '#3b82f6', unit: '%' },
  { title: 'Memory Usage', dataKey: 'memory', color: '#8b5cf6', unit: '%' },
  { title: 'Disk Read', dataKey: 'diskRead', color: '#10b981', unit: ' B/s' },
  { title: 'Network RX', dataKey: 'networkRx', color: '#f59e0b', unit: ' B/s' },
];

export default function MetricsGrid({ metrics, loading }) {
  if (loading) {
    return (
      <div style={styles.grid}>
        {CHARTS.map((c) => (
          <div key={c.dataKey} style={styles.skeleton} />
        ))}
      </div>
    );
  }

  return (
    <div style={styles.grid}>
      {CHARTS.map((c) => (
        <MetricChart
          key={c.dataKey}
          title={c.title}
          data={metrics}
          dataKey={c.dataKey}
          color={c.color}
          unit={c.unit}
        />
      ))}
    </div>
  );
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 16,
  },
  skeleton: {
    background: '#111827',
    borderRadius: 12,
    height: 220,
    border: '1px solid #1f2937',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
};
