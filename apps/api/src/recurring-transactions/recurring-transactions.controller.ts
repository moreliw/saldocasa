import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CurrentHousehold, CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/types';
import {
  CreateRecurringTransactionDto,
  GenerateMonthDto,
  UpdateRecurringTransactionDto,
} from './dto/recurring-transaction.dto';
import { RecurringTransactionsService } from './recurring-transactions.service';

@Controller('recurring-transactions')
export class RecurringTransactionsController {
  constructor(private readonly service: RecurringTransactionsService) {}

  @Get()
  list(@CurrentHousehold() householdId: string) {
    return this.service.list(householdId);
  }

  @Post()
  create(
    @CurrentHousehold() householdId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateRecurringTransactionDto,
  ) {
    return this.service.create(householdId, user.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentHousehold() householdId: string,
    @Param('id') id: string,
    @Body() dto: UpdateRecurringTransactionDto,
  ) {
    return this.service.update(householdId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentHousehold() householdId: string, @Param('id') id: string) {
    return this.service.remove(householdId, id);
  }

  @Post('generate-month')
  generate(
    @CurrentHousehold() householdId: string,
    @CurrentUser() user: AuthUser,
    @Query() query: GenerateMonthDto,
  ) {
    return this.service.generateMonth(householdId, user.id, query);
  }
}
