import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsArray, IsBoolean, IsObject } from 'class-validator';

export class CreateEntityDto {
  @ApiProperty({ example: 'P-0001' })
  @IsNotEmpty()
  @IsString()
  entityId: string;

  @ApiProperty({ example: 'person', enum: ['person', 'organization', 'phone', 'vehicle', 'location', 'event'] })
  @IsNotEmpty()
  @IsString()
  type: string;

  @ApiProperty({ example: 'Vikram Rathore' })
  @IsNotEmpty()
  @IsString()
  label: string;

  @ApiProperty({ example: ['Vicky', 'VR'], required: false })
  @IsOptional()
  @IsArray()
  aliases?: string[];

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  riskFlag?: boolean;

  @ApiProperty({ example: ['CR-2026-00124'], required: false })
  @IsOptional()
  @IsArray()
  cases?: string[];

  @ApiProperty({ example: { nationality: 'Indian', role: 'Syndicate Leader' }, required: false })
  @IsOptional()
  @IsObject()
  properties?: Record<string, any>;
}
