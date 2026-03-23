import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { MetricEntity } from './metrics.entity';

@Injectable()
export class MetricsService {
  constructor(
    @InjectRepository(MetricEntity)
    private readonly repo: Repository<MetricEntity>,
  ) {}

  // ── Store ─────────────────────────────────────────────────────────────────

  async store(payload: any): Promise<void> {
    const network = payload.network || [];
    const rxBps = network.reduce((s: number, n: any) => s + (n.rxBytesPerSec || 0), 0);
    const txBps = network.reduce((s: number, n: any) => s + (n.txBytesPerSec || 0), 0);

    const metric = this.repo.create({
      agentId: payload.agentId,
      hostname: payload.hostname,
      timestamp: payload.timestamp,
      cpuUsagePercent: payload.cpu?.usagePercent ?? 0,
      cpuUserPercent: payload.cpu?.userPercent ?? 0,
      cpuSystemPercent: payload.cpu?.systemPercent ?? 0,
      memoryUsagePercent: payload.memory?.usagePercent ?? 0,
      memoryUsedBytes: payload.memory?.usedBytes ?? 0,
      memoryAvailableBytes: payload.memory?.availableBytes ?? 0,
      diskReadBps: payload.disk?.readBytesPerSec ?? 0,
      diskWriteBps: payload.disk?.writeBytesPerSec ?? 0,
      networkRxBps: rxBps,
      networkTxBps: txBps,
    });

    await this.repo.save(metric);
  }

  // ── Query ─────────────────────────────────────────────────────────────────

  async findByTimeRange(from: number, to: number, agentId?: string): Promise<MetricEntity[]> {
    const where: any = { timestamp: Between(from, to) };
    if (agentId) where.agentId = agentId;

    return this.repo.find({
      where,
      order: { timestamp: 'ASC' },
      take: 1000,
    });
  }

  async findByAgentId(agentId: string, limit = 100): Promise<MetricEntity[]> {
    return this.repo.find({
      where: { agentId },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  async getLatest(agentId?: string): Promise<MetricEntity[]> {
    const query = this.repo.createQueryBuilder('m');
    if (agentId) query.where('m.agentId = :agentId', { agentId });
    return query.orderBy('m.timestamp', 'DESC').take(1).getMany();
  }

  async getAgents(): Promise<string[]> {
    const result = await this.repo
      .createQueryBuilder('m')
      .select('DISTINCT m.agentId', 'agentId')
      .getRawMany();
    return result.map((r) => r.agentId);
  }
}
