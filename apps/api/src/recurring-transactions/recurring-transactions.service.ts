import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, RecurringFrequency, TransactionType } from '@prisma/client';
import { PlanService } from '../billing/plan.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateRecurringTransactionDto,
  GenerateMonthDto,
  UpdateRecurringTransactionDto,
} from './dto/recurring-transaction.dto';

@Injectable()
export class RecurringTransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly planService: PlanService,
  ) {}

  list(householdId: string) {
    return this.prisma.recurringTransaction.findMany({
      where: { householdId },
      orderBy: [{ isActive: 'desc' }, { description: 'asc' }],
      include: {
        category: { select: { id: true, name: true, color: true, type: true } },
        paymentMethod: { select: { id: true, name: true } },
      },
    });
  }

  async create(householdId: string, userId: string, dto: CreateRecurringTransactionDto) {
    await this.planService.assertCanUseRecurring(householdId);
    await this.assertCategory(householdId, dto.categoryId, dto.type);
    if (dto.paymentMethodId) await this.assertPaymentMethod(householdId, dto.paymentMethodId);

    return this.prisma.recurringTransaction.create({
      data: {
        householdId,
        categoryId: dto.categoryId,
        paymentMethodId: dto.paymentMethodId ?? null,
        type: dto.type,
        description: dto.description.trim(),
        amount: new Prisma.Decimal(dto.amount),
        frequency: dto.frequency,
        dueDay: dto.dueDay,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        isActive: true,
      },
      include: {
        category: { select: { id: true, name: true, color: true, type: true } },
        paymentMethod: { select: { id: true, name: true } },
      },
    });
    void userId;
  }

  async update(householdId: string, id: string, dto: UpdateRecurringTransactionDto) {
    const existing = await this.prisma.recurringTransaction.findFirst({
      where: { id, householdId },
    });
    if (!existing) throw new NotFoundException('Recorrência não encontrada');

    const nextType = dto.type ?? existing.type;
    const nextCategoryId = dto.categoryId ?? existing.categoryId;
    if (dto.type || dto.categoryId) {
      await this.assertCategory(householdId, nextCategoryId, nextType);
    }
    if (dto.paymentMethodId !== undefined && dto.paymentMethodId !== null) {
      await this.assertPaymentMethod(householdId, dto.paymentMethodId);
    }

    return this.prisma.recurringTransaction.update({
      where: { id },
      data: {
        ...(dto.type ? { type: dto.type } : {}),
        ...(dto.description !== undefined ? { description: dto.description.trim() } : {}),
        ...(dto.amount !== undefined ? { amount: new Prisma.Decimal(dto.amount) } : {}),
        ...(dto.frequency ? { frequency: dto.frequency } : {}),
        ...(dto.dueDay !== undefined ? { dueDay: dto.dueDay } : {}),
        ...(dto.startDate ? { startDate: new Date(dto.startDate) } : {}),
        ...(dto.endDate !== undefined
          ? { endDate: dto.endDate ? new Date(dto.endDate) : null }
          : {}),
        ...(dto.categoryId ? { categoryId: dto.categoryId } : {}),
        ...(dto.paymentMethodId !== undefined
          ? { paymentMethodId: dto.paymentMethodId || null }
          : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
      include: {
        category: { select: { id: true, name: true, color: true, type: true } },
        paymentMethod: { select: { id: true, name: true } },
      },
    });
  }

  async remove(householdId: string, id: string) {
    const r = await this.prisma.recurringTransaction.findFirst({
      where: { id, householdId },
      select: { id: true },
    });
    if (!r) throw new NotFoundException('Recorrência não encontrada');
    await this.prisma.recurringTransaction.delete({ where: { id } });
    return { ok: true };
  }

  /**
   * Gera lançamentos do mês alvo a partir das recorrências ativas.
   * Idempotente: só cria se ainda não houver transação com recurringTransactionId
   * na data alvo daquela recorrência.
   */
  async generateMonth(householdId: string, userId: string, dto: GenerateMonthDto) {
    const now = new Date();
    const year = dto.year ?? now.getFullYear();
    const month = dto.month ?? now.getMonth() + 1;
    const monthStart = new Date(Date.UTC(year, month - 1, 1));
    const monthEnd = new Date(Date.UTC(year, month, 1));

    const recurrings = await this.prisma.recurringTransaction.findMany({
      where: {
        householdId,
        isActive: true,
        startDate: { lt: monthEnd },
        OR: [{ endDate: null }, { endDate: { gte: monthStart } }],
      },
    });

    const occurrences = recurrings.flatMap((r) => this.occurrencesInMonth(r, year, month));
    if (occurrences.length === 0) {
      return { created: 0, skipped: 0, items: [] as { id: string; date: string }[] };
    }

    // descobre quais já existem (por recurringTransactionId + data)
    const existing = await this.prisma.transaction.findMany({
      where: {
        householdId,
        recurringTransactionId: { in: occurrences.map((o) => o.recurring.id) },
        transactionDate: { gte: monthStart, lt: monthEnd },
        deletedAt: null,
      },
      select: { recurringTransactionId: true, transactionDate: true },
    });
    const existingKey = new Set(
      existing.map(
        (e) =>
          `${e.recurringTransactionId}|${e.transactionDate.toISOString().slice(0, 10)}`,
      ),
    );

    const toCreate = occurrences.filter(
      (o) => !existingKey.has(`${o.recurring.id}|${o.dateISO}`),
    );

    if (toCreate.length === 0) {
      return { created: 0, skipped: occurrences.length, items: [] };
    }

    await this.prisma.$transaction(
      toCreate.map((o) =>
        this.prisma.transaction.create({
          data: {
            householdId,
            userId,
            categoryId: o.recurring.categoryId,
            paymentMethodId: o.recurring.paymentMethodId,
            type: o.recurring.type,
            description: o.recurring.description,
            amount: o.recurring.amount,
            transactionDate: new Date(o.dateISO),
            status: 'PENDING',
            isRecurring: true,
            recurringTransactionId: o.recurring.id,
          },
        }),
      ),
    );

    return {
      created: toCreate.length,
      skipped: occurrences.length - toCreate.length,
      items: toCreate.map((o) => ({ id: o.recurring.id, date: o.dateISO })),
    };
  }

  private occurrencesInMonth(
    r: {
      id: string;
      categoryId: string;
      paymentMethodId: string | null;
      type: TransactionType;
      description: string;
      amount: Prisma.Decimal;
      frequency: RecurringFrequency;
      dueDay: number;
      startDate: Date;
      endDate: Date | null;
    },
    year: number,
    month: number,
  ): Array<{ recurring: typeof r; dateISO: string }> {
    const monthStart = new Date(Date.UTC(year, month - 1, 1));
    const monthEnd = new Date(Date.UTC(year, month, 1));
    const daysInMonth = new Date(year, month, 0).getDate();
    const within = (d: Date) => d >= r.startDate && (!r.endDate || d <= r.endDate);

    const result: Array<{ recurring: typeof r; dateISO: string }> = [];

    if (r.frequency === 'MONTHLY') {
      const day = Math.min(r.dueDay, daysInMonth);
      const date = new Date(Date.UTC(year, month - 1, day));
      if (within(date)) result.push({ recurring: r, dateISO: this.iso(date) });
    } else if (r.frequency === 'YEARLY') {
      // dueDay representa o dia do mês; aplicamos apenas se o mês de startDate bate
      const startMonth = r.startDate.getUTCMonth() + 1;
      if (startMonth === month) {
        const day = Math.min(r.dueDay, daysInMonth);
        const date = new Date(Date.UTC(year, month - 1, day));
        if (within(date)) result.push({ recurring: r, dateISO: this.iso(date) });
      }
    } else if (r.frequency === 'WEEKLY') {
      // gera todas as ocorrências semanais (mesmo dia da semana de startDate)
      const dow = r.startDate.getUTCDay();
      const firstDay = new Date(monthStart);
      const offset = (dow - firstDay.getUTCDay() + 7) % 7;
      firstDay.setUTCDate(firstDay.getUTCDate() + offset);
      for (let d = new Date(firstDay); d < monthEnd; d.setUTCDate(d.getUTCDate() + 7)) {
        if (within(d)) result.push({ recurring: r, dateISO: this.iso(d) });
      }
    }
    return result;
  }

  private iso(d: Date) {
    return d.toISOString().slice(0, 10);
  }

  private async assertCategory(householdId: string, id: string, type: string) {
    const c = await this.prisma.category.findFirst({
      where: { id, householdId },
      select: { id: true, type: true },
    });
    if (!c) throw new BadRequestException('Categoria inválida para esta casa');
    if (c.type !== type)
      throw new BadRequestException('Tipo da categoria não bate com o tipo da recorrência');
  }

  private async assertPaymentMethod(householdId: string, id: string) {
    const pm = await this.prisma.paymentMethod.findFirst({
      where: { id, householdId },
      select: { id: true },
    });
    if (!pm) throw new BadRequestException('Forma de pagamento inválida para esta casa');
  }
}
