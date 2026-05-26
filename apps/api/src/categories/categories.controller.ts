import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CurrentHousehold } from '../auth/decorators/current-user.decorator';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, ListCategoriesQueryDto, UpdateCategoryDto } from './dto/category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly service: CategoriesService) {}

  @Get()
  list(@CurrentHousehold() householdId: string, @Query() query: ListCategoriesQueryDto) {
    return this.service.list(householdId, query);
  }

  @Post()
  create(@CurrentHousehold() householdId: string, @Body() dto: CreateCategoryDto) {
    return this.service.create(householdId, dto);
  }

  @Patch(':id')
  update(
    @CurrentHousehold() householdId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.service.update(householdId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentHousehold() householdId: string, @Param('id') id: string) {
    return this.service.remove(householdId, id);
  }
}
