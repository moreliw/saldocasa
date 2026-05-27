import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBudgetDto, ListBudgetsQueryDto, UpdateBudgetDto } from './dto/budget.dto';

@Injectable()
export class BudgetsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(householdId: string, query: ListBudgetsQueryDto) {
    const now = new Date();
    const year = query.year ?? now.getFullYear();
    const month = query.month ?? now.getMonth() + 1;
    const monthStart = new Date(Date.UTC(year, month - 1, 1));
    const monthEnd = new Date(Date.UTC(year, month, 1));

    const budgets = await this.prisma.budget.findMany({
      where: { householdId, year, month },
      include: {
        category: { select: { id: true, name: true, color: true, type: true } },
      },
      orderBy: [{ category: { name: 'asc' } }],
    });
    if (budgets.length === 0) return { period: { year, month }, items: [] };

    const spent = await this.prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        householdId,
        deletedAt: null,
        type: 'EXPENSE',
        categoryId: { in: budgets.map((b) => b.categoryId) },
        transactionDate: { gte: monthStart, lt: monthEnd },
        status: { in: ['PAID', 'PENDING'] },
      },
      _sum: { amount: true },
    });
    const spentMap = new Map(spent.map((s) => [s.categoryId, Number(s._sum.amount ?? 0)]));

    return {
      period: { year, month },
      items: budgets.map((b) => {
        const planned = Number(b.plannedAmount);
        const spentValue = spentMap.get(b.categoryId) ?? 0;
        const ratio = planned > 0 ? spentValue / planned : 0;
        return {
          id: b.id,
          categoryId: b.categoryId,
          category: b.category,
          plannedAmount: planned,
          spent: spentValue,
          remaining: Math.max(planned - spentValue, 0),
          percent: Math.min(Math.round(ratio * 100), 999),
          status: ratio >= 1 ? 'over' : ratio >= 0.8 ? 'warning' : 'ok',
        };
      }),
    };
  }

  async create(householdId: string, dto: CreateBudgetDto) {
    await this.assertCategory(householdId, dto.categoryId);
    try {
      return await this.prisma.budget.create({
        data: {
          householdId,
          categoryId: dto.categoryId,
          month: dto.month,
          year: dto.year,
          plannedAmount: new Prisma.Decimal(dto.plannedAmount),
        },
        include: { category: { select: { id: true, name: true, color: true, type: true } } },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('Já existe orçamento para essa categoria nesse mês');
      }
      throw err;
    }
  }

  async update(householdId: string, id: string, dto: UpdateBudgetDto) {
    const existing = await this.prisma.budget.findFirst({ where: { id, householdId } });
    if (!existing) throw new NotFoundException('Orçamento não encontrado');
    return this.prisma.budget.update({
      where: { id },
      data: {
        ...(dto.plannedAmount !== undefined
          ? { plannedAmount: new Prisma.Decimal(dto.plannedAmount) }
          : {}),
      },
      include: { category: { select: { id: true, name: true, color: true, type: true } } },
    });
  }

  async remove(householdId: string, id: string) {
    const existing = await this.prisma.budget.findFirst({
      where: { id, householdId },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Orçamento não encontrado');
    await this.prisma.budget.delete({ where: { id } });
    return { ok: true };
  }

  private async assertCategory(householdId: string, id: string) {
    const c = await this.prisma.category.findFirst({
      where: { id, householdId },
      select: { id: true, type: true },
    });
    if (!c) throw new BadRequestException('Categoria inválida para esta casa');
    if (c.type !== 'EXPENSE') {
      throw new BadRequestException('Orçamentos só fazem sentido para categorias de saída');
    }
  }
}
