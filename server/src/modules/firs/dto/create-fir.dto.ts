import { IsString, IsNotEmpty, IsOptional, IsArray, IsDateString } from 'class-validator';

export class CreateFirDto {
  @IsString()
  @IsNotEmpty()
  firNumber: string;

  @IsString()
  @IsNotEmpty()
  policeStation: string;

  @IsString()
  @IsNotEmpty()
  district: string;

  @IsString()
  @IsNotEmpty()
  inchargeOfficer: string;

  @IsString()
  @IsNotEmpty()
  complainantName: string;

  @IsString()
  @IsOptional()
  complainantPhone?: string;

  @IsArray()
  @IsOptional()
  accusedNames?: string[];

  @IsArray()
  @IsOptional()
  ipcSections?: string[];

  @IsDateString()
  @IsOptional()
  incidentDate?: string;

  @IsString()
  @IsNotEmpty()
  incidentLocation: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  firCopyUrl?: string;

  @IsString()
  @IsOptional()
  ocrExtractedText?: string;
}
