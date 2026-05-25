import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema({
  projectId: { type: String, required: true },
  projectName: { type: String },
  clientId: { type: String, required: true },
  clientName: { type: String },
  adminIds: [{ type: String }],
  lastMessage: {
    content: String,
    senderId: String,
    senderRole: { type: String, enum: ['client', 'admin'] },
    timestamp: Date,
  },
  unreadCounts: { type: Map, of: Number, default: {} },
}, { timestamps: true });

ConversationSchema.index({ clientId: 1 });
ConversationSchema.index({ adminIds: 1 });
ConversationSchema.index({ projectId: 1 });

export default mongoose.model('Conversation', ConversationSchema);
