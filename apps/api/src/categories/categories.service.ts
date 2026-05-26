import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, ListCategoriesQueryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  list(householdId: string, query: ListCategoriesQueryDto) {
    return this.prisma.category.findMany({
      where: {
        householdId,
        ...(query.type ? { type: query.type } : {}),
      },
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
    });
  }

  async create(householdId: string, dto: CreateCategoryDto) {
    try {
      return await this.prisma.category.create({
        data: {
          householdId,
          name: dto.name.trim(),
          type: dto.type,
          color: dto.color ?? '#64748b',
          icon: dto.icon ?? null,
        },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('Já existe uma categoria com esse nome e tipo');
      }
      throw err;
    }
  }

  async update(householdId: string, id: string, dto: UpdateCategoryDto) {
    await this.ensureOwned(householdId, id);
    try {
      return await this.prisma.category.update({
        where: { id },
        data: {
          ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
          ...(dto.color !== undefined ? { color: dto.color } : {}),
          ...(dto.icon !== undefined ? { icon: dto.icon } : {}),
          ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('Já existe uma categoria com esse nome e tipo');
      }
      throw err;
    }
  }

  async remove(householdId: string, id: string) {
    await this.ensureOwned(householdId, id);
    const usedCount = await this.prisma.transaction.count({
      where: { categoryId: id, deletedAt: null },
    });
    if (usedCount > 0) {
      // soft inativa em vez de excluir
      return this.prisma.category.update({
        where: { id },
        data: { isActive: false },
      });
    }
    return this.prisma.category.delete({ where: { id } });
  }

  private async ensureOwned(householdId: string, id: string) {
    const found = await this.prisma.category.findFirst({
      where: { id, householdId },
      select: { id: true },
    });
    if (!found) throw new NotFoundException('Categoria não encontrada');
  }
}
