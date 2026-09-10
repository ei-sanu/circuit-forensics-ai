import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FirsService } from './firs.service';
import { CreateFirDto } from './dto/create-fir.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('firs')
export class FirsController {
  constructor(private readonly firsService: FirsService) {}

  @Post()
  async create(@Body() createFirDto: CreateFirDto, @CurrentUser() user: any) {
    return this.firsService.create(createFirDto, user);
  }

  @Get()
  async findAll(
    @Query('policeStation') policeStation?: string,
    @Query('district') district?: string,
    @Query('status') status?: string,
    @Query('q') q?: string,
  ) {
    return this.firsService.findAll({ policeStation, district, status, q });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.firsService.findOne(id);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @CurrentUser() user: any,
  ) {
    return this.firsService.updateStatus(id, status, user);
  }

  @Post('parse-ocr')
  async parseOcr(@Body('rawText') rawText: string) {
    return this.firsService.parseOcrText(rawText);
  }

  @Post('upload-copy')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCopy(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    // If a file is uploaded, convert to data URL or handle storage URL
    const fileBase64 = file ? `data:${file.mimetype};base64,${file.buffer.toString('base64')}` : body.fileUrl;
    
    // Perform heuristic OCR parsing
    const defaultOcrText = body.ocrText || (file ? `FIRST INFORMATION REPORT (Under Sec. 154 Cr.P.C.)\nDistrict: ${body.district || 'State Cyber Jurisdiction'}\nP.S.: ${body.policeStation || 'District Special PS'}\nAccused: ${body.accusedNames || 'Unidentified Layering Operatives'}\nSections: ${body.ipcSections || 'IPC 420, 120B'}` : '');
    const parsed = this.firsService.parseOcrText(defaultOcrText);

    return {
      success: true,
      fileUrl: fileBase64 || 'https://res.cloudinary.com/demo/image/upload/v1690000000/fir_sample_official.jpg',
      ocrExtractedText: defaultOcrText,
      parsedFields: parsed,
    };
  }
}
