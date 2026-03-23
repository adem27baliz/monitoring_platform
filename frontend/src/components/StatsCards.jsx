export default function StatsCards({ stats, loading }) {
  if (loading || !stats) {
    return (
      <div style={styles.row}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={styles.skeleton} />
        ))}
      </div>
    );
  }

  const cards = [
    { label: 'Total anomalies', value: stats.total ?? 0, color: '#6b7280' },
    { label: 'Last 24 hours', value: stats.last24h ?? 0, color: '#3b82f6' },
    { label: 'Avg score', value: parseFloat(stats.avgScore ?? 0).toFixed(3), color: '#8b5cf6' },
    { label: 'High confidence', value: stats.byConfidence?.HIGH ?? 0, color: '#ef4444' },
  ];

  return (
    <div style={styles.row}>
      {cards.map((c) => (
        <div key={c.label} style={styles.card}>
          <span style={{ ...styles.value, color: c.color }}>{c.value}</span>
          <span style={styles.label}>{c.label}</span>
        </div>
      ))}
    </div>
  );
}

const styles = {
  row: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: 16,
  },
  card: {
    background: '#111827',
    borderRadius: 12,
    padding: '20px 24px',
    border: '1px solid #1f2937',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  value: {
    fontSize: 28,
    fontWeight: 700,
    lineHeight: 1,
  },
  label: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: 500,
  },
  skeleton: {
    background: '#111827',
    borderRadius: 12,
    height: 88,
    border: '1px solid #1f2937',
  },
};
