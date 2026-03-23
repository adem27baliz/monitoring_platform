import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnomalyEntity } from './anomaly.entity';

@Injectable()
export class AnomaliesService {
  constructor(
    @InjectRepository(AnomalyEntity)
    private readonly repo: Repository<AnomalyEntity>,
  ) {}

  // ── Store ─────────────────────────────────────────────────────────────────

  async store(payload: any): Promise<void> {
    const anomaly = this.repo.create({
      agentId: payload.agentId,
      hostname: payload.hostname,
      timestamp: payload.timestamp,
      score: payload.score,
      confidence: payload.confidence,
      cpuPercent: payload.metrics?.cpu ?? 0,
      memoryPercent: payload.metrics?.memory ?? 0,
      diskReadBps: payload.metrics?.diskRead ?? 0,
      diskWriteBps: payload.metrics?.diskWrite ?? 0,
      modelDetails: payload.models ?? {},
    });

    await this.repo.save(anomaly);
  }

  // ── Query ─────────────────────────────────────────────────────────────────

  async findRecent(limit = 50, confidence?: string): Promise<AnomalyEntity[]> {
    const query = this.repo.createQueryBuilder('a');
    if (confidence) query.where('a.confidence = :confidence', { confidence });
    return query.orderBy('a.timestamp', 'DESC').take(limit).getMany();
  }

  async findByAgent(agentId: string, limit = 50): Promise<AnomalyEntity[]> {
    return this.repo.find({
      where: { agentId },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  async getStats(): Promise<object> {
    const total = await this.repo.count();

    const byConfidence = await this.repo
      .createQueryBuilder('a')
      .select('a.confidence', 'confidence')
      .addSelect('COUNT(*)', 'count')
      .groupBy('a.confidence')
      .getRawMany();

    const last24h = await this.repo
      .createQueryBuilder('a')
      .where('a.timestamp > :since', { since: Date.now() - 86400000 })
      .getCount();

    const avgScore = await this.repo
      .createQueryBuilder('a')
      .select('AVG(a.score)', 'avg')
      .getRawOne();

    return {
      total,
      last24h,
      avgScore: parseFloat(avgScore?.avg ?? '0').toFixed(4),
      byConfidence: byConfidence.reduce((acc, r) => {
        acc[r.confidence] = parseInt(r.count);
        return acc;
      }, {}),
    };
  }
}
