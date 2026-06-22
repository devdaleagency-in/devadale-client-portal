import mongoose, { Schema, Document } from 'mongoose';

export interface ISession extends Document {
  userId: string;
  familyId: string;
  tokenId: string;
  refreshToken: string;
  userAgent: string;
  ip: string;
  isRevoked: boolean;
  lastActivity: Date;
  expiresAt: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    userId: { type: String, required: true, index: true },
    familyId: { type: String, required: true, index: true },
    tokenId: { type: String, required: true, unique: true },
    refreshToken: { type: String, required: true },
    userAgent: { type: String, default: '' },
    ip: { type: String, default: '' },
    isRevoked: { type: Boolean, default: false },
    lastActivity: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<ISession>('Session', sessionSchema);
