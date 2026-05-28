import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { SUPER_ADMIN_KEY } from '../decorators/super-admin.decorator';
import type { AuthenticatedRequest } from '../types';

/**
 * Resolve o household do usuário autenticado e anexa em req.householdId.
 * Para MVP cada usuário pertence a UM household (o seu, criado no signup).
 * Quando suportarmos múltiplos households, o usuário envia X-Household-Id e validamos a associação.
 */
@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const isSuperAdminRoute = this.reflector.getAllAndOverride<boolean>(SUPER_ADMIN_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isSuperAdminRoute) return true; // SuperAdminGuard cuida disso

    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!req.user) return true; // JwtAuthGuard já teria barrado; deixa passar pra não mascarar erro real

    const requested = req.header('x-household-id');
    const memberships = await this.prisma.householdUser.findMany({
      where: { userId: req.user.id },
      select: { householdId: true },
      orderBy: { createdAt: 'asc' },
    });

    if (memberships.length === 0) {
      // Super admin pode não ter household — deixa passar sem req.householdId.
      if (req.user.isSuperAdmin) return true;
      throw new ForbiddenException('Usuário não pertence a nenhum household');
    }

    if (requested) {
      const allowed = memberships.some((m) => m.householdId === requested);
      if (!allowed) throw new ForbiddenException('Sem acesso a esse household');
      req.householdId = requested;
    } else {
      req.householdId = memberships[0].householdId;
    }
    return true;
  }
}
