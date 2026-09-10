import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ApprovedEntityDto {
  @ApiProperty({ example: 'temp_p_1' })
  @IsNotEmpty()
  tempId: string;

  @ApiProperty({ example: 'person' })
  @IsNotEmpty()
  type: string;

  @ApiProperty({ example: 'Vikram Rathore' })
  @IsNotEmpty()
  label: string;

  @ApiProperty({ example: 'P-0001', required: false, description: 'Matched canonical ID or null if new node' })
  @IsOptional()
  canonicalId?: string;

  @ApiProperty({ example: true })
  @IsOptional()
  createAsNew?: boolean;
}

export class ApprovedRelationshipDto {
  @ApiProperty({ example: 'P-0001' })
  @IsNotEmpty()
  sourceId: string;

  @ApiProperty({ example: 'O-0001' })
  @IsNotEmpty()
  targetId: string;

  @ApiProperty({ example: 'transferred_money' })
  @IsNotEmpty()
  relType: string;

  @ApiProperty({ example: 0.90 })
  @IsOptional()
  confidence?: number;
}

export class CommitDocumentDto {
  @ApiProperty({ type: [ApprovedEntityDto] })
  @IsArray()
  approvedEntities: ApprovedEntityDto[];

  @ApiProperty({ type: [ApprovedRelationshipDto] })
  @IsArray()
  approvedRelationships: ApprovedRelationshipDto[];
}
