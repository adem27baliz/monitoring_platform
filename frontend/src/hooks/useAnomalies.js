import { useState, useEffect } from 'react';
import { api, getSocket } from '../services/api';

export function useAnomalies() {
  const [anomalies, setAnomalies] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load recent anomalies and stats on mount
  useEffect(() => {
    Promise.all([api.getAnomalies(50), api.getAnomalyStats()])
      .then(([list, s]) => {
        setAnomalies(list);
        setStats(s);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Stream live anomalies via WebSocket
  useEffect(() => {
    const socket = getSocket();

    const handler = (payload) => {
      setAnomalies((prev) => [payload, ...prev].slice(0, 50));
      // Update stats counters live
      setStats((prev) =>
        prev
          ? {
              ...prev,
              total: prev.total + 1,
              last24h: prev.last24h + 1,
              byConfidence: {
                ...prev.byConfidence,
                [payload.confidence]: (prev.byConfidence?.[payload.confidence] || 0) + 1,
              },
            }
          : prev,
      );
    };

    socket.on('anomaly', handler);
    return () => socket.off('anomaly', handler);
  }, []);

  return { anomalies, stats, loading };
}
