import mongoose, { Schema } from 'mongoose';

export interface IOnboardingLink {
  _id: string;
  token: string;
  clientName: string;
  organization: string;
  phone: string;
  email: string;
  expiresAt: Date;
  usedAt?: Date;
  status: 'active' | 'expired' | 'used';
  createdAt: Date;
  updatedAt: Date;
}

const onboardingLinkSchema = new Schema<IOnboardingLink>(
  {
    _id: { type: String, required: true },
    token: { type: String, required: true, unique: true },
    clientName: { type: String, required: true },
    organization: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date },
    status: {
      type: String,
      enum: ['active', 'expired', 'used'],
      default: 'active',
    },
  },
  { timestamps: true, _id: false }
);

export default mongoose.model<IOnboardingLink>('OnboardingLink', onboardingLinkSchema);
