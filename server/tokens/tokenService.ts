import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../utils/config';
import TokenBlacklist from '../models/TokenBlacklist';

export interface TokenPayload {
  sub: string;
  role: 'super_admin' | 'admin' | 'client' | 'team_member' | 'onboarding';
  tokenVersion?: number;
  jti: string;
  type: 'access' | 'refresh' | 'file_download';
  fileKey?: string;
}

function generateJti(): string {
  return crypto.randomBytes(24).toString('hex');
}

export function signAccessToken(userId: string, role: string, tokenVersion: number = 0): string {
  const payload: TokenPayload = {
    sub: userId,
    role: role as TokenPayload['role'],
    jti: generateJti(),
    type: 'access',
    tokenVersion,
  };
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn as any,
    issuer: config.jwt.issuer,
    audience: config.jwt.audience,
  });
}

export function signRefreshToken(userId: string, role: string, tokenVersion: number = 0): { token: string; jti: string } {
  const jti = generateJti();
  const payload: TokenPayload = {
    sub: userId,
    role: role as TokenPayload['role'],
    jti,
    type: 'refresh',
    tokenVersion,
  };
  const token = jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn as any,
    issuer: config.jwt.issuer,
    audience: config.jwt.audience,
  });
  return { token, jti };
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, config.jwt.accessSecret, { issuer: config.jwt.issuer, audience: config.jwt.audience }) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, config.jwt.refreshSecret, { issuer: config.jwt.issuer, audience: config.jwt.audience }) as TokenPayload;
}

export async function isTokenBlacklisted(jti: string): Promise<boolean> {
  const blacklisted = await TokenBlacklist.findOne({ jti });
  return !!blacklisted;
}

export async function blacklistToken(jti: string, expiresAt: Date): Promise<void> {
  await TokenBlacklist.findOneAndUpdate(
    { jti },
    { jti, expiresAt },
    { upsert: true }
  );
}

export function getTokenExpiry(payload: TokenPayload): Date {
  const exp = (jwt.decode as any)(jwt.sign({}, 'dummy'))?.exp;
  const decoded = jwt.decode(
    jwt.sign(payload, config.jwt.accessSecret)
  ) as any;
  return new Date((decoded?.exp || Math.floor(Date.now() / 1000) + 900) * 1000);
}

export function extractJtiFromToken(token: string): string | null {
  try {
    const decoded = jwt.decode(token) as any;
    return decoded?.jti || null;
  } catch {
    return null;
  }
}
