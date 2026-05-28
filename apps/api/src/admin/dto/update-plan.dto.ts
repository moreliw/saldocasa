import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { SubscriptionStatus, SubscriptionTier } from '@prisma/client';

export class UpdatePlanDto {
  @IsEnum(SubscriptionTier)
  tier!: SubscriptionTier;

  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;

  @IsOptional()
  @IsBoolean()
  clearStripe?: boolean;
}
