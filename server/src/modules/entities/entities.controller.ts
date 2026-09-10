import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { EntitiesService } from './entities.service';
import { CreateEntityDto } from './dto/create-entity.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Entities')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('api/entities')
export class EntitiesController {
  constructor(private readonly entitiesService: EntitiesService) {}

  @Post()
  @Roles(Role.INVESTIGATOR, Role.ADMIN, Role.POLICE_STATION, Role.HR)
  @ApiOperation({ summary: 'Register a new verified entity in the intelligence registry' })
  async create(@Body() createEntityDto: CreateEntityDto, @CurrentUser() user: any) {
    return this.entitiesService.create(createEntityDto, user);
  }

  @Get()
  @Roles(Role.INVESTIGATOR, Role.ANALYST, Role.ADMIN, Role.POLICE_STATION, Role.HR)
  @ApiOperation({ summary: 'Query and filter entities with fuzzy search, case scoping, and risk filters' })
  async findAll(
    @Query('type') type?: string,
    @Query('risk') risk?: boolean,
    @Query('caseId') caseId?: string,
    @Query('q') q?: string,
    @Query('limit') limit = 100,
    @Query('skip') skip = 0,
  ) {
    return this.entitiesService.findAll({ type, risk, caseId, q, limit: Number(limit), skip: Number(skip) });
  }

  @Get(':entityId')
  @Roles(Role.INVESTIGATOR, Role.ANALYST, Role.ADMIN, Role.POLICE_STATION, Role.HR)
  @ApiOperation({ summary: 'Get full entity profile and intelligence details' })
  async findOne(@Param('entityId') entityId: string) {
    return this.entitiesService.findOne(entityId);
  }
}
