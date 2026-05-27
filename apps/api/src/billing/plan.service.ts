import { ForbiddenException, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import type { SubscriptionTier } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PLANS, type PlanFeatures } from './billing.constants';

/** Lança erro 402 com mensagem amigável e plano sugerido. */
export class PaymentRequiredException extends HttpException {
  constructor(message: string, requiredTier: SubscriptionTier) {
    super({ message, requiredTier, code: 'payment_required' }, HttpStatus.PAYMENT_REQUIRED);
  }
}

@Injectable()
export class PlanService {
  constructor(private readonly prisma: PrismaService) {}

  async getFeatures(householdId: string): Promise<{ tier: SubscriptionTier; features: PlanFeatures }> {
    const h = await this.prisma.household.findUnique({
      where: { id: householdId },
      select: { subscriptionTier: true, subscriptionStatus: true, currentPeriodEnd: true },
    });
    if (!h) return { tier: 'FREE', features: PLANS.FREE.features };
    // Se assinatura expirou (PAST_DUE/CANCELED ou data passou), considera FREE
    const expired =
      h.currentPeriodEnd && h.currentPeriodEnd < new Date() && h.subscriptionStatus !== 'ACTIVE';
    const tier = expired ? 'FREE' : h.subscriptionTier;
    return { tier, features: PLANS[tier].features };
  }

  async assertCanCreateTransaction(householdId: string) {
    const { features, tier } = await this.getFeatures(householdId);
    if (features.monthlyTransactionLimit === null) return;
    const now = new Date();
    const start = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
    const end = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 1));
    const count = await this.prisma.transaction.count({
      where: {
        householdId,
        deletedAt: null,
        createdAt: { gte: start, lt: end },
      },
    });
    if (count >= features.monthlyTransactionLimit) {
      throw new PaymentRequiredException(
        `Limite de ${features.monthlyTransactionLimit} lançamentos/mês atingido no plano ${PLANS[tier].name}. Faça upgrade para Pro.`,
        'PRO',
      );
    }
  }

  async assertCanUseRecurring(householdId: string) {
    const { features, tier } = await this.getFeatures(householdId);
    if (!features.recurring) {
      throw new PaymentRequiredException(
        `Recorrências fazem parte do Pro. Faça upgrade para automatizar contas fixas.`,
        'PRO',
      );
    }
    void tier;
  }

  async assertCanUseBudgets(householdId: string) {
    const { features } = await this.getFeatures(householdId);
    if (!features.budgets) {
      throw new PaymentRequiredException(
        `Orçamentos fazem parte do Pro. Faça upgrade para definir tetos por categoria.`,
        'PRO',
      );
    }
  }

  async assertCanExport(householdId: string) {
    const { features } = await this.getFeatures(householdId);
    if (!features.csvExport) {
      throw new PaymentRequiredException(
        `Exportar CSV faz parte do Pro.`,
        'PRO',
      );
    }
  }

  async assertCanInvite(householdId: string) {
    const { features } = await this.getFeatures(householdId);
    if (!features.inviteMembers) {
      throw new PaymentRequiredException(
        `Convidar membros faz parte do Pro+. Faça upgrade para compartilhar a casa com a família.`,
        'PRO_PLUS',
      );
    }
    const memberCount = await this.prisma.householdUser.count({ where: { householdId } });
    if (memberCount >= features.maxMembers) {
      throw new ForbiddenException(
        `Limite de ${features.maxMembers} membros atingido no seu plano.`,
      );
    }
  }
}
