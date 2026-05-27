-- Billing: plano de assinatura por household

CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'PRO', 'PRO_PLUS');
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELED', 'INCOMPLETE', 'TRIALING');

ALTER TABLE "households"
  ADD COLUMN "subscription_tier" "SubscriptionTier" NOT NULL DEFAULT 'FREE',
  ADD COLUMN "subscription_status" "SubscriptionStatus",
  ADD COLUMN "stripe_customer_id" TEXT,
  ADD COLUMN "stripe_subscription_id" TEXT,
  ADD COLUMN "current_period_end" TIMESTAMP(3);

CREATE UNIQUE INDEX "households_stripe_customer_id_key" ON "households"("stripe_customer_id");
CREATE UNIQUE INDEX "households_stripe_subscription_id_key" ON "households"("stripe_subscription_id");
