import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetricsModule } from './metrics/metrics.module';
import { AnomaliesModule } from './anomalies/anomalies.module';
import { KafkaModule } from './kafka/kafka.module';
import { MetricEntity } from './metrics/metrics.entity';
import { AnomalyEntity } from './anomalies/anomaly.entity';

@Module({
  imports: [
    // TimescaleDB connection (PostgreSQL-compatible)
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'timescaledb',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'monitoring',
      entities: [MetricEntity, AnomalyEntity],
      synchronize: true,  // auto-creates tables on startup
      retryAttempts: 10,
      retryDelay: 3000,
    }),
    MetricsModule,
    AnomaliesModule,
    KafkaModule,
  ],
})
export class AppModule {}
