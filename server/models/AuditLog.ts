import mongoose, { Schema } from 'mongoose';

export interface IAuditLog {
  _id: string;
  userId: string;
  userRole: string;
  action: 'create' | 'update' | 'delete' | 'sign' | 'send' | 'view' | 'payment' | 'login' | 'logout' | 'password_reset' | 'token_reuse' | 'privilege_change' | 'other';
  entity: string;
  entityId: string;
  description: string;
  changes?: Record<string, { from: any; to: any }>;
  ip: string;
  userAgent: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    _id: { type: String, required: true },
    userId: { type: String, ref: 'User', required: true, index: true },
    userRole: { type: String, default: '' },
    action: {
      type: String,
      enum: ['create', 'update', 'delete', 'sign', 'send', 'view', 'payment', 'login', 'logout', 'password_reset', 'token_reuse', 'privilege_change', 'other'],
      required: true,
    },
    entity: { type: String, required: true, index: true },
    entityId: { type: String, required: true, index: true },
    description: { type: String, required: true },
    changes: { type: Schema.Types.Mixed },
    ip: { type: String, default: '' },
    userAgent: { type: String, default: '' },
  },
  { timestamps: { createdAt: true, updatedAt: false }, _id: false }
);

auditLogSchema.index({ entity: 1, entityId: 1 });
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
