import mongoose, { Schema } from 'mongoose';

export interface IDocumentVersion {
  _id: string;
  documentId: string;
  version: number;
  fileUrl: string;
  fileSize: number;
  uploadedBy: string;
  changeNotes: string;
  createdAt: Date;
}

const documentVersionSchema = new Schema<IDocumentVersion>(
  {
    _id: { type: String, required: true },
    documentId: { type: String, ref: 'Document', required: true, index: true },
    version: { type: Number, required: true },
    fileUrl: { type: String, required: true },
    fileSize: { type: Number, default: 0 },
    uploadedBy: { type: String, ref: 'User', required: true },
    changeNotes: { type: String, default: '' },
  },
  { timestamps: { createdAt: true, updatedAt: false }, _id: false }
);

documentVersionSchema.index({ documentId: 1, version: -1 });

export default mongoose.model<IDocumentVersion>('DocumentVersion', documentVersionSchema);
