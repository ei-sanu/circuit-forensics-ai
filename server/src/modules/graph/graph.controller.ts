import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { GraphService } from './graph.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Graph')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('api/graph')
export class GraphController {
  constructor(private readonly graphService: GraphService) {}

  @Get()
  @Roles(Role.INVESTIGATOR, Role.ANALYST, Role.ADMIN, Role.POLICE_STATION, Role.HR)
  @ApiOperation({ summary: 'Get current graph state (nodes and edges) for Cytoscape visualization' })
  async getGraph(@Query('caseId') caseId?: string) {
    return this.graphService.getGraphState(caseId);
  }

  @Get('analytics')
  @Roles(Role.INVESTIGATOR, Role.ANALYST, Role.ADMIN, Role.POLICE_STATION, Role.HR)
  @ApiOperation({ summary: 'Compute NetworkX analytics, community clusters, influence scores, and hidden bridges' })
  async getAnalytics(@Query('caseId') caseId?: string) {
    return this.graphService.getAnalytics(caseId);
  }

  @Get('path')
  @Roles(Role.INVESTIGATOR, Role.ANALYST, Role.ADMIN, Role.POLICE_STATION, Role.HR)
  @ApiOperation({ summary: 'Find the shortest evidential path between two entity nodes' })
  async findPath(
    @Query('sourceId') sourceId: string,
    @Query('targetId') targetId: string,
    @Query('caseId') caseId?: string,
  ) {
    return this.graphService.findShortestPath(sourceId, targetId, caseId);
  }

  @Post('simulate')
  @Roles(Role.INVESTIGATOR, Role.ANALYST, Role.ADMIN, Role.POLICE_STATION)
  @ApiOperation({ summary: 'Simulate node removal to analyze fragmentation of the criminal network' })
  async simulate(
    @Body('nodeId') nodeId: string,
    @Query('caseId') caseId?: string,
  ) {
    return this.graphService.simulateRemoval(nodeId, caseId);
  }

  @Get('transactions')
  @Roles(Role.INVESTIGATOR, Role.ANALYST, Role.ADMIN, Role.POLICE_STATION, Role.HR)
  @ApiOperation({ summary: 'Get financial transaction logs from database' })
  async getTransactions(@Query('caseId') caseId?: string, @Query('limit') limit = 100) {
    return this.graphService.getTransactions(caseId, limit);
  }

  @Get('communications')
  @Roles(Role.INVESTIGATOR, Role.ANALYST, Role.ADMIN, Role.POLICE_STATION, Role.HR)
  @ApiOperation({ summary: 'Get CDR communications and burner phone logs from database' })
  async getCommunications(@Query('caseId') caseId?: string, @Query('limit') limit = 100) {
    return this.graphService.getCommunications(caseId, limit);
  }
}
