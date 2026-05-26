import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardSummaryQueryDto } from './dto/dashboard.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async summary(householdId: string, query: DashboardSummaryQueryDto) {
    const now = new Date();
    const year = query.year ?? now.getFullYear();
    const month = query.month ?? now.getMonth() + 1;
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));

    const baseWhere: Prisma.TransactionWhereInput = {
      householdId,
      deletedAt: null,
      transactionDate: { gte: start, lt: end },
    };

    const [byTypeStatus, byCategoryRaw, latest, txCount] = await Promise.all([
      this.prisma.transaction.groupBy({
        by: ['type', 'status'],
        where: baseWhere,
        _sum: { amount: true },
      }),
      this.prisma.transaction.groupBy({
        by: ['categoryId'],
        where: { ...baseWhere, type: 'EXPENSE', status: 'PAID' },
        _sum: { amount: true },
        orderBy: { _sum: { amount: 'desc' } },
        take: 8,
      }),
      this.prisma.transaction.findMany({
        where: baseWhere,
        orderBy: [{ transactionDate: 'desc' }, { createdAt: 'desc' }],
        take: 6,
        include: {
          category: { select: { id: true, name: true, color: true, type: true } },
        },
      }),
      this.prisma.transaction.count({ where: baseWhere }),
    ]);

    const sumOf = (type: 'INCOME' | 'EXPENSE', status: 'PAID' | 'PENDING') =>
      byTypeStatus
        .filter((r) => r.type === type && r.status === status)
        .reduce((acc, r) => acc + Number(r._sum.amount ?? 0), 0);

    const incomePaid = sumOf('INCOME', 'PAID');
    const incomePending = sumOf('INCOME', 'PENDING');
    const expensePaid = sumOf('EXPENSE', 'PAID');
    const expensePending = sumOf('EXPENSE', 'PENDING');

    const categoryIds = byCategoryRaw.map((r) => r.categoryId);
    const categories = categoryIds.length
      ? await this.prisma.category.findMany({
          where: { id: { in: categoryIds } },
          select: { id: true, name: true, color: true },
        })
      : [];
    const catMap = new Map(categories.map((c) => [c.id, c]));

    const byCategory = byCategoryRaw.map((r) => {
      const c = catMap.get(r.categoryId);
      return {
        categoryId: r.categoryId,
        name: c?.name ?? 'Categoria',
        color: c?.color ?? '#64748b',
        amount: Number(r._sum.amount ?? 0),
      };
    });

    return {
      period: { year, month },
      totals: {
        balance: incomePaid - expensePaid,
        income: incomePaid,
        expense: expensePaid,
        incomePending,
        expensePending,
        forecastBalance: incomePaid + incomePending - expensePaid - expensePending,
        txCount,
      },
      byCategory,
      latestTransactions: latest.map((t) => ({
        id: t.id,
        type: t.type,
        description: t.description,
        amount: t.amount.toString(),
        transactionDate: t.transactionDate.toISOString().slice(0, 10),
        status: t.status,
        category: t.category,
      })),
    };
  }
}
