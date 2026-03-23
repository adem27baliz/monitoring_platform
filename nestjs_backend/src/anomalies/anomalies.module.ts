import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnomalyEntity } from './anomaly.entity';
import { AnomaliesService } from './anomalies.service';
import { AnomaliesController } from './anomalies.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AnomalyEntity])],
  providers: [AnomaliesService],
  controllers: [AnomaliesController],
  exports: [AnomaliesService],
})
export class AnomaliesModule {}
