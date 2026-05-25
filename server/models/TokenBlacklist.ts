import mongoose, { Schema, Document } from 'mongoose';

export interface ITokenBlacklist extends Document {
  jti: string;
  expiresAt: Date;
}

const tokenBlacklistSchema = new Schema<ITokenBlacklist>({
  jti: { type: String, required: true, unique: true, index: true },
  expiresAt: { type: Date, required: true },
});

tokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<ITokenBlacklist>('TokenBlacklist', tokenBlacklistSchema);
