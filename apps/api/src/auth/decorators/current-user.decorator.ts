import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import type { AuthenticatedRequest, AuthUser } from '../types';

/** Injeta o usuário autenticado (req.user) no handler. */
export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AuthUser => {
    const req = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    return req.user;
  },
);

/** Injeta o householdId resolvido pelo TenantGuard. */
export const CurrentHousehold = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): string => {
    const req = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!req.householdId) {
      throw new Error('CurrentHousehold usado em rota sem TenantGuard ativo');
    }
    return req.householdId;
  },
);
