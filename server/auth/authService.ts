import crypto from 'crypto';
import User from '../models/User';
import Session from '../models/Session';
import PortalSettings from '../models/PortalSettings';
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  isTokenBlacklisted,
  blacklistToken,
  extractJtiFromToken,
} from '../tokens/tokenService';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService';
import { config } from '../utils/config';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResult {
  user: any;
  tokens: AuthTokens;
}

export async function registerUser(data: {
  name: string;
  username: string;
  email: string;
  password: string;
}): Promise<{ message: string }> {
  try {
    const existing = await User.findOne({
      $or: [
        { email: data.email.toLowerCase() },
        { username: data.username.toLowerCase() },
      ],
    });
    
    if (!existing) {
      const user = await User.create({
        _id: crypto.randomUUID(),
        name: data.name,
        username: data.username.toLowerCase(),
        email: data.email.toLowerCase(),
        password: data.password,
        role: 'client',
      });

      const verificationToken = crypto.randomBytes(32).toString('hex');
      user.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
      user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await user.save();

      try {
        await sendVerificationEmail(user.email, verificationToken);
      } catch {
        // queue email for retry
      }
    }
  } catch (err) {
    console.error('Registration error', err);
  }

  // Always return success to prevent enumeration
  return { message: 'Registration successful. Please check your email to verify your account.' };
}

export async function loginUser(
  identifier: string,
  password: string,
  ip: string,
  userAgent: string
): Promise<LoginResult> {
  const lower = identifier.toLowerCase();
  const userDoc = await User.findOne({
    $or: [{ email: lower }, { username: lower }],
  }).select('+password');
  if (!userDoc) throw Object.assign(new Error('Invalid email/username or password'), { statusCode: 401 });

  const user = userDoc as any;

  if (user.role === 'client') {
    const portalSettings = await PortalSettings.findOne();
    if (portalSettings && !portalSettings.clientPortalEnabled) {
      throw Object.assign(new Error('Client portal is currently disabled. Please contact your agency team.'), { statusCode: 403, code: 'PORTAL_DISABLED' });
    }
  }

  if (!user.isActive) throw Object.assign(new Error('Account has been deactivated'), { statusCode: 403 });
  if (!user.isEmailVerified) throw Object.assign(new Error('Please verify your email before logging in'), { statusCode: 403 });

  const isLocked = user.lockUntil && user.lockUntil > new Date();
  if (isLocked) {
    throw Object.assign(
      new Error('Account is temporarily locked. Try again later.'),
      { statusCode: 423 }
    );
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    user.loginAttempts += 1;
    if (user.loginAttempts >= 5) {
      user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
      user.loginAttempts = 0;
    }
    await user.save();
    throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
  }

  user.loginAttempts = 0;
  user.lockUntil = null;
  user.lastLoginAt = new Date();
  user.lastLoginIp = ip;
  await user.save();

  const accessToken = signAccessToken(user._id.toString(), user.role, user.tokenVersion);
  const { token: refreshToken, jti: tokenId } = signRefreshToken(user._id.toString(), user.role, user.tokenVersion);

  await Session.create({
    userId: user._id.toString(),
    tokenId,
    refreshToken: crypto.createHash('sha256').update(refreshToken).digest('hex'),
    userAgent,
    ip,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return {
    user: user.toJSON(),
    tokens: { accessToken, refreshToken },
  };
}

export async function refreshTokens(
  oldRefreshToken: string,
  ip: string,
  userAgent: string
): Promise<AuthTokens> {
  let payload;
  try {
    payload = verifyRefreshToken(oldRefreshToken);
  } catch {
    throw Object.assign(new Error('Invalid refresh token'), { statusCode: 401 });
  }

  if (payload.type !== 'refresh') {
    throw Object.assign(new Error('Invalid token type'), { statusCode: 401 });
  }

  if (await isTokenBlacklisted(payload.jti)) {
    throw Object.assign(new Error('Token has been revoked'), { statusCode: 401 });
  }

  const user = await User.findById(payload.sub);
  if (!user || !user.isActive) {
    throw Object.assign(new Error('User not found or inactive'), { statusCode: 401 });
  }

  const session = await Session.findOne({ tokenId: payload.jti, isRevoked: false });
    if (!session) {
    // Session not found. This could mean the token is reused!
    // We should revoke all sessions for this user as a security measure.
    await logoutAllSessions(payload.sub);
    throw Object.assign(new Error('Session not found or token already used (reuse detected)'), { statusCode: 401 });
  }

  await blacklistToken(payload.jti, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

  await Session.findByIdAndUpdate(session._id, { isRevoked: true });

  const accessToken = signAccessToken(user._id.toString(), user.role, user.tokenVersion);
  const { token: newRefreshToken, jti: newTokenId } = signRefreshToken(user._id.toString(), user.role, user.tokenVersion);

  await Session.create({
    userId: user._id.toString(),
    tokenId: newTokenId,
    refreshToken: crypto.createHash('sha256').update(newRefreshToken).digest('hex'),
    userAgent,
    ip,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return { accessToken, refreshToken: newRefreshToken };
}

export async function logoutUser(refreshToken: string): Promise<void> {
  const jti = extractJtiFromToken(refreshToken);
  if (!jti) return;

  await Session.findOneAndUpdate({ tokenId: jti }, { isRevoked: true });

  await blacklistToken(jti, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
}

export async function logoutAllSessions(userId: string): Promise<void> {
  const sessions = await Session.find({ userId, isRevoked: false });
  const blacklistOps = sessions.map(s =>
    blacklistToken(s.tokenId, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
  );
  await Promise.all(blacklistOps);
  await Session.updateMany({ userId, isRevoked: false }, { isRevoked: true });
  await User.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } });
}

export async function getActiveSessions(userId: string) {
  return Session.find({ userId, isRevoked: false }).select('tokenId userAgent ip lastActivity createdAt').sort({ createdAt: -1 });
}

export async function revokeSession(userId: string, tokenId: string): Promise<void> {
  const session = await Session.findOne({ tokenId, userId });
  if (!session) throw Object.assign(new Error('Session not found'), { statusCode: 404 });
  session.isRevoked = true;
  await session.save();
  await blacklistToken(tokenId, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
}

export async function requestPasswordReset(email: string): Promise<void> {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return;

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();

  try {
    await sendPasswordResetEmail(user.email, resetToken);
  } catch {
    // queue for retry
  }
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const user = await User.findOne({
    passwordResetToken: crypto.createHash('sha256').update(token).digest('hex'),
    passwordResetExpires: { $gt: new Date() },
  });

  if (!user) throw Object.assign(new Error('Invalid or expired reset token'), { statusCode: 400 });

  user.password = newPassword;
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  user.loginAttempts = 0;
  user.lockUntil = null;
  await user.save();

  await logoutAllSessions(user._id.toString());
}

export async function verifyEmail(token: string): Promise<void> {
  const user = await User.findOne({
    emailVerificationToken: crypto.createHash('sha256').update(token).digest('hex'),
    emailVerificationExpires: { $gt: new Date() },
  });

  if (!user) throw Object.assign(new Error('Invalid or expired verification token'), { statusCode: 400 });

  user.isEmailVerified = true;
  user.emailVerificationToken = null;
  user.emailVerificationExpires = null;
  await user.save();
}

export async function getCurrentUser(userId: string) {
  const user = await User.findById(userId);
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });
  return user.toJSON();
}
