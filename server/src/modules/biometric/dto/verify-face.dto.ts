import { IsNotEmpty, IsString, IsOptional, IsObject, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyFaceDto {
  @ApiProperty({ description: 'Short-lived single-use authentication challenge ID' })
  @IsString()
  @IsNotEmpty()
  challengeId: string;

  @ApiProperty({ description: 'Base64 encoded live camera verification image' })
  @IsString()
  @IsNotEmpty()
  faceImage: string;

  @ApiProperty({ description: 'Client-side active liveness validation signals', required: false })
  @IsOptional()
  @IsObject()
  livenessData?: Record<string, any>;

  @ApiProperty({ description: 'Custom verification matching threshold (0.0 to 1.0)', required: false })
  @IsOptional()
  @IsNumber()
  threshold?: number;
}
