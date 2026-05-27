import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { CurrentHousehold, CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/types';
import { PlanService } from '../billing/plan.service';
import {
  CreateTransactionDto,
  ListTransactionsQueryDto,
  UpdateTransactionDto,
} from './dto/transaction.dto';
import { TransactionsService } from './transactions.service';

function csvCell(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly service: TransactionsService,
    private readonly planService: PlanService,
  ) {}

  @Get()
  list(@CurrentHousehold() householdId: string, @Query() query: ListTransactionsQueryDto) {
    return this.service.list(householdId, query);
  }

  @Get('export.csv')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  async exportCsv(
    @CurrentHousehold() householdId: string,
    @Query() query: ListTransactionsQueryDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.planService.assertCanExport(householdId);
    // baixa tudo respeitando os filtros, sem paginação
    const all = await this.service.list(householdId, { ...query, page: 1, pageSize: 10000 });
    const filename = `transacoes_${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    const header = [
      'data',
      'tipo',
      'descricao',
      'categoria',
      'forma_pagamento',
      'status',
      'valor',
      'observacao',
    ].join(',');
    const rows = all.items.map((t) =>
      [
        t.transactionDate,
        t.type === 'INCOME' ? 'Entrada' : 'Saída',
        csvCell(t.description),
        csvCell(t.category.name),
        csvCell(t.paymentMethod?.name ?? ''),
        t.status,
        t.amount,
        csvCell(t.notes ?? ''),
      ].join(','),
    );
    return '﻿' + [header, ...rows].join('\n') + '\n';
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
