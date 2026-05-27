import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { PlanService } from '../billing/plan.service';
import { PrismaService } from '../prisma/prisma.service';
import { AcceptInviteDto, CreateInviteDto } from './dto/invite.dto';

const INVITE_TTL_DAYS = 7;

@Injectable()
export class HouseholdsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly planService: PlanService,
  ) {}

  async getMembers(householdId: string) {
    const members = await this.prisma.householdUser.findMany({
      where: { householdId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'asc' },
    });
    return members.map((m) => ({
      id: m.id,
      userId: m.userId,
      role: m.role,
      joinedAt: m.createdAt,
      name: m.user.name,
      email: m.user.email,
    }));
  }

  async getHousehold(householdId: string) {
    const h = await this.prisma.household.findUnique({
      where: { id: householdId },
      select: {
        id: true,
        name: true,
        description: true,
        currency: true,
        ownerUserId: true,
        createdAt: true,
      },
    });
    if (!h) throw new NotFoundException('Casa não encontrada');
    return h;
  }

  async listInvites(householdId: string) {
    return this.prisma.householdInvite.findMany({
      where: { householdId, acceptedAt: null },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        token: true,
        expiresAt: true,
        createdAt: true,
      },
    });
  }

  async createInvite(householdId: string, userId: string, dto: CreateInviteDto) {
    await this.assertOwner(householdId, userId);
    await this.planService.assertCanInvite(householdId);
    const email = dto.email.toLowerCase().trim();
    const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000);

    // se já existe convite pendente pro mesmo email, retorna o existente
    const existing = await this.prisma.householdInvite.findFirst({
      where: { householdId, email, acceptedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    if (existing && existing.expiresAt > new Date()) {
      return { id: existing.id, email, token: existing.token, expiresAt: existing.expiresAt };
    }

    const token = randomBytes(24).toString('base64url');
    const created = await this.prisma.householdInvite.create({
      data: {
        householdId,
        email,
        invitedById: userId,
        token,
        expiresAt,
      },
      select: { id: true, email: true, token: true, expiresAt: true },
    });
    return created;
  }

  async revokeInvite(householdId: string, userId: string, id: string) {
    await this.assertOwner(householdId, userId);
    const invite = await this.prisma.householdInvite.findFirst({
      where: { id, householdId, acceptedAt: null },
    });
    if (!invite) throw new NotFoundException('Convite não encontrado');
    await this.prisma.householdInvite.delete({ where: { id } });
    return { ok: true };
  }

  async acceptInvite(userId: string, dto: AcceptInviteDto) {
    const invite = await this.prisma.householdInvite.findUnique({
      where: { token: dto.token },
    });
    if (!invite) throw new NotFoundException('Convite inválido');
    if (invite.acceptedAt) throw new BadRequestException('Convite já utilizado');
    if (invite.expiresAt < new Date()) throw new BadRequestException('Convite expirado');

    const already = await this.prisma.householdUser.findUnique({
      where: { householdId_userId: { householdId: invite.householdId, userId } },
    });
    if (already) {
      // marca como aceito ainda assim pra não ficar pendente
      await this.prisma.householdInvite.update({
        where: { id: invite.id },
        data: { acceptedAt: new Date(), acceptedById: userId },
      });
      return { householdId: invite.householdId, alreadyMember: true };
    }

    await this.prisma.$transaction([
      this.prisma.householdUser.create({
        data: { householdId: invite.householdId, userId, role: invite.role },
      }),
      this.prisma.householdInvite.update({
        where: { id: invite.id },
        data: { acceptedAt: new Date(), acceptedById: userId },
      }),
      this.prisma.auditLog.create({
        data: {
          householdId: invite.householdId,
          userId,
          action: 'INVITE_ACCEPTED',
          entity: 'HouseholdInvite',
          entityId: invite.id,
          newValue: { email: invite.email },
        },
      }),
    ]);

    return { householdId: invite.householdId, alreadyMember: false };
  }

  async previewInvite(token: string) {
    const invite = await this.prisma.householdInvite.findUnique({
      where: { token },
      include: { household: { select: { name: true } } },
    });
    if (!invite) return { valid: false as const, reason: 'not_found' as const };
    if (invite.acceptedAt) return { valid: false as const, reason: 'used' as const };
    if (invite.expiresAt < new Date()) return { valid: false as const, reason: 'expired' as const };
    return {
      valid: true as const,
      email: invite.email,
      householdName: invite.household.name,
      expiresAt: invite.expiresAt,
    };
  }

  private async assertOwner(householdId: string, userId: string) {
    const membership = await this.prisma.householdUser.findUnique({
      where: { householdId_userId: { householdId, userId } },
      select: { role: true },
    });
    if (!membership || membership.role !== 'OWNER') {
      throw new ForbiddenException('Apenas o proprietário pode gerenciar convites');
    }
  }

  // Validação adicional: dois donos com mesmo email não acontece porque
  // user.email é UNIQUE. Mantemos como salvaguarda futura.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private _placeholderConflict() {
    return new ConflictException('placeholder');
  }
}
