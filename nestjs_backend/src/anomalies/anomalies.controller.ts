import { Controller, Get, Query } from '@nestjs/common';
import { AnomaliesService } from './anomalies.service';

@Controller('anomalies')
export class AnomaliesController {
  constructor(private readonly anomaliesService: AnomaliesService) {}

  /**
   * GET /anomalies?limit=50&confidence=HIGH
   * Returns most recent anomalies, optionally filtered by confidence level.
   */
  @Get()
  async getRecent(
    @Query('limit') limit?: string,
    @Query('confidence') confidence?: string,
  ) {
    return this.anomaliesService.findRecent(parseInt(limit) || 50, confidence);
  }

  /**
   * GET /anomalies/agent?agentId=agent-1&limit=50
   * Returns anomalies for a specific agent.
   */
  @Get('agent')
  async getByAgent(
    @Query('agentId') agentId: string,
    @Query('limit') limit?: string,
  ) {
    return this.anomaliesService.findByAgent(agentId, parseInt(limit) || 50);
  }

  /**
   * GET /anomalies/stats
   * Returns total count, last 24h count, avg score, and breakdown by confidence.
   */
  @Get('stats')
  async getStats() {
    return this.anomaliesService.getStats();
  }
}
