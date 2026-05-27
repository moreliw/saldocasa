import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CurrentHousehold } from '../auth/decorators/current-user.decorator';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto, ListBudgetsQueryDto, UpdateBudgetDto } from './dto/budget.dto';

@Controller('budgets')
export class BudgetsController {
  constructor(private readonly service: BudgetsService) {}

  @Get()
  list(@CurrentHousehold() householdId: string, @Query() query: ListBudgetsQueryDto) {
    return this.service.list(householdId, query);
  }

  @Post()
  create(@CurrentHousehold() householdId: string, @Body() dto: CreateBudgetDto) {
    return this.service.create(householdId, dto);
  }

  @Patch(':id')
  update(
    @CurrentHousehold() householdId: string,
    @Param('id') id: string,
    @Body() dto: UpdateBudgetDto,
  ) {
    return this.service.update(householdId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentHousehold() householdId: string, @Param('id') id: string) {
    return this.service.remove(householdId, id);
  }
}
