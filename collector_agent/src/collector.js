const si = require('systeminformation');

/**
 * Collects all system metrics: CPU, Memory, Disk I/O, Network traffic.
 * Returns a normalized metrics payload ready to be sent to Kafka.
 */
async function collectMetrics() {
  const [cpu, mem, disk, network, time] = await Promise.all([
    si.currentLoad(),
    si.mem(),
    si.disksIO(),
    si.networkStats(),
    si.time(),
  ]);

  return {
    agentId: process.env.AGENT_ID || 'agent-1',
    hostname: process.env.HOSTNAME || require('os').hostname(),
    timestamp: Date.now(),
    localTime: time.current,

    cpu: {
      usagePercent: parseFloat(cpu.currentLoad.toFixed(2)),
      userPercent: parseFloat(cpu.currentLoadUser.toFixed(2)),
      systemPercent: parseFloat(cpu.currentLoadSystem.toFixed(2)),
      idlePercent: parseFloat(cpu.currentLoadIdle.toFixed(2)),
      cores: cpu.cpus.map((core, i) => ({
        core: i,
        usagePercent: parseFloat(core.load.toFixed(2)),
      })),
    },

    memory: {
      totalBytes: mem.total,
      usedBytes: mem.used,
      freeBytes: mem.free,
      activeBytes: mem.active,
      availableBytes: mem.available,
      usagePercent: parseFloat(((mem.used / mem.total) * 100).toFixed(2)),
      swapTotalBytes: mem.swaptotal,
      swapUsedBytes: mem.swapused,
      swapFreeBytes: mem.swapfree,
    },

    disk: {
      readBytesPerSec: disk.rIO_sec ?? 0,
      writeBytesPerSec: disk.wIO_sec ?? 0,
      totalReadBytes: disk.rIO ?? 0,
      totalWriteBytes: disk.wIO ?? 0,
      transfersPerSec: disk.tIO_sec ?? 0,
    },

    network: network.map((iface) => ({
      interface: iface.iface,
      rxBytesPerSec: iface.rx_sec ?? 0,
      txBytesPerSec: iface.tx_sec ?? 0,
      totalRxBytes: iface.rx_bytes ?? 0,
      totalTxBytes: iface.tx_bytes ?? 0,
      rxDropped: iface.rx_dropped ?? 0,
      txDropped: iface.tx_dropped ?? 0,
      rxErrors: iface.rx_errors ?? 0,
      txErrors: iface.tx_errors ?? 0,
    })),
  };
}

module.exports = { collectMetrics };
