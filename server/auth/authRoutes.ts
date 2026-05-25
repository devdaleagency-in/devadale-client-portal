import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { authLimiter, emailLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validate';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from '../validators/authValidators';
import * as authService from '../auth/authService';
import User from '../models/User';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), async (req: Request, res: Response) => {
  try {
    const result = await authService.registerUser(req.body);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

router.post('/login', authLimiter, validate(loginSchema), async (req: Request, res: Response) => {
  try {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const result = await authService.loginUser(req.body.email, req.body.password, ip, userAgent);
    res.json(result);
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

router.post('/refresh', validate(refreshSchema), async (req: Request, res: Response) => {
  try {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const tokens = await authService.refreshTokens(req.body.refreshToken, ip, userAgent);
    res.json(tokens);
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

router.post('/logout', async (req: Request, res: Response) => {
  try {
    const refreshToken = req.body.refreshToken || '';
    await authService.logoutUser(refreshToken);
    res.json({ message: 'Logged out successfully' });
  } catch {
    res.json({ message: 'Logged out successfully' });
  }
});

router.post('/logout-all', authenticate, async (req: Request, res: Response) => {
  try {
    await authService.logoutAllSessions(req.user!.userId);
    res.json({ message: 'All sessions logged out' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/sessions', authenticate, async (req: Request, res: Response) => {
  try {
    const sessions = await authService.getActiveSessions(req.user!.userId);
    res.json(sessions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/sessions/:tokenId', authenticate, async (req: Request, res: Response) => {
  try {
    await authService.revokeSession(req.user!.userId, req.params.tokenId);
    res.json({ message: 'Session revoked' });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

router.post('/forgot-password', emailLimiter, validate(forgotPasswordSchema), async (req: Request, res: Response) => {
  try {
    await authService.requestPasswordReset(req.body.email);
    res.json({ message: 'If the email exists, a reset link has been sent' });
  } catch {
    res.json({ message: 'If the email exists, a reset link has been sent' });
  }
});

router.post('/reset-password', emailLimiter, validate(resetPasswordSchema), async (req: Request, res: Response) => {
  try {
    await authService.resetPassword(req.body.token, req.body.password);
    res.json({ message: 'Password reset successfully' });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

router.post('/verify-email', async (req: Request, res: Response) => {
  try {
    await authService.verifyEmail(req.body.token);
    res.json({ message: 'Email verified successfully' });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const user = await authService.getCurrentUser(req.user!.userId);
    res.json({ user });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

router.put('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const { name, title } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user!.userId,
      { ...(name && { name }), ...(title && { title }) },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: user.toJSON() });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/change-password', authenticate, validate(changePasswordSchema), async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user!.userId).select('+password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await user.comparePassword(req.body.currentPassword);
    if (!isMatch) return res.status(400).json({ error: 'Current password is incorrect' });

    user.password = req.body.newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
