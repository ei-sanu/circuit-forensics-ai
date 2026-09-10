import { Controller, Get, Post, Body, Param, Query, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { AlertsService } from './alerts.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Alerts')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('api/alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  @Roles(Role.INVESTIGATOR, Role.ANALYST, Role.ADMIN, Role.POLICE_STATION, Role.HR)
  @ApiOperation({ summary: 'List suspicious pattern and financial anomaly alerts' })
  async findAll(
    @Query('caseId') caseId?: string,
    @Query('severity') severity?: string,
    @Query('status') status?: string,
  ) {
    return this.alertsService.findAll(caseId, severity, status);
  }

  @Get(':alertId')
  @Roles(Role.INVESTIGATOR, Role.ANALYST, Role.ADMIN, Role.POLICE_STATION, Role.HR)
  @ApiOperation({ summary: 'Get detailed explanation, methodology, and supporting evidence for an alert' })
  async findOne(@Param('alertId') alertId: string) {
    return this.alertsService.findOne(alertId);
  }

  @Patch(':alertId/status')
  @Roles(Role.INVESTIGATOR, Role.ANALYST, Role.ADMIN, Role.POLICE_STATION)
  @ApiOperation({ summary: 'Update alert status (open, investigating, confirmed, dismissed)' })
  async updateStatus(
    @Param('alertId') alertId: string,
    @Body('status') status: string,
    @CurrentUser() user: any,
  ) {
    return this.alertsService.updateStatus(alertId, status, user);
  }

  @Post('refresh')
  @Roles(Role.INVESTIGATOR, Role.ADMIN, Role.POLICE_STATION)
  @ApiOperation({ summary: 'Trigger fresh execution of 10 anomaly detectors over current case state' })
  async triggerRefresh(
    @Query('caseId') caseId: string,
    @CurrentUser() user: any,
  ) {
    return this.alertsService.triggerRefresh(caseId, user);
  }
}
