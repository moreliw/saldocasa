import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CurrentHousehold, CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/types';
import {
  CreateTransactionDto,
  ListTransactionsQueryDto,
  UpdateTransactionDto,
} from './dto/transaction.dto';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly service: TransactionsService) {}

  @Get()
  list(@CurrentHousehold() householdId: string, @Query() query: ListTransactionsQueryDto) {
    return this.service.list(householdId, query);
  }

  @Get(':id')
  findOne(@CurrentHousehold() householdId: string, @Param('id') id: string) {
    return this.service.findOne(householdId, id);
  }

  @Post()
  create(
    @CurrentHousehold() householdId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateTransactionDto,
  ) {
    return this.service.create(householdId, user.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentHousehold() householdId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.service.update(householdId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentHousehold() householdId: string, @Param('id') id: string) {
    return this.service.remove(householdId, id);
  }
}
