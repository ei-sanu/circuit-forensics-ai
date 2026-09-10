import { Controller, Post, Body, Req, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login and obtain JWT token' })
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString();
    const userAgent = req.headers['user-agent'];
    return this.authService.login(loginDto, ip, userAgent);
  }

  @Public()
  @Post('demo-login')
  @ApiOperation({ summary: 'Instant demo login for role switching' })
  async demoLogin(@Body('role') role: string = 'investigator', @Req() req: Request) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString();
    const userAgent = req.headers['user-agent'];
    return this.authService.demoLogin(role, ip, userAgent);
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user account (Admin or initial onboarding)' })
  async register(@Body() registerDto: RegisterDto, @Req() req: Request) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString();
    const userAgent = req.headers['user-agent'];
    return this.authService.register(registerDto, ip, userAgent);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get profile of current authenticated investigator/analyst' })
  async getProfile(@CurrentUser() user: any) {
    return user;
  }

  @Get('pending-users')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get list of users submitted by HR pending Admin review' })
  async getPendingUsers() {
    return this.authService.getPendingUsers();
  }

  @Get('users')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users across roles' })
  async getAllUsers() {
    return this.authService.getAllUsers();
  }

  @Post('approve-user/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin approves an HR submitted user account' })
  async approveUser(@Req() req: any) {
    const userId = req.params.id;
    return this.authService.approveUser(userId, req.user);
  }

  @Post('reject-user/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin rejects an HR submitted user account' })
  async rejectUser(@Req() req: any) {
    const userId = req.params.id;
    return this.authService.rejectUser(userId, req.user);
  }
}

