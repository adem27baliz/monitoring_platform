import { Module } from '@nestjs/common';
import { KafkaService } from './kafka.service';
import { MetricsModule } from '../metrics/metrics.module';
import { AnomaliesModule } from '../anomalies/anomalies.module';
import { EventsGateway } from '../websocket/events.gateway';

@Module({
  imports: [MetricsModule, AnomaliesModule],
  providers: [KafkaService, EventsGateway],
})
export class KafkaModule {}
