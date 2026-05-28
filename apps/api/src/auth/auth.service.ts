import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
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
import { UpdateProfileDto } from './dto/update-profile.dto';
import type { AuthUser, JwtPayload } from './types';

export interface AuthResult {
  token: string;
  user: AuthUser;
  householdId: string | null;
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

    // Caso 1: usuário entrou via convite — vira membro da household existente
    if (dto.inviteToken) {
      const invite = await this.prisma.householdInvite.findUnique({
        where: { token: dto.inviteToken },
      });
      if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
        throw new BadRequestException('Convite inválido ou expirado');
      }
      const result = await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: { name: dto.name.trim(), email, passwordHash },
        });
        await tx.householdUser.create({
          data: { householdId: invite.householdId, userId: user.id, role: invite.role },
        });
        await tx.householdInvite.update({
          where: { id: invite.id },
          data: { acceptedAt: new Date(), acceptedById: user.id },
        });
        await tx.auditLog.create({
          data: {
            householdId: invite.householdId,
            userId: user.id,
            action: 'USER_REGISTERED_VIA_INVITE',
            entity: 'User',
            entityId: user.id,
            newValue: { email: user.email, name: user.name, inviteId: invite.id },
          },
        });
        return { user, householdId: invite.householdId };
      });
      return {
        token: await this.signToken(result.user.id, result.user.email),
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          isSuperAdmin: false,
        },
        householdId: result.householdId,
      };
    }

    // Caso 2: usuário novo cria a própria household + seed
    const householdName = (dto.householdName?.trim() || 'Casa Principal').slice(0, 80);
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
      user: { id: user.id, email: user.email, name: user.name, isSuperAdmin: user.isSuperAdmin },
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
    // Super admin pode logar sem ter household — vai direto pra /admin
    if (!membership && !user.isSuperAdmin) {
      throw new UnauthorizedException('Usuário sem household');
    }
    return {
      token: await this.signToken(user.id, user.email),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isSuperAdmin: user.isSuperAdmin,
      },
      householdId: membership?.householdId ?? null,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();

    const data: { name?: string; passwordHash?: string } = {};

    if (dto.name !== undefined) {
      data.name = dto.name.trim();
    }

    if (dto.newPassword) {
      if (!dto.currentPassword) {
        throw new BadRequestException('Senha atual obrigatória para alterar a senha');
      }
      const ok = await bcrypt.compare(dto.currentPassword, user.passwordHash);
      if (!ok) throw new BadRequestException('Senha atual incorreta');
      data.passwordHash = await bcrypt.hash(dto.newPassword, 12);
    }

    if (Object.keys(data).length === 0) {
      return { id: user.id, email: user.email, name: user.name, isSuperAdmin: user.isSuperAdmin };
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, email: true, name: true, isSuperAdmin: true },
    });
    return updated;
  }

  private async signToken(userId: string, email: string): Promise<string> {
    const payload: JwtPayload = { sub: userId, email };
    return this.jwt.signAsync(payload, { expiresIn: AUTH_TOKEN_TTL_SECONDS });
  }
}
