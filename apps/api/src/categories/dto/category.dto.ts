import { IsBoolean, IsEnum, IsHexColor, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export enum CategoryTypeDto {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export class CreateCategoryDto {
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  name!: string;

  @IsEnum(CategoryTypeDto)
  type!: CategoryTypeDto;

  @IsOptional()
  @IsHexColor()
  color?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  icon?: string;
}

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  name?: string;

  @IsOptional()
  @IsHexColor()
  color?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  icon?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ListCategoriesQueryDto {
  @IsOptional()
  @IsEnum(CategoryTypeDto)
  type?: CategoryTypeDto;
}
