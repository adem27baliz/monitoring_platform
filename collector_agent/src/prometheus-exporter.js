const client = require('prom-client');
const express = require('express');

// ── Registry ──────────────────────────────────────────────────────────────────
const register = new client.Registry();
register.setDefaultLabels({ agent_id: process.env.AGENT_ID || 'agent-1' });
client.collectDefaultMetrics({ register });

// ── Gauge Definitions ─────────────────────────────────────────────────────────

const cpuUsage = new client.Gauge({
  name: 'system_cpu_usage_percent',
  help: 'Current CPU usage percentage',
  registers: [register],
});

const cpuCoreUsage = new client.Gauge({
  name: 'system_cpu_core_usage_percent',
  help: 'Per-core CPU usage percentage',
  labelNames: ['core'],
  registers: [register],
});

const memoryUsed = new client.Gauge({
  name: 'system_memory_used_bytes',
  help: 'Used memory in bytes',
  registers: [register],
});

const memoryFree = new client.Gauge({
  name: 'system_memory_free_bytes',
  help: 'Free memory in bytes',
  registers: [register],
});

const memoryUsagePercent = new client.Gauge({
  name: 'system_memory_usage_percent',
  help: 'Memory usage percentage',
  registers: [register],
});

const diskReadBps = new client.Gauge({
  name: 'system_disk_read_bytes_per_second',
  help: 'Disk read bytes per second',
  registers: [register],
});

const diskWriteBps = new client.Gauge({
  name: 'system_disk_write_bytes_per_second',
  help: 'Disk write bytes per second',
  registers: [register],
});

const networkRxBps = new client.Gauge({
  name: 'system_network_rx_bytes_per_second',
  help: 'Network received bytes per second',
  labelNames: ['interface'],
  registers: [register],
});

const networkTxBps = new client.Gauge({
  name: 'system_network_tx_bytes_per_second',
  help: 'Network transmitted bytes per second',
  labelNames: ['interface'],
  registers: [register],
});

const networkRxErrors = new client.Gauge({
  name: 'system_network_rx_errors_total',
  help: 'Total network receive errors',
  labelNames: ['interface'],
  registers: [register],
});

// ── Update Function ───────────────────────────────────────────────────────────

/**
 * Updates all Prometheus gauges from a collected metrics payload.
 * @param {Object} metrics - Output from collector.js collectMetrics()
 */
function updatePrometheusMetrics(metrics) {
  // CPU
  cpuUsage.set(metrics.cpu.usagePercent);
  metrics.cpu.cores.forEach(({ core, usagePercent }) => {
    cpuCoreUsage.labels(String(core)).set(usagePercent);
  });

  // Memory
  memoryUsed.set(metrics.memory.usedBytes);
  memoryFree.set(metrics.memory.freeBytes);
  memoryUsagePercent.set(metrics.memory.usagePercent);

  // Disk
  diskReadBps.set(metrics.disk.readBytesPerSec);
  diskWriteBps.set(metrics.disk.writeBytesPerSec);

  // Network
  metrics.network.forEach((iface) => {
    networkRxBps.labels(iface.interface).set(iface.rxBytesPerSec);
    networkTxBps.labels(iface.interface).set(iface.txBytesPerSec);
    networkRxErrors.labels(iface.interface).set(iface.rxErrors);
  });
}

// ── HTTP Server ───────────────────────────────────────────────────────────────

/**
 * Starts an Express server exposing the /metrics endpoint for Prometheus scraping.
 */
function startPrometheusServer() {
  const app = express();
  const port = parseInt(process.env.PROMETHEUS_PORT || '9100', 10);
  const path = process.env.PROMETHEUS_PATH || '/metrics';

  app.get(path, async (req, res) => {
    try {
      res.set('Content-Type', register.contentType);
      res.end(await register.metrics());
    } catch (err) {
      res.status(500).end(err.message);
    }
  });

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
  });

  app.listen(port, () => {
    console.log(`[Prometheus] Exporter running at http://0.0.0.0:${port}${path}`);
  });
}

module.exports = { updatePrometheusMetrics, startPrometheusServer };
