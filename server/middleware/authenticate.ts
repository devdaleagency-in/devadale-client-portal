import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, isTokenBlacklisted, extractJtiFromToken } from '../tokens/tokenService';
import User from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: 'super_admin' | 'admin' | 'client' | 'team_member' | 'onboarding';
        tokenVersion?: number;
      };
    }
  }
}

export const authenticate = authenticateUser;

export async function authenticateUser(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const payload = verifyAccessToken(token);

    if (payload.type !== 'access') {
      return res.status(401).json({ error: 'Invalid token type' });
    }

    const jti = extractJtiFromToken(token);
    if (jti && (await isTokenBlacklisted(jti))) {
      return res.status(401).json({ error: 'Token has been revoked' });
    }

    const user = await User.findById(payload.sub).select('_id role isActive tokenVersion');
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    if (payload.tokenVersion !== undefined && payload.tokenVersion !== user.tokenVersion) {
      return res.status(401).json({ error: 'Token has been invalidated due to password change', code: 'TOKEN_VERSION_MISMATCH' });
    }

    req.user = { userId: user._id.toString(), role: user.role, tokenVersion: user.tokenVersion };
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  if (!token) return next();

  try {
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub).select('tokenVersion');
    req.user = { userId: payload.sub, role: payload.role, tokenVersion: user?.tokenVersion };
  } catch {
    // ignore invalid tokens for optional auth
  }
  next();
}
