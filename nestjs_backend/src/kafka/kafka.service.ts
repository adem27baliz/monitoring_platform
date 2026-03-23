import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import { MetricsService } from '../metrics/metrics.service';
import { AnomaliesService } from '../anomalies/anomalies.service';
import { EventsGateway } from '../websocket/events.gateway';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private consumer: Consumer;

  constructor(
    private readonly metricsService: MetricsService,
    private readonly anomaliesService: AnomaliesService,
    private readonly eventsGateway: EventsGateway,
  ) {
    this.kafka = new Kafka({
      clientId: 'nestjs-backend',
      brokers: (process.env.KAFKA_BROKERS || 'kafka:29092').split(','),
    });

    this.consumer = this.kafka.consumer({
      groupId: process.env.KAFKA_GROUP_ID || 'nestjs-backend',
    });
  }

  async onModuleInit() {
    await this.consumer.connect();
    console.log('[Kafka] Consumer connected');

    await this.consumer.subscribe({
      topics: [
        process.env.KAFKA_TOPIC_METRICS || 'metrics',
        process.env.KAFKA_TOPIC_ANOMALIES || 'anomalies',
      ],
      fromBeginning: false,
    });

    await this.consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        try {
          await this.handleMessage(payload);
        } catch (err) {
          console.error('[Kafka] Message handling error:', err.message);
        }
      },
    });

    console.log('[Kafka] Listening on metrics and anomalies topics');
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
    console.log('[Kafka] Consumer disconnected');
  }

  private async handleMessage({ topic, message }: EachMessagePayload) {
    const raw = message.value?.toString();
    if (!raw) return;

    const payload = JSON.parse(raw);

    if (topic === (process.env.KAFKA_TOPIC_METRICS || 'metrics')) {
      await this.metricsService.store(payload);
      this.eventsGateway.emitMetric(payload);
    }

    if (topic === (process.env.KAFKA_TOPIC_ANOMALIES || 'anomalies')) {
      await this.anomaliesService.store(payload);
      this.eventsGateway.emitAnomaly(payload);
      console.log(`[Kafka] Anomaly stored | agent: ${payload.agentId} | score: ${payload.score}`);
    }
  }
}
