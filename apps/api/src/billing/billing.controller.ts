import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Post,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import type Stripe from 'stripe';
import { CurrentHousehold, CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import type { AuthUser } from '../auth/types';
import { BillingService } from './billing.service';
import { CreateCheckoutDto } from './dto/checkout.dto';
import { STRIPE_CLIENT, type StripeClient } from './stripe.provider';

@Controller('billing')
export class BillingController {
  constructor(
    private readonly service: BillingService,
    @Inject(STRIPE_CLIENT) private readonly stripe: StripeClient,
  ) {}

  @Get('state')
  state(@CurrentHousehold() householdId: string) {
    return this.service.getStateForHousehold(householdId);
  }

  @Post('checkout')
  checkout(
    @CurrentHousehold() householdId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateCheckoutDto,
  ) {
    return this.service.createCheckout(householdId, user.id, dto.tier);
  }

  @Post('portal')
  portal(@CurrentHousehold() householdId: string) {
    return this.service.createPortal(householdId);
  }

  /**
   * Webhook do Stripe. Body é raw (registrado em main.ts antes do JSON parser).
   * Verifica assinatura se STRIPE_WEBHOOK_SECRET está configurada.
   */
  @Public()
  @Post('webhook')
  @HttpCode(200)
  async webhook(@Req() req: Request) {
    if (!this.stripe) return { ok: true, ignored: 'stripe_disabled' as const };
    const sig = req.header('stripe-signature');
    const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event: Stripe.Event;
    const raw = (req as Request & { rawBody?: Buffer }).rawBody;
    if (!raw) throw new BadRequestException('Raw body ausente');
    if (whSecret && sig) {
      try {
        event = this.stripe.webhooks.constructEvent(raw, sig, whSecret);
      } catch (err) {
        throw new BadRequestException(
          `Assinatura inválida: ${err instanceof Error ? err.message : 'desconhecido'}`,
        );
      }
    } else {
      // sem secret configurado — usa o evento como veio (apenas dev)
      event = JSON.parse(raw.toString('utf8')) as Stripe.Event;
    }
    await this.service.handleWebhook(event);
    return { ok: true };
  }
}
