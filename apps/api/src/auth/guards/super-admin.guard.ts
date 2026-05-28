import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SUPER_ADMIN_KEY } from '../decorators/super-admin.decorator';
import type { AuthenticatedRequest } from '../types';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requires = this.reflector.getAllAndOverride<boolean>(SUPER_ADMIN_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requires) return true;

    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!req.user?.isSuperAdmin) {
      throw new ForbiddenException('Acesso restrito a super admin');
    }
    return true;
  }
}
