import { IsEnum } from 'class-validator';

export enum CheckoutTierDto {
  PRO = 'PRO',
  PRO_PLUS = 'PRO_PLUS',
}

export class CreateCheckoutDto {
  @IsEnum(CheckoutTierDto)
  tier!: CheckoutTierDto;
}
