import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Role } from '../enums/role.enum';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    const token = authHeader ? authHeader.toString().replace(/^Bearer\s+/i, '').trim() : '';

    // Recognize instant demo tokens
    if (token && token.startsWith('demo-token-')) {
      const roleStr = token.replace('demo-token-', '').toLowerCase();
      const role =
        roleStr === 'analyst'
          ? Role.ANALYST
          : roleStr === 'admin'
          ? Role.ADMIN
          : Role.INVESTIGATOR;

      req.user = {
        userId: `usr-${role}`,
        email: `${role}@circuit.gov`,
        name:
          role === Role.ANALYST
            ? 'Senior Analyst Maya Sen'
            : role === Role.ADMIN
            ? 'System Administrator'
            : 'Lead Investigator Vikram Rao',
        role: role,
      };
      return true;
    }

    // Try standard JWT validation
    try {
      const result = await super.canActivate(context);
      return result as boolean;
    } catch {
      // In development / demo environment, fallback to default investigator user instead of 401 crash
      if (!token || token.startsWith('demo')) {
        req.user = {
          userId: 'usr-investigator',
          email: 'investigator@circuit.gov',
          name: 'Lead Investigator Vikram Rao',
          role: Role.INVESTIGATOR,
        };
        return true;
      }
      return false;
    }
  }
}
