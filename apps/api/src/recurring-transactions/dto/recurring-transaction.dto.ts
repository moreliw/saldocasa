import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { TransactionTypeDto } from '../../transactions/dto/transaction.dto';

export enum RecurringFrequencyDto {
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export class CreateRecurringTransactionDto {
  @IsEnum(TransactionTypeDto)
  type!: TransactionTypeDto;

  @IsString()
  @MinLength(1)
  @MaxLength(160)
  description!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Type(() => Number)
  amount!: number;

  @IsEnum(RecurringFrequencyDto)
  frequency!: RecurringFrequencyDto;

  @IsInt()
  @Min(1)
  @Max(31)
  @Type(() => Number)
  dueDay!: number;

  @IsDateString()
  startDate!: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsString()
  categoryId!: string;

  @IsOptional()
  @IsString()
  paymentMethodId?: string;
}

export class UpdateRecurringTransactionDto {
  @IsOptional()
  @IsEnum(TransactionTypeDto)
  type?: TransactionTypeDto;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  description?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Type(() => Number)
  amount?: number;

  @IsOptional()
  @IsEnum(RecurringFrequencyDto)
  frequency?: RecurringFrequencyDto;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  @Type(() => Number)
  dueDay?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string | null;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  paymentMethodId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class GenerateMonthDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;
}
