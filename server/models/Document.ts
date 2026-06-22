import mongoose, { Schema } from 'mongoose';

export interface IDocument {
  _id: string;
  clientId: string;
  projectId?: string;
  name: string;
  type: 'file' | 'agreement' | 'msa' | 'sow' | 'nda' | 'invoice' | 'report' | 'other';
  mimeType: string;
  fileUrl: string;
  fileSize: number;
  currentVersion: number;
  status: 'draft' | 'final' | 'archived';
  tags: string[];
  uploadedBy: string;
  signedAt?: Date;
  signatureUrl?: string;
  expiresAt?: Date;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<IDocument>(
  {
    _id: { type: String, required: true },
    clientId: { type: String, ref: 'User', required: true, index: true },
    projectId: { type: String, ref: 'Project', index: true },
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['file', 'agreement', 'msa', 'sow', 'nda', 'invoice', 'report', 'other'],
      default: 'file',
    },
    mimeType: { type: String, default: 'application/octet-stream' },
    fileUrl: { type: String, required: true },
    fileSize: { type: Number, default: 0 },
    currentVersion: { type: Number, default: 1 },
    status: {
      type: String,
      enum: ['draft', 'final', 'archived'],
      default: 'draft',
    },
    tags: [{ type: String }],
    uploadedBy: { type: String, ref: 'User', required: true },
    signedAt: { type: Date },
    signatureUrl: { type: String },
    expiresAt: { type: Date },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true, _id: false }
);

documentSchema.index({ status: 1, deletedAt: 1 });
documentSchema.index({ clientId: 1, type: 1 });

export default mongoose.model<IDocument>('Document', documentSchema);
