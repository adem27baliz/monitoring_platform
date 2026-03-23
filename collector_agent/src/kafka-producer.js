const { Kafka, Partitioners } = require('kafkajs');

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || 'collector-agent',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
  retry: {
    initialRetryTime: 300,
    retries: 10,
  },
});

const producer = kafka.producer({
  createPartitioner: Partitioners.LegacyPartitioner,
});

let connected = false;

/**
 * Connects the Kafka producer. Safe to call multiple times.
 */
async function connect() {
  if (connected) return;
  await producer.connect();
  connected = true;
  console.log('[Kafka] Producer connected');
}

/**
 * Sends a metrics payload to the configured Kafka topic.
 * @param {Object} metrics - The metrics object from collector.js
 */
async function sendMetrics(metrics) {
  const topic = process.env.KAFKA_TOPIC_METRICS || 'metrics';

  await producer.send({
    topic,
    messages: [
      {
        key: metrics.agentId,
        value: JSON.stringify(metrics),
        headers: {
          source: 'collector-agent',
          version: '1.0.0',
        },
      },
    ],
  });
}

/**
 * Gracefully disconnects the Kafka producer.
 */
async function disconnect() {
  if (!connected) return;
  await producer.disconnect();
  connected = false;
  console.log('[Kafka] Producer disconnected');
}

module.exports = { connect, sendMetrics, disconnect };
