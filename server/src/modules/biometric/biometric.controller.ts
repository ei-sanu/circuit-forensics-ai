import { Controller, Post, Body, Req, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';

import { BiometricService } from './biometric.service';
import { VerifyFaceDto } from './dto/verify-face.dto';
import { EnrollFaceDto } from './dto/enroll-face.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Biometric Identity & Facial Verification')
@Controller('api/biometric')
export class BiometricController {
  constructor(private readonly biometricService: BiometricService) {}

  @Public()
  @Post('verify')
  @ApiOperation({ summary: '1:1 Live facial biometric verification against claimed auth challenge' })
  async verifyFace(@Body() dto: VerifyFaceDto, @Req() req: Request) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString();
    const userAgent = req.headers['user-agent'];
    return this.biometricService.verifyFace(dto, ip, userAgent);
  }

  @Post('enroll')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enroll a user facial biometric identity template' })
  async enrollFace(
    @Body() dto: EnrollFaceDto,
    @CurrentUser() user: any,
    @Req() req: Request,
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString();
    const userAgent = req.headers['user-agent'];
    const enrolledBy = user?.email || 'admin@circuit.gov';
    return this.biometricService.enrollFace(user, dto, enrolledBy, ip, userAgent);
  }

  @Get('status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user biometric credential status' })
  async getMyStatus(@CurrentUser() user: any) {
    const userId = user.userId || user.sub || user.id;
    return this.biometricService.getBiometricStatus(userId);
  }

  @Get('status/:userId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get biometric credential status for a specific user' })
  async getUserStatus(@Param('userId') userId: string) {
    return this.biometricService.getBiometricStatus(userId);
  }

  @Get('telemetry')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get aggregated biometric security events and failure statistics' })
  async getTelemetry() {
    return this.biometricService.getSecurityTelemetry();
  }
}
