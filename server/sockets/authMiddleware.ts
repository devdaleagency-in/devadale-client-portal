import { Socket } from 'socket.io';
import { verifyAccessToken, isTokenBlacklisted, extractJtiFromToken } from '../tokens/tokenService';
import User from '../models/User';

interface AuthSocket extends Socket {
  userId?: string;
  userRole?: 'super_admin' | 'admin' | 'client' | 'team_member' | 'onboarding';
  userName?: string;
}

async function jwtAuthMiddleware(socket: AuthSocket, next: (err?: Error) => void) {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;

  if (!token || typeof token !== 'string') {
    return next(new Error('Authentication required'));
  }

  try {
    const payload = verifyAccessToken(token);

    if (payload.type !== 'access') {
      return next(new Error('Invalid token type'));
    }

    const jti = extractJtiFromToken(token);
    if (jti && (await isTokenBlacklisted(jti))) {
      return next(new Error('Token has been revoked'));
    }

    const user = await User.findById(payload.sub).select('_id role name isActive');
    if (!user || !user.isActive) {
      return next(new Error('User not found or inactive'));
    }

    socket.userId = user._id.toString();
    socket.userRole = user.role;
    socket.userName = user.name;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return next(new Error('Token expired'));
    }
    next(new Error('Invalid authentication token'));
  }
}

export { jwtAuthMiddleware as authMiddleware, type AuthSocket };
