import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { AUTH_COOKIE_NAME } from '../auth.constants';
import type { AuthUser, JwtPayload } from '../types';

function cookieExtractor(req: Request): string | null {
  const cookies = (req as Request & { cookies?: Record<string, string> }).cookies;
  return cookies?.[AUTH_COOKIE_NAME] ?? null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'dev-insecure-secret',
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true, isActive: true },
    });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Sessão inválida');
    }
    return { id: user.id, email: user.email, name: user.name };
  }
}
