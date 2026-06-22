import AuditLog from '../models/AuditLog';

export async function createAuditLog(data: {
  userId: string;
  userRole?: string;
  action: 'create' | 'update' | 'delete' | 'sign' | 'send' | 'view' | 'payment' | 'login' | 'logout' | 'other';
  entity: string;
  entityId: string;
  description: string;
  changes?: Record<string, { from: any; to: any }>;
  ip?: string;
  userAgent?: string;
}): Promise<void> {
  try {
    await AuditLog.create({
      _id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      userId: data.userId,
      userRole: data.userRole || '',
      action: data.action,
      entity: data.entity,
      entityId: data.entityId,
      description: data.description,
      changes: data.changes,
      ip: data.ip || '',
      userAgent: data.userAgent || '',
    });
  } catch (err) {
    console.error('Failed to create audit log:', err);
  }
}

export async function getAuditLogs(entity: string, entityId: string, limit = 50) {
  return AuditLog.find({ entity, entityId })
    .sort({ createdAt: -1 })
    .limit(limit);
}

export async function getUserAuditLogs(userId: string, limit = 50) {
  return AuditLog.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit);
}
