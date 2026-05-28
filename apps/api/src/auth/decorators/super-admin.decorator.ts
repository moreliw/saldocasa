import { SetMetadata } from '@nestjs/common';

export const SUPER_ADMIN_KEY = 'isSuperAdminRoute';

/**
 * Marca rota/controller como exclusiva de super admin.
 * Quem decora isso: passa pelo JwtAuthGuard normalmente, é validado pelo
 * SuperAdminGuard, e ignora o TenantGuard (super admin não pertence a household).
 */
export const SuperAdmin = () => SetMetadata(SUPER_ADMIN_KEY, true);
