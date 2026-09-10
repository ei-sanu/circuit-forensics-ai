import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';

import { DocumentsService } from './documents.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { CommitDocumentDto } from './dto/commit-document.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Documents')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('api/documents')
export class DocumentsController {
  constructor(private readonly docsService: DocumentsService) {}

  @Post('upload')
  @Roles(Role.INVESTIGATOR, Role.ANALYST, Role.ADMIN, Role.POLICE_STATION)
  @ApiOperation({ summary: 'Upload an investigative document (PDF/TXT/CSV), stream to R2, and trigger AI extraction' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Body() uploadDto: UploadDocumentDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    return this.docsService.uploadAndProcess(uploadDto, file, user);
  }

  @Get()
  @Roles(Role.INVESTIGATOR, Role.ANALYST, Role.ADMIN, Role.POLICE_STATION, Role.HR)
  @ApiOperation({ summary: 'List uploaded intelligence documents' })
  async findAll(@Query('caseId') caseId?: string, @Query('limit') limit = 50, @Query('skip') skip = 0) {
    return this.docsService.findAll(caseId, Number(limit), Number(skip));
  }

  @Get(':documentId')
  @Roles(Role.INVESTIGATOR, Role.ANALYST, Role.ADMIN, Role.POLICE_STATION, Role.HR)
  @ApiOperation({ summary: 'Get document details, signed download link, and extracted AI proposals' })
  async findOne(@Param('documentId') documentId: string) {
    return this.docsService.findOne(documentId);
  }

  @Post(':documentId/commit')
  @Roles(Role.INVESTIGATOR, Role.ADMIN, Role.POLICE_STATION)
  @ApiOperation({ summary: 'Human-in-the-loop review: approve and commit extracted entities & edges into MongoDB graph' })
  async commit(
    @Param('documentId') documentId: string,
    @Body() commitDto: CommitDocumentDto,
    @CurrentUser() user: any,
  ) {
    return this.docsService.commit(documentId, commitDto, user);
  }
}
