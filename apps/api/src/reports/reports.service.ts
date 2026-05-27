import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  ByCategoryQueryDto,
  MonthlyComparisonQueryDto,
  PeriodQueryDto,
} from './dto/report.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  private resolvePeriod(query: PeriodQueryDto) {
    const now = new Date();
    const to = query.to
      ? new Date(query.to)
      : new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 1));
    const from = query.from
      ? new Date(query.from)
      : new Date(Date.UTC(now.getFullYear(), now.getMonth() - 5, 1));
    return { from, to };
  }

  async cashFlow(householdId: string, query: PeriodQueryDto) {
    const { from, to } = this.resolvePeriod(query);
    const rows = await this.prisma.$queryRaw<
      Array<{ ym: string; income: string; expense: string }>
    >(Prisma.sql`
      SELECT
        to_char(transaction_date, 'YYYY-MM') AS ym,
        COALESCE(SUM(CASE WHEN type='INCOME'  AND status='PAID' THEN amount END), 0)::text AS income,
        COALESCE(SUM(CASE WHEN type='EXPENSE' AND status='PAID' THEN amount END), 0)::text AS expense
      FROM transactions
      WHERE household_id = ${householdId}
        AND deleted_at IS NULL
        AND transaction_date >= ${from}
        AND transaction_date < ${to}
      GROUP BY ym
      ORDER BY ym ASC
    `);
    return rows.map((r) => ({
      ym: r.ym,
      income: Number(r.income),
      expense: Number(r.expense),
      balance: Number(r.income) - Number(r.expense),
    }));
  }

  async byCategory(householdId: string, query: ByCategoryQueryDto) {
    const { from, to } = this.resolvePeriod(query);
    const grouped = await this.prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        householdId,
        deletedAt: null,
        status: 'PAID',
        ...(query.type ? { type: query.type } : {}),
        transactionDate: { gte: from, lt: to },
      },
      _sum: { amount: true },
      _count: { _all: true },
      orderBy: { _sum: { amount: 'desc' } },
    });
    if (grouped.length === 0) return [];
    const cats = await this.prisma.category.findMany({
      where: { id: { in: grouped.map((g) => g.categoryId) } },
      select: { id: true, name: true, color: true, type: true },
    });
    const map = new Map(cats.map((c) => [c.id, c]));
    return grouped.map((g) => ({
      categoryId: g.categoryId,
      name: map.get(g.categoryId)?.name ?? 'Categoria',
      color: map.get(g.categoryId)?.color ?? '#64748b',
      type: map.get(g.categoryId)?.type ?? 'EXPENSE',
      amount: Number(g._sum.amount ?? 0),
      count: g._count._all,
    }));
  }

  async byPaymentMethod(householdId: string, query: PeriodQueryDto) {
    const { from, to } = this.resolvePeriod(query);
    const grouped = await this.prisma.transaction.groupBy({
      by: ['paymentMethodId'],
      where: {
        householdId,
        deletedAt: null,
        status: 'PAID',
        transactionDate: { gte: from, lt: to },
      },
      _sum: { amount: true },
      _count: { _all: true },
    });
    if (grouped.length === 0) return [];
    const ids = grouped.map((g) => g.paymentMethodId).filter((id): id is string => !!id);
    const pms = ids.length
      ? await this.prisma.paymentMethod.findMany({
          where: { id: { in: ids } },
          select: { id: true, name: true },
        })
      : [];
    const map = new Map(pms.map((p) => [p.id, p]));
    return grouped.map((g) => ({
      paymentMethodId: g.paymentMethodId,
      name: g.paymentMethodId ? map.get(g.paymentMethodId)?.name ?? '—' : 'Sem forma',
      amount: Number(g._sum.amount ?? 0),
      count: g._count._all,
    }));
  }

  async monthlyComparison(householdId: string, query: MonthlyComparisonQueryDto) {
    const months = query.months ?? 6;
    const now = new Date();
    const from = new Date(Date.UTC(now.getFullYear(), now.getMonth() - (months - 1), 1));
    const to = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 1));
    const flow = await this.cashFlow(householdId, {
      from: from.toISOString().slice(0, 10),
      to: to.toISOString().slice(0, 10),
    });
    // Garante slots vazios para meses sem dados
    const series: Array<{ ym: string; income: number; expense: number; balance: number }> = [];
    for (let i = 0; i < months; i++) {
      const d = new Date(Date.UTC(now.getFullYear(), now.getMonth() - (months - 1) + i, 1));
      const ym = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
      const found = flow.find((f) => f.ym === ym);
      series.push({
        ym,
        income: found?.income ?? 0,
        expense: found?.expense ?? 0,
        balance: found?.balance ?? 0,
      });
    }
    return series;
  }
}
