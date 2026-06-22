import mongoose, { Schema } from 'mongoose';

export interface ILead {
  _id: string;
  source: 'website' | 'referral' | 'direct' | 'social' | 'email' | 'phone' | 'other';
  clientId?: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  stage: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
  value: number;
  notes: string;
  assignedTo?: string;
  convertedToClientAt?: Date;
  lostReason?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const leadSchema = new Schema<ILead>(
  {
    _id: { type: String, required: true },
    source: {
      type: String,
      enum: ['website', 'referral', 'direct', 'social', 'email', 'phone', 'other'],
      default: 'website',
    },
    clientId: { type: String, ref: 'User' },
    name: { type: String, required: true, trim: true },
    company: { type: String, default: '', trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, default: '' },
    stage: {
      type: String,
      enum: ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'],
      default: 'new',
    },
    value: { type: Number, default: 0 },
    notes: { type: String, default: '' },
    assignedTo: { type: String, ref: 'User' },
    convertedToClientAt: { type: Date },
    lostReason: { type: String, default: '' },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true, _id: false }
);

leadSchema.index({ stage: 1, deletedAt: 1 });
leadSchema.index({ email: 1 });
leadSchema.index({ assignedTo: 1 });

export default mongoose.model<ILead>('Lead', leadSchema);
