import { IsNotEmpty, IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EnrollFaceDto {
  @ApiProperty({ description: 'Target user ID to enroll (defaults to current user if self-enrolling)', required: false })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ description: 'Base64 encoded enrollment face image frame' })
  @IsString()
  @IsNotEmpty()
  faceImage: string;

  @ApiProperty({ description: 'Active liveness proof during enrollment capture', required: false })
  @IsOptional()
  @IsObject()
  livenessProof?: Record<string, any>;
}
