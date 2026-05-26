import type { Request } from 'express';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthUser;
  householdId?: string;
}

export interface JwtPayload {
  sub: string; // userId
  email: string;
}
