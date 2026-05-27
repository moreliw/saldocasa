import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateBudgetDto {
  @IsString()
  categoryId!: string;

  @IsInt()
  @Min(1)
  @Max(12)
  @Type(() => Number)
  month!: number;

  @IsInt()
  @Min(2000)
  @Max(2100)
  @Type(() => Number)
  year!: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Type(() => Number)
  plannedAmount!: number;
}

export class UpdateBudgetDto {
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Type(() => Number)
  plannedAmount?: number;
}

export class ListBudgetsQueryDto {
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
