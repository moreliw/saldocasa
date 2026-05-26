import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentMethodDto, UpdatePaymentMethodDto } from './dto/payment-method.dto';

@Injectable()
export class PaymentMethodsService {
  constructor(private readonly prisma: PrismaService) {}

  list(householdId: string) {
    return this.prisma.paymentMethod.findMany({
      where: { householdId },
      orderBy: { name: 'asc' },
    });
  }

  async create(householdId: string, dto: CreatePaymentMethodDto) {
    try {
      return await this.prisma.paymentMethod.create({
        data: { householdId, name: dto.name.trim() },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('Já existe uma forma de pagamento com esse nome');
      }
      throw err;
    }
  }

  async update(householdId: string, id: string, dto: UpdatePaymentMethodDto) {
    await this.ensureOwned(householdId, id);
    try {
      return await this.prisma.paymentMethod.update({
        where: { id },
        data: {
          ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
          ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('Já existe uma forma de pagamento com esse nome');
      }
      throw err;
    }
  }

  async remove(householdId: string, id: string) {
    await this.ensureOwned(householdId, id);
    const used = await this.prisma.transaction.count({
      where: { paymentMethodId: id, deletedAt: null },
    });
    if (used > 0) {
      return this.prisma.paymentMethod.update({ where: { id }, data: { isActive: false } });
    }
    return this.prisma.paymentMethod.delete({ where: { id } });
  }

  private async ensureOwned(householdId: string, id: string) {
    const found = await this.prisma.paymentMethod.findFirst({
      where: { id, householdId },
      select: { id: true },
    });
    if (!found) throw new NotFoundException('Forma de pagamento não encontrada');
  }
}
