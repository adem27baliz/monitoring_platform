require('dotenv').config();

const { collectMetrics } = require('./collector');
const { connect, sendMetrics, disconnect } = require('./kafka-producer');
const { updatePrometheusMetrics, startPrometheusServer } = require('./prometheus-exporter');

const INTERVAL_MS = parseInt(process.env.COLLECT_INTERVAL_MS || '5000', 10);

let isRunning = false;
let collectionTimer = null;

// ── Main Collection Loop ──────────────────────────────────────────────────────

async function runCollectionCycle() {
  try {
    const metrics = await collectMetrics();

    // 1. Send to Kafka
    await sendMetrics(metrics);

    // 2. Update Prometheus gauges
    updatePrometheusMetrics(metrics);

    console.log(
      `[Agent] Collected metrics | CPU: ${metrics.cpu.usagePercent}% | ` +
      `MEM: ${metrics.memory.usagePercent}% | ` +
      `DISK R/W: ${metrics.disk.readBytesPerSec}/${metrics.disk.writeBytesPerSec} B/s | ` +
      `ts: ${metrics.timestamp}`
    );
  } catch (err) {
    console.error('[Agent] Collection cycle error:', err.message);
  }
}

// ── Startup ───────────────────────────────────────────────────────────────────

async function start() {
  console.log('[Agent] Starting collector agent...');
  console.log(`[Agent] Collect interval: ${INTERVAL_MS}ms`);

  // Connect to Kafka
  await connect();

  // Start Prometheus HTTP server
  startPrometheusServer();

  // Run first cycle immediately, then on interval
  isRunning = true;
  await runCollectionCycle();
  collectionTimer = setInterval(runCollectionCycle, INTERVAL_MS);

  console.log('[Agent] Collection loop started');
}

// ── Graceful Shutdown ─────────────────────────────────────────────────────────

async function shutdown(signal) {
  if (!isRunning) return;
  isRunning = false;

  console.log(`\n[Agent] Received ${signal}. Shutting down gracefully...`);

  if (collectionTimer) {
    clearInterval(collectionTimer);
  }

  await disconnect();
  console.log('[Agent] Shutdown complete.');
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', (reason) => {
  console.error('[Agent] Unhandled rejection:', reason);
});

// ── Boot ──────────────────────────────────────────────────────────────────────
start().catch((err) => {
  console.error('[Agent] Fatal startup error:', err);
  process.exit(1);
});
