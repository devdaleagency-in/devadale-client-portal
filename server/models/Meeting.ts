import mongoose from 'mongoose';

const MeetingSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  userId: { type: String, ref: 'User', required: true, index: true },
  projectId: { type: String, ref: 'Project' },
  title: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  meetingType: { type: String, enum: ['project_review', 'sprint_planning', 'client_call', 'strategy', 'other'], default: 'client_call' },
  notes: { type: String, default: '' },
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model('Meeting', MeetingSchema);
