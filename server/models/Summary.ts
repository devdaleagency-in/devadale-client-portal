import mongoose, { Schema, Document } from 'mongoose';

export interface ISummary extends Document {
  projectId: string;
  projectName: string;
  summaryText: string;
  generatedAt: Date;
  generatedBy: string;
  pdfUrl: string;
  emailedTo: string[];
  status: 'draft' | 'sent' | 'archived';
  metadata: {
    projectProgress: number;
    milestonesCompleted: number;
    pendingApprovals: number;
    filesUploaded: number;
    messagesCount: number;
  };
  upcomingTasks: string[];
  blockers: string[];
  deliverablesCount: number;
}

const SummarySchema = new Schema<ISummary>({
  projectId: { type: String, default: 'default' },
  projectName: { type: String, default: '' },
  summaryText: { type: String, required: true },
  generatedAt: { type: Date, default: Date.now },
  generatedBy: { type: String, default: 'system' },
  pdfUrl: { type: String, default: '' },
  emailedTo: [{ type: String }],
  status: { type: String, enum: ['draft', 'sent', 'archived'], default: 'draft' },
  metadata: {
    projectProgress: { type: Number, default: 0 },
    milestonesCompleted: { type: Number, default: 0 },
    pendingApprovals: { type: Number, default: 0 },
    filesUploaded: { type: Number, default: 0 },
    messagesCount: { type: Number, default: 0 },
  },
  upcomingTasks: [{ type: String }],
  blockers: [{ type: String }],
  deliverablesCount: { type: Number, default: 0 },
});

export default mongoose.model<ISummary>('Summary', SummarySchema);
