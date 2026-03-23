import { io } from 'socket.io-client';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';

// ── REST API ──────────────────────────────────────────────────────────────────

async function get(path) {
  const res = await fetch(`${BASE_URL}/api${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  getAgents: () => get('/metrics/agents'),
  getLatestMetrics: (agentId) =>
    get(`/metrics/latest${agentId ? `?agentId=${agentId}` : ''}`),
  getMetricsByTimeRange: (from, to, agentId) =>
    get(`/metrics?from=${from}&to=${to}${agentId ? `&agentId=${agentId}` : ''}`),
  getMetricsByAgent: (agentId, limit = 100) =>
    get(`/metrics/agent?agentId=${agentId}&limit=${limit}`),
  getAnomalies: (limit = 50, confidence) =>
    get(`/anomalies?limit=${limit}${confidence ? `&confidence=${confidence}` : ''}`),
  getAnomalyStats: () => get('/anomalies/stats'),
};

// ── WebSocket ─────────────────────────────────────────────────────────────────

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(`${WS_URL}/live`, {
      transports: ['websocket'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => console.log('[WS] Connected'));
    socket.on('disconnect', () => console.log('[WS] Disconnected'));
    socket.on('connect_error', (e) => console.warn('[WS] Error:', e.message));
  }
  return socket;
}
