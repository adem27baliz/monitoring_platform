const CONFIDENCE_COLORS = {
  HIGH: '#ef4444',
  MEDIUM: '#f59e0b',
  LOW: '#6b7280',
  NONE: '#374151',
};

export default function AnomalyFeed({ anomalies, loading }) {
  if (loading) {
    return <div style={styles.card}><span style={styles.empty}>Loading...</span></div>;
  }

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={styles.title}>Anomaly feed</span>
        <span style={styles.count}>{anomalies.length} events</span>
      </div>

      {anomalies.length === 0 ? (
        <div style={styles.empty}>No anomalies detected yet</div>
      ) : (
        <div style={styles.list}>
          {anomalies.map((a, i) => (
            <div key={i} style={styles.item}>
              <div style={styles.itemLeft}>
                <span
                  style={{
                    ...styles.confidenceDot,
                    background: CONFIDENCE_COLORS[a.confidence] || '#374151',
                  }}
                />
                <div style={styles.itemInfo}>
                  <span style={styles.agentId}>{a.agentId}</span>
                  <span style={styles.time}>
                    {new Date(Number(a.timestamp)).toLocaleTimeString()}
                  </span>
                </div>
              </div>
              <div style={styles.itemRight}>
                <span
                  style={{
                    ...styles.confidenceBadge,
                    color: CONFIDENCE_COLORS[a.confidence] || '#374151',
                    borderColor: CONFIDENCE_COLORS[a.confidence] || '#374151',
                  }}
                >
                  {a.confidence}
                </span>
                <span style={styles.score}>score: {a.score}</span>
              </div>
              <div style={styles.metricsRow}>
                <span style={styles.metricPill}>CPU {a.metrics?.cpu?.toFixed(1) ?? a.cpuPercent?.toFixed(1)}%</span>
                <span style={styles.metricPill}>MEM {a.metrics?.memory?.toFixed(1) ?? a.memoryPercent?.toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    background: '#111827',
    borderRadius: 12,
    padding: '16px 20px',
    border: '1px solid #1f2937',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 13,
    fontWeight: 500,
    color: '#d1d5db',
  },
  count: {
    fontSize: 12,
    color: '#6b7280',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    maxHeight: 400,
    overflowY: 'auto',
  },
  item: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    padding: '10px 14px',
    background: '#0f172a',
    borderRadius: 8,
    border: '1px solid #1e293b',
  },
  itemLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  confidenceDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
  },
  itemInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  agentId: {
    fontSize: 13,
    fontWeight: 500,
    color: '#e2e8f0',
  },
  time: {
    fontSize: 11,
    color: '#64748b',
  },
  itemRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  confidenceBadge: {
    fontSize: 11,
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: 4,
    border: '1px solid',
  },
  score: {
    fontSize: 11,
    color: '#64748b',
  },
  metricsRow: {
    display: 'flex',
    gap: 6,
    width: '100%',
  },
  metricPill: {
    fontSize: 11,
    background: '#1e293b',
    color: '#94a3b8',
    padding: '2px 8px',
    borderRadius: 4,
  },
  empty: {
    color: '#4b5563',
    fontSize: 13,
    textAlign: 'center',
    padding: '32px 0',
  },
};
