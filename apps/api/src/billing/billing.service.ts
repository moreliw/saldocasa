import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { SubscriptionStatus, SubscriptionTier } from '@prisma/client';
import type Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { PLANS, STRIPE_PRICE_LOOKUP_KEYS } from './billing.constants';
import { STRIPE_CLIENT, type StripeClient } from './stripe.provider';

const APP_URL = process.env.APP_PUBLIC_URL ?? 'https://saldocasa.morelidev.com';

@Injectable()
export class BillingService implements OnModuleInit {
  private readonly logger = new Logger(BillingService.name);
  private priceIds: Partial<Record<SubscriptionTier, string>> = {};

  constructor(
    @Inject(STRIPE_CLIENT) private readonly stripe: StripeClient,
    private readonly prisma: PrismaService,
  ) {}

  get enabled() {
    return this.stripe !== null;
  }

  /**
   * Na inicialização: garante que os produtos e prices existem no Stripe.
   * Idempotente via lookup_key. Roda só se houver STRIPE_SECRET_KEY.
   */
  onModuleInit() {
    if (!this.stripe) return;
    // Sincroniza com a Stripe em background — NÃO bloqueia o bootstrap.
    // Se a Stripe estiver lenta/instável, a API ainda responde ao /health.
    // Endpoints que dependem do priceId fazem fallback automático.
    void this.ensureProducts()
      .then(() => {
        this.logger.log(
          `Billing pronto: PRO=${this.priceIds.PRO} PRO_PLUS=${this.priceIds.PRO_PLUS}`,
        );
      })
      .catch((err) => {
        this.logger.error(
          `Falha ao sincronizar produtos no Stripe: ${err instanceof Error ? err.message : err}`,
        );
      });
  }

  private async ensureProducts() {
    if (!this.stripe) return;
    const targets: Array<{
      tier: SubscriptionTier;
      lookupKey: string;
      productName: string;
      productDescription: string;
      amountCents: number;
    }> = [
      {
        tier: 'PRO',
        lookupKey: STRIPE_PRICE_LOOKUP_KEYS.PRO_MONTHLY,
        productName: 'saldocasa Pro',
        productDescription: PLANS.PRO.tagline,
        amountCents: PLANS.PRO.monthlyPriceCents,
      },
      {
        tier: 'PRO_PLUS',
        lookupKey: STRIPE_PRICE_LOOKUP_KEYS.PRO_PLUS_MONTHLY,
        productName: 'saldocasa Pro+',
        productDescription: PLANS.PRO_PLUS.tagline,
        amountCents: PLANS.PRO_PLUS.monthlyPriceCents,
      },
    ];

    for (const t of targets) {
      // 1) procura price existente pela lookup_key
      const existing = await this.stripe.prices.list({
        lookup_keys: [t.lookupKey],
        active: true,
        limit: 1,
      });
      if (existing.data.length > 0) {
        const price = existing.data[0];
        // se preço mudou, archive o antigo e cria novo
        if (price.unit_amount !== t.amountCents || price.currency !== 'brl') {
          await this.stripe.prices.update(price.id, { active: false });
        } else {
          this.priceIds[t.tier] = price.id;
          continue;
        }
      }

      // 2) garante produto
      const products = await this.stripe.products.search({
        query: `metadata['tier']:'${t.tier}'`,
        limit: 1,
      });
      let product = products.data[0];
      if (!product) {
        product = await this.stripe.products.create({
          name: t.productName,
          description: t.productDescription,
          metadata: { tier: t.tier },
        });
      }

      // 3) cria price recorrente mensal em BRL
      const newPrice = await this.stripe.prices.create({
        product: product.id,
        currency: 'brl',
        unit_amount: t.amountCents,
        recurring: { interval: 'month' },
        lookup_key: t.lookupKey,
        nickname: `${t.productName} Mensal`,
      });
      this.priceIds[t.tier] = newPrice.id;
    }
  }

  async getStateForHousehold(householdId: string) {
    const h = await this.prisma.household.findUnique({
      where: { id: householdId },
      select: {
        id: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        currentPeriodEnd: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
      },
    });
    if (!h) throw new BadRequestException('Household não encontrado');
    return {
      tier: h.subscriptionTier,
      status: h.subscriptionStatus,
      currentPeriodEnd: h.currentPeriodEnd,
      hasStripeCustomer: !!h.stripeCustomerId,
      hasActiveSubscription: !!h.stripeSubscriptionId,
      billingEnabled: this.enabled,
      plans: Object.values(PLANS),
    };
  }

  async createCheckout(householdId: string, userId: string, targetTier: SubscriptionTier) {
    if (!this.stripe) throw new ServiceUnavailableException('Billing desativado');
    if (targetTier === 'FREE') throw new BadRequestException('Plano gratuito não exige checkout');
    const priceId = this.priceIds[targetTier];
    if (!priceId) throw new ServiceUnavailableException('Plano ainda não inicializado');

    const household = await this.prisma.household.findUnique({ where: { id: householdId } });
    if (!household) throw new BadRequestException('Household não encontrado');
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('Usuário não encontrado');

    let customerId = household.stripeCustomerId;
    if (!customerId) {
      const customer = await this.stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { householdId, userId },
      });
      customerId = customer.id;
      await this.prisma.household.update({
        where: { id: householdId },
        data: { stripeCustomerId: customerId },
      });
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${APP_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/pricing?canceled=1`,
      allow_promotion_codes: true,
      locale: 'pt-BR',
      subscription_data: { metadata: { householdId, tier: targetTier } },
      client_reference_id: householdId,
    });

    return { url: session.url };
  }

  async createPortal(householdId: string) {
    if (!this.stripe) throw new ServiceUnavailableException('Billing desativado');
    const household = await this.prisma.household.findUnique({ where: { id: householdId } });
    if (!household?.stripeCustomerId) {
      throw new BadRequestException('Sem assinatura para gerenciar');
    }
    const session = await this.stripe.billingPortal.sessions.create({
      customer: household.stripeCustomerId,
      return_url: `${APP_URL}/settings`,
    });
    return { url: session.url };
  }

  /**
   * Trata eventos do Stripe. Chama com o objeto já parseado e verificado por assinatura.
   */
  async handleWebhook(event: Stripe.Event) {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const householdId = session.client_reference_id;
        const subscriptionId = session.subscription as string | null;
        if (!householdId || !subscriptionId || !this.stripe) break;
        const sub = await this.stripe.subscriptions.retrieve(subscriptionId);
        await this.applySubscription(householdId, sub);
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.created': {
        const sub = event.data.object as Stripe.Subscription;
        const householdId = sub.metadata?.householdId;
        if (!householdId) break;
        await this.applySubscription(householdId, sub);
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const householdId = sub.metadata?.householdId;
        if (!householdId) break;
        await this.prisma.household.update({
          where: { id: householdId },
          data: {
            subscriptionTier: 'FREE',
            subscriptionStatus: 'CANCELED',
            stripeSubscriptionId: null,
            currentPeriodEnd: null,
          },
        });
        break;
      }
      default:
        this.logger.debug(`Evento Stripe ignorado: ${event.type}`);
    }
  }

  private async applySubscription(householdId: string, sub: Stripe.Subscription) {
    const tier = this.tierFromSubscription(sub);
    const status = this.statusFromStripe(sub.status);
    await this.prisma.household.update({
      where: { id: householdId },
      data: {
        subscriptionTier: tier,
        subscriptionStatus: status,
        stripeSubscriptionId: sub.id,
        stripeCustomerId: sub.customer as string,
        currentPeriodEnd: new Date(sub.current_period_end * 1000),
      },
    });
    await this.prisma.auditLog.create({
      data: {
        householdId,
        action: 'SUBSCRIPTION_UPDATED',
        entity: 'Subscription',
        entityId: sub.id,
        newValue: { tier, status, currentPeriodEnd: sub.current_period_end },
      },
    });
  }

  private tierFromSubscription(sub: Stripe.Subscription): SubscriptionTier {
    const explicit = sub.metadata?.tier as SubscriptionTier | undefined;
    if (explicit && (explicit === 'PRO' || explicit === 'PRO_PLUS')) return explicit;
    // fallback: identifica pela lookup_key do price
    const priceLookup = sub.items.data[0]?.price?.lookup_key;
    if (priceLookup === STRIPE_PRICE_LOOKUP_KEYS.PRO_PLUS_MONTHLY) return 'PRO_PLUS';
    if (priceLookup === STRIPE_PRICE_LOOKUP_KEYS.PRO_MONTHLY) return 'PRO';
    return 'FREE';
  }

  private statusFromStripe(s: Stripe.Subscription.Status): SubscriptionStatus {
    switch (s) {
      case 'active': return 'ACTIVE';
      case 'trialing': return 'TRIALING';
      case 'past_due': return 'PAST_DUE';
      case 'canceled': return 'CANCELED';
      default: return 'INCOMPLETE';
    }
  }
}
