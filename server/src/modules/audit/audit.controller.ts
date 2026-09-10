import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Audit')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('api/audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles(Role.ADMIN, Role.ANALYST, Role.INVESTIGATOR)
  @ApiOperation({ summary: 'Retrieve recent compliance and system audit logs' })
  async getAuditLogs(
    @Query('limit') limit = 100,
    @Query('skip') skip = 0,
  ) {
    return this.auditService.findAll(Number(limit), Number(skip));
  }
}
