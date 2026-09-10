import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { CasesService } from './cases.service';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseDto } from './dto/update-case.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Cases')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('api/cases')
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Post()
  @Roles(Role.INVESTIGATOR, Role.ADMIN, Role.POLICE_STATION)
  @ApiOperation({ summary: 'Create a new investigation case' })
  async create(@Body() createCaseDto: CreateCaseDto, @CurrentUser() user: any) {
    return this.casesService.create(createCaseDto, user);
  }

  @Get()
  @Roles(Role.INVESTIGATOR, Role.ANALYST, Role.ADMIN, Role.POLICE_STATION, Role.HR)
  @ApiOperation({ summary: 'List all investigative cases' })
  async findAll(@Query('limit') limit = 50, @Query('skip') skip = 0) {
    return this.casesService.findAll(Number(limit), Number(skip));
  }

  @Get(':caseNumber')
  @Roles(Role.INVESTIGATOR, Role.ANALYST, Role.ADMIN, Role.POLICE_STATION, Role.HR)
  @ApiOperation({ summary: 'Get details of a specific case by caseNumber' })
  async findOne(@Param('caseNumber') caseNumber: string) {
    return this.casesService.findOne(caseNumber);
  }

  @Patch(':caseNumber')
  @Roles(Role.INVESTIGATOR, Role.ADMIN, Role.POLICE_STATION)
  @ApiOperation({ summary: 'Update case metadata, status, or priorities' })
  async update(
    @Param('caseNumber') caseNumber: string,
    @Body() updateCaseDto: UpdateCaseDto,
    @CurrentUser() user: any,
  ) {
    return this.casesService.update(caseNumber, updateCaseDto, user);
  }

  @Post(':caseNumber/entities/:entityId')
  @Roles(Role.INVESTIGATOR, Role.ADMIN, Role.POLICE_STATION)
  @ApiOperation({ summary: 'Link an entity to a specific case' })
  async linkEntity(
    @Param('caseNumber') caseNumber: string,
    @Param('entityId') entityId: string,
    @CurrentUser() user: any,
  ) {
    return this.casesService.linkEntity(caseNumber, entityId, user);
  }
}
