import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma, SubscriptionStatus, SubscriptionTier } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PLANS } from '../billing/billing.constants';

type Tier = SubscriptionTier;

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * KPIs gerais do produto.
   * - MRR conta apenas households com stripeSubscriptionId (assinaturas reais — exclui comp/manual).
   * - "paying" = mesma definição.
   */
  async overview() {
    const now = new Date();
    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const startOf6mAgo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1));

    const [
      totalUsers,
      totalHouseholds,
      newUsersMonth,
      newHouseholdsMonth,
      planRows,
      payingHouseholds,
      compHouseholds,
      totalTransactions,
      transactionsMonth,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.household.count(),
      this.prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
      this.prisma.household.count({ where: { createdAt: { gte: startOfMonth } } }),
      this.prisma.household.groupBy({
        by: ['subscriptionTier'],
        _count: { _all: true },
      }),
      this.prisma.household.findMany({
        where: {
          stripeSubscriptionId: { not: null },
          subscriptionStatus: { in: ['ACTIVE', 'TRIALING'] },
        },
        select: { subscriptionTier: true },
      }),
      this.prisma.household.count({
        where: {
          stripeSubscriptionId: null,
          subscriptionTier: { in: ['PRO', 'PRO_PLUS'] },
        },
      }),
      this.prisma.transaction.count({ where: { deletedAt: null } }),
      this.prisma.transaction.count({
        where: { deletedAt: null, createdAt: { gte: startOfMonth } },
      }),
    ]);

    // MRR em centavos
    let mrrCents = 0;
    for (const h of payingHouseholds) {
      mrrCents += PLANS[h.subscriptionTier].monthlyPriceCents;
    }

    // Distribuição de planos
    const planDistribution: Record<Tier, number> = { FREE: 0, PRO: 0, PRO_PLUS: 0 };
    for (const row of planRows) {
      planDistribution[row.subscriptionTier] = row._count._all;
    }

    // Signups dos últimos 6 meses (raw — postgres)
    const signups = await this.prisma.$queryRaw<
      Array<{ month: Date; count: bigint }>
    >`
      SELECT date_trunc('month', created_at) AS month, COUNT(*)::bigint AS count
      FROM users
      WHERE created_at >= ${startOf6mAgo}
      GROUP BY month
      ORDER BY month ASC
    `;
    const signupsByMonth = this.fillMonthlySeries(startOf6mAgo, 6, signups);

    return {
      totals: {
        users: totalUsers,
        households: totalHouseholds,
        payingHouseholds: payingHouseholds.length,
        compHouseholds,
        transactions: totalTransactions,
      },
      thisMonth: {
        newUsers: newUsersMonth,
        newHouseholds: newHouseholdsMonth,
        transactions: transactionsMonth,
      },
      revenue: {
        mrrCents,
        arrCents: mrrCents * 12,
      },
      planDistribution,
      signupsByMonth,
    };
  }

  private fillMonthlySeries(start: Date, months: number, rows: Array<{ month: Date; count: bigint }>) {
    const map = new Map<string, number>();
    for (const r of rows) {
      const key = `${r.month.getUTCFullYear()}-${r.month.getUTCMonth()}`;
      map.set(key, Number(r.count));
    }
    const out: Array<{ label: string; count: number }> = [];
    for (let i = 0; i < months; i++) {
      const d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + i, 1));
      const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
      const label = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      out.push({ label, count: map.get(key) ?? 0 });
    }
    return out;
  }

  async listHouseholds(params: {
    q?: string;
    tier?: Tier;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, Math.max(1, params.limit ?? 25));
    const where: Prisma.HouseholdWhereInput = {};
    if (params.tier) where.subscriptionTier = params.tier;
    if (params.q && params.q.trim()) {
      const q = params.q.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { owner: { name: { contains: q, mode: 'insensitive' } } },
        { owner: { email: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const [total, rows] = await Promise.all([
      this.prisma.household.count({ where }),
      this.prisma.household.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          createdAt: true,
          subscriptionTier: true,
          subscriptionStatus: true,
          currentPeriodEnd: true,
          stripeSubscriptionId: true,
          stripeCustomerId: true,
          owner: { select: { id: true, name: true, email: true, createdAt: true } },
          _count: { select: { members: true, transactions: true } },
        },
      }),
    ]);

    return {
      page,
      limit,
      total,
      items: rows.map((h) => ({
        id: h.id,
        name: h.name,
        createdAt: h.createdAt,
        tier: h.subscriptionTier,
        status: h.subscriptionStatus,
        currentPeriodEnd: h.currentPeriodEnd,
        isPaying: !!h.stripeSubscriptionId,
        isComp: !h.stripeSubscriptionId && h.subscriptionTier !== 'FREE',
        owner: h.owner,
        memberCount: h._count.members,
        transactionCount: h._count.transactions,
      })),
    };
  }

  async updateHouseholdPlan(
    householdId: string,
    dto: { tier: Tier; status?: SubscriptionStatus | null; clearStripe?: boolean },
  ) {
    const household = await this.prisma.household.findUnique({ where: { id: householdId } });
    if (!household) throw new NotFoundException('Household não encontrado');

    const data: Prisma.HouseholdUpdateInput = {
      subscriptionTier: dto.tier,
    };
    if (dto.tier === 'FREE') {
      data.subscriptionStatus = null;
      data.currentPeriodEnd = null;
    } else {
      data.subscriptionStatus = dto.status ?? 'ACTIVE';
      data.currentPeriodEnd = null; // override manual = sem expiração
    }
    if (dto.clearStripe) {
      data.stripeSubscriptionId = null;
    }

    const updated = await this.prisma.household.update({
      where: { id: householdId },
      data,
      select: {
        id: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        currentPeriodEnd: true,
        stripeSubscriptionId: true,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        householdId,
        action: 'ADMIN_PLAN_OVERRIDE',
        entity: 'Household',
        entityId: householdId,
        oldValue: {
          tier: household.subscriptionTier,
          status: household.subscriptionStatus,
          currentPeriodEnd: household.currentPeriodEnd,
        },
        newValue: data,
      },
    });

    return updated;
  }

  async listUsers(params: { q?: string; page?: number; limit?: number }) {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, Math.max(1, params.limit ?? 25));
    const where: Prisma.UserWhereInput = {};
    if (params.q && params.q.trim()) {
      const q = params.q.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [total, rows] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          isActive: true,
          isSuperAdmin: true,
          createdAt: true,
          _count: { select: { memberships: true } },
        },
      }),
    ]);

    return {
      page,
      limit,
      total,
      items: rows.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        isActive: u.isActive,
        isSuperAdmin: u.isSuperAdmin,
        createdAt: u.createdAt,
        householdCount: u._count.memberships,
      })),
    };
  }

  async toggleSuperAdmin(userId: string, requestingAdminId: string) {
    if (userId === requestingAdminId) {
      throw new BadRequestException('Você não pode alterar seu próprio status de super admin');
    }
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { isSuperAdmin: !user.isSuperAdmin },
      select: { id: true, isSuperAdmin: true },
    });
    return updated;
  }
}
