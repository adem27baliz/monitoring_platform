import { Controller, Get, Query } from '@nestjs/common';
import { MetricsService } from './metrics.service';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  /**
   * GET /metrics?from=1706000000000&to=1706100000000&agentId=agent-1
   * Returns metrics within a time range, optionally filtered by agent.
   */
  @Get()
  async getByTimeRange(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('agentId') agentId?: string,
  ) {
    const fromTs = parseInt(from) || Date.now() - 3600000; // default: last hour
    const toTs = parseInt(to) || Date.now();
    return this.metricsService.findByTimeRange(fromTs, toTs, agentId);
  }

  /**
   * GET /metrics/agent?agentId=agent-1&limit=100
   * Returns the most recent metrics for a specific agent.
   */
  @Get('agent')
  async getByAgent(
    @Query('agentId') agentId: string,
    @Query('limit') limit?: string,
  ) {
    return this.metricsService.findByAgentId(agentId, parseInt(limit) || 100);
  }

  /**
   * GET /metrics/latest
   * Returns the most recent metric reading per agent.
   */
  @Get('latest')
  async getLatest(@Query('agentId') agentId?: string) {
    return this.metricsService.getLatest(agentId);
  }

  /**
   * GET /metrics/agents
   * Returns a list of all known agent IDs.
   */
  @Get('agents')
  async getAgents() {
    return this.metricsService.getAgents();
  }
}
