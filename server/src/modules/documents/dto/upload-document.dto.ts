import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UploadDocumentDto {
  @ApiProperty({ example: 'FIR No. 2026/88 - Hawala Transaction Trail' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'CR-2026-00124', required: false })
  @IsOptional()
  @IsString()
  caseId?: string;

  @ApiProperty({ example: 'Raw intelligence text content or FIR description', required: false })
  @IsOptional()
  @IsString()
  textContent?: string;
}
