import { Request, Response, NextFunction } from 'express';
import PortalSettings from '../models/PortalSettings';

export async function clientPortalGuard(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role === 'client') {
    try {
      const settings = await PortalSettings.findOne();
      if (settings && !settings.clientPortalEnabled) {
        return res.status(403).json({
          error: 'Client portal access has been disabled.',
          code: 'PORTAL_DISABLED',
        });
      }
    } catch {
      return res.status(500).json({ error: 'Failed to verify portal status' });
    }
  }
  next();
}
