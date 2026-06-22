import mongoose from 'mongoose';

const DeadlineSchema = new mongoose.Schema({
  task: { type: String, required: true },
  dueDate: { type: Date, required: true },
  projectId: { type: String, required: true }, // For simplicity, using string to match other legacy ID fields or ObjectIds
  project: { type: String, required: true },
  clientId: { type: String, required: true },
  assignee: { type: String, required: true },
  priority: { type: String, enum: ['critical', 'high', 'medium', 'low'], default: 'medium' },
  status: { type: String, enum: ['overdue', 'today', 'this-week', 'later'], default: 'later' }
}, { timestamps: true });

DeadlineSchema.index({ clientId: 1, dueDate: 1 });
DeadlineSchema.index({ projectId: 1 });

export default mongoose.model('Deadline', DeadlineSchema);
