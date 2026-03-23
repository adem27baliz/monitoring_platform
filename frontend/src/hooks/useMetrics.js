import { useState, useEffect, useRef } from 'react';
import { api, getSocket } from '../services/api';

const MAX_POINTS = 50; // max data points to keep per chart

export function useMetrics(agentId) {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const bufferRef = useRef([]);

  // Load historical metrics on mount or agent change
  useEffect(() => {
    if (!agentId) return;

    setLoading(true);
    const from = Date.now() - 10 * 60 * 1000; // last 10 minutes
    const to = Date.now();

    api
      .getMetricsByTimeRange(from, to, agentId)
      .then((data) => {
        const points = data.map(toChartPoint);
        bufferRef.current = points.slice(-MAX_POINTS);
        setMetrics([...bufferRef.current]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [agentId]);

  // Stream live metrics via WebSocket
  useEffect(() => {
    const socket = getSocket();

    const handler = (payload) => {
      if (agentId && payload.agentId !== agentId) return;

      const point = toChartPoint(payload);
      bufferRef.current = [...bufferRef.current, point].slice(-MAX_POINTS);
      setMetrics([...bufferRef.current]);
    };

    socket.on('metric', handler);
    return () => socket.off('metric', handler);
  }, [agentId]);

  return { metrics, loading };
}

function toChartPoint(m) {
  const network = m.network || [];
  return {
    time: new Date(Number(m.timestamp)).toLocaleTimeString(),
    timestamp: Number(m.timestamp),
    cpu: m.cpuUsagePercent ?? m.cpu?.usagePercent ?? 0,
    memory: m.memoryUsagePercent ?? m.memory?.usagePercent ?? 0,
    diskRead: m.diskReadBps ?? m.disk?.readBytesPerSec ?? 0,
    diskWrite: m.diskWriteBps ?? m.disk?.writeBytesPerSec ?? 0,
    networkRx: m.networkRxBps ?? network.reduce((s, n) => s + (n.rxBytesPerSec || 0), 0),
    networkTx: m.networkTxBps ?? network.reduce((s, n) => s + (n.txBytesPerSec || 0), 0),
  };
}
