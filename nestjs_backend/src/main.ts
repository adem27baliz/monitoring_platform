import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({ origin: '*' });
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`[Backend] Running on http://0.0.0.0:${port}/api`);
  console.log(`[Backend] Endpoints:`);
  console.log(`  GET /api/metrics`);
  console.log(`  GET /api/metrics/agent`);
  console.log(`  GET /api/metrics/latest`);
  console.log(`  GET /api/metrics/agents`);
  console.log(`  GET /api/anomalies`);
  console.log(`  GET /api/anomalies/agent`);
  console.log(`  GET /api/anomalies/stats`);
  console.log(`  WS  /live`);
}

bootstrap();
