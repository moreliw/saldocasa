import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateTransactionDto,
  ListTransactionsQueryDto,
  UpdateTransactionDto,
} from './dto/transaction.dto';

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(householdId: string, query: ListTransactionsQueryDto) {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, query.pageSize ?? DEFAULT_PAGE_SIZE));

    const where: Prisma.TransactionWhereInput = {
      householdId,
      deletedAt: null,
      ...(query.type ? { type: query.type } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.paymentMethodId ? { paymentMethodId: query.paymentMethodId } : {}),
      ...(query.q
        ? { description: { contains: query.q.trim(), mode: 'insensitive' as const } }
        : {}),
      ...(query.from || query.to
        ? {
            transactionDate: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to ? { lte: new Date(query.to) } : {}),
            },
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.transaction.findMany({
        where,
        orderBy: [{ transactionDate: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          category: { select: { id: true, name: true, color: true, type: true } },
          paymentMethod: { select: { id: true, name: true } },
        },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      items: items.map(this.serialize),
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  async findOne(householdId: string, id: string) {
    const tx = await this.prisma.transaction.findFirst({
      where: { id, householdId, deletedAt: null },
      include: {
        category: { select: { id: true, name: true, color: true, type: true } },
        paymentMethod: { select: { id: true, name: true } },
      },
    });
    if (!tx) throw new NotFoundException('Lançamento não encontrado');
    return this.serialize(tx);
  }

  async create(householdId: string, userId: string, dto: CreateTransactionDto) {
    await this.assertCategory(householdId, dto.categoryId, dto.type);
    if (dto.paymentMethodId) await this.assertPaymentMethod(householdId, dto.paymentMethodId);

    const tx = await this.prisma.transaction.create({
      data: {
        householdId,
        userId,
        categoryId: dto.categoryId,
        paymentMethodId: dto.paymentMethodId ?? null,
        type: dto.type,
        description: dto.description.trim(),
        amount: new Prisma.Decimal(dto.amount),
        transactionDate: new Date(dto.transactionDate),
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        status: dto.status ?? 'PAID',
        notes: dto.notes?.trim() ?? null,
      },
      include: {
        category: { select: { id: true, name: true, color: true, type: true } },
        paymentMethod: { select: { id: true, name: true } },
      },
    });
    return this.serialize(tx);
  }

  async update(householdId: string, id: string, dto: UpdateTransactionDto) {
    const existing = await this.prisma.transaction.findFirst({
      where: { id, householdId, deletedAt: null },
    });
    if (!existing) throw new NotFoundException('Lançamento não encontrado');

    const nextType = dto.type ?? existing.type;
    const nextCategoryId = dto.categoryId ?? existing.categoryId;
    if (dto.categoryId || dto.type) {
      await this.assertCategory(householdId, nextCategoryId, nextType);
    }
    if (dto.paymentMethodId !== undefined && dto.paymentMethodId !== null) {
      await this.assertPaymentMethod(householdId, dto.paymentMethodId);
    }

    const updated = await this.prisma.transaction.update({
      where: { id },
      data: {
        ...(dto.type ? { type: dto.type } : {}),
        ...(dto.description !== undefined ? { description: dto.description.trim() } : {}),
        ...(dto.amount !== undefined ? { amount: new Prisma.Decimal(dto.amount) } : {}),
        ...(dto.transactionDate ? { transactionDate: new Date(dto.transactionDate) } : {}),
        ...(dto.dueDate !== undefined
          ? { dueDate: dto.dueDate ? new Date(dto.dueDate) : null }
          : {}),
        ...(dto.categoryId ? { categoryId: dto.categoryId } : {}),
        ...(dto.paymentMethodId !== undefined
          ? { paymentMethodId: dto.paymentMethodId || null }
          : {}),
        ...(dto.status ? { status: dto.status } : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes?.trim() || null } : {}),
      },
      include: {
        category: { select: { id: true, name: true, color: true, type: true } },
        paymentMethod: { select: { id: true, name: true } },
      },
    });
    return this.serialize(updated);
  }

  async remove(householdId: string, id: string) {
    const existing = await this.prisma.transaction.findFirst({
      where: { id, householdId, deletedAt: null },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Lançamento não encontrado');
    await this.prisma.transaction.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { ok: true };
  }

  private async assertCategory(householdId: string, id: string, type: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, householdId },
      select: { id: true, type: true, isActive: true },
    });
    if (!category) throw new BadRequestException('Categoria inválida para esta casa');
    if (category.type !== type) {
      throw new BadRequestException('Tipo da categoria não bate com o tipo do lançamento');
    }
  }

  private async assertPaymentMethod(householdId: string, id: string) {
    const pm = await this.prisma.paymentMethod.findFirst({
      where: { id, householdId },
      select: { id: true },
    });
    if (!pm) throw new BadRequestException('Forma de pagamento inválida para esta casa');
  }

  private serialize = <T extends { amount: Prisma.Decimal; transactionDate: Date; dueDate: Date | null }>(
    tx: T,
  ) => ({
    ...tx,
    amount: tx.amount.toString(),
    transactionDate: tx.transactionDate.toISOString().slice(0, 10),
    dueDate: tx.dueDate ? tx.dueDate.toISOString().slice(0, 10) : null,
  });
}
