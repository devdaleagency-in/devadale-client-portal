import mongoose, { Schema } from 'mongoose';

export interface INotification {
  _id: string;
  userId: string;
  type: 'email' | 'whatsapp' | 'sms' | 'in_app';
  channel: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  readAt?: Date;
  sentAt?: Date;
  failedAt?: Date;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    _id: { type: String, required: true },
    userId: { type: String, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['email', 'whatsapp', 'sms', 'in_app'],
      required: true,
    },
    channel: { type: String, default: '' },
    title: { type: String, required: true },
    body: { type: String, required: true },
    data: { type: Schema.Types.Mixed },
    status: {
      type: String,
      enum: ['pending', 'sent', 'delivered', 'read', 'failed'],
      default: 'pending',
    },
    readAt: { type: Date },
    sentAt: { type: Date },
    failedAt: { type: Date },
    errorMessage: { type: String },
  },
  { timestamps: true, _id: false }
);

notificationSchema.index({ userId: 1, status: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ type: 1, status: 1 });

export default mongoose.model<INotification>('Notification', notificationSchema);
