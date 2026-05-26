import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import {
  AUTH_TOKEN_TTL_SECONDS,
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
  DEFAULT_PAYMENT_METHODS,
} from './auth.constants';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import type { AuthUser, JwtPayload } from './types';

export interface AuthResult {
  token: string;
  user: AuthUser;
  householdId: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResult> {
    const email = dto.email.toLowerCase().trim();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('E-mail já cadastrado');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const householdName = (dto.householdName?.trim() || 'Casa Principal').slice(0, 80);

    // Tudo numa transação: usuário + household + membership + seeds.
    const { user, household } = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { name: dto.name.trim(), email, passwordHash },
      });
      const household = await tx.household.create({
        data: { name: householdName, ownerUserId: user.id },
      });
      await tx.householdUser.create({
        data: { householdId: household.id, userId: user.id, role: 'OWNER' },
      });
      await tx.category.createMany({
        data: [
          ...DEFAULT_EXPENSE_CATEGORIES.map((c) => ({
            householdId: household.id,
            name: c.name,
            type: 'EXPENSE' as const,
            color: c.color,
          })),
          ...DEFAULT_INCOME_CATEGORIES.map((c) => ({
            householdId: household.id,
            name: c.name,
            type: 'INCOME' as const,
            color: c.color,
          })),
        ],
      });
      await tx.paymentMethod.createMany({
        data: DEFAULT_PAYMENT_METHODS.map((name) => ({
          householdId: household.id,
          name,
        })),
      });
      await tx.auditLog.create({
        data: {
          householdId: household.id,
          userId: user.id,
          action: 'USER_REGISTERED',
          entity: 'User',
          entityId: user.id,
          newValue: { email: user.email, name: user.name },
        },
      });
      return { user, household };
    });

    return {
      token: await this.signToken(user.id, user.email),
      user: { id: user.id, email: user.email, name: user.name },
      householdId: household.id,
    };
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const email = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }
    const membership = await this.prisma.householdUser.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'asc' },
      select: { householdId: true },
    });
    if (!membership) {
      throw new UnauthorizedException('Usuário sem household');
    }
    return {
      token: await this.signToken(user.id, user.email),
      user: { id: user.id, email: user.email, name: user.name },
      householdId: membership.householdId,
    };
  }

  private async signToken(userId: string, email: string): Promise<string> {
    const payload: JwtPayload = { sub: userId, email };
    return this.jwt.signAsync(payload, { expiresIn: AUTH_TOKEN_TTL_SECONDS });
  }
}
