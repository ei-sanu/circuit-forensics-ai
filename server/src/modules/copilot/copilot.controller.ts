import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { CopilotService } from './copilot.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Copilot')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('api/copilot')
export class CopilotController {
  constructor(private readonly copilotService: CopilotService) {}

  @Post('query')
  @Roles(Role.INVESTIGATOR, Role.ANALYST, Role.ADMIN, Role.POLICE_STATION, Role.HR)
  @ApiOperation({ summary: 'Ask AI Copilot natural-language investigative questions with citations' })
  async query(
    @Body('query') query: string,
    @Body('caseId') caseId: string,
    @CurrentUser() user: any,
  ) {
    return this.copilotService.askCopilot(query, caseId, user);
  }
}
