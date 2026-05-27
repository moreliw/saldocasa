import { Global, Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { PlanService } from './plan.service';
import { StripeProvider } from './stripe.provider';

@Global()
@Module({
  controllers: [BillingController],
  providers: [StripeProvider, BillingService, PlanService],
  exports: [BillingService, PlanService, StripeProvider],
})
export class BillingModule {}
