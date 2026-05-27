import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { TransactionTypeDto } from '../../transactions/dto/transaction.dto';

export class PeriodQueryDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}

export class ByCategoryQueryDto extends PeriodQueryDto {
  @IsOptional()
  @IsEnum(TransactionTypeDto)
  type?: TransactionTypeDto;
}

export class MonthlyComparisonQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(24)
  months?: number = 6;
}
