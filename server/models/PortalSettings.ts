import mongoose, { Schema, Document } from 'mongoose';

export interface IPortalSettings extends Document {
  clientPortalEnabled: boolean;
  whiteLabelMode: boolean;
  agencyName: string;
  portalDomain: string;
  clientWelcomeMessage: string;
  updatedAt: Date;
}

const PortalSettingsSchema = new Schema<IPortalSettings>({
  clientPortalEnabled: { type: Boolean, default: true },
  whiteLabelMode: { type: Boolean, default: false },
  agencyName: { type: String, default: 'DevDale Agency' },
  portalDomain: { type: String, default: '' },
  clientWelcomeMessage: { type: String, default: 'Welcome to your dedicated client portal. Track projects, review deliverables, and collaborate with your team.' },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IPortalSettings>('PortalSettings', PortalSettingsSchema);
