import { Logger, Provider } from '@nestjs/common';
import Stripe from 'stripe';

export const STRIPE_CLIENT = Symbol('STRIPE_CLIENT');

/** null se STRIPE_SECRET_KEY não estiver configurada (modo desativado). */
export type StripeClient = Stripe | null;

export const StripeProvider: Provider = {
  provide: STRIPE_CLIENT,
  useFactory: (): StripeClient => {
    const key = process.env.STRIPE_SECRET_KEY?.trim();
    const logger = new Logger('Stripe');
    if (!key) {
      logger.warn('STRIPE_SECRET_KEY não configurada — billing desativado, todos no plano FREE.');
      return null;
    }
    return new Stripe(key, { apiVersion: '2024-09-30.acacia' as Stripe.LatestApiVersion });
  },
};
