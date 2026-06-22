import { Request, Response, NextFunction } from 'express';
import AuditLog from '../models/AuditLog';

export function audit(
  action: 'create' | 'update' | 'delete' | 'sign' | 'send' | 'view' | 'payment' | 'login' | 'logout' | 'other',
  entity: string,
  descriptionFn: (req: Request) => string,
  entityIdFn?: (req: Request) => string
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);
    res.json = function (body: any) {
      if (res.statusCode < 400) {
        const userId = req.user?.userId || 'system';
        const userRole = req.user?.role || 'system';
        const entityId = entityIdFn ? entityIdFn(req) : (req.params.id || body?._id || 'unknown');
        AuditLog.create({
          _id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          userId,
          userRole,
          action,
          entity,
          entityId,
          description: descriptionFn(req),
          ip: req.ip || '',
          userAgent: req.headers['user-agent'] || '',
        }).catch((err) => console.error('Audit log error:', err));
      }
      return originalJson(body);
    };
    next();
  };
}
