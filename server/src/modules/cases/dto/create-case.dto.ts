import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsArray } from 'class-validator';

export class CreateCaseDto {
  @ApiProperty({ example: 'CR-2026-00124' })
  @IsNotEmpty()
  @IsString()
  caseNumber: string;

  @ApiProperty({ example: 'Operation Nightfall' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'Interstate hawala and financial network operation' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'high' })
  @IsOptional()
  @IsString()
  priority?: string;

  @ApiProperty({ example: ['Vikram Rao'] })
  @IsOptional()
  @IsArray()
  leadInvestigators?: string[];

  @ApiProperty({ example: ['hawala', 'shell_company', 'narcotics'] })
  @IsOptional()
  @IsArray()
  tags?: string[];
}
