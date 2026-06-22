import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  senderName: { type: String },
  senderRole: { type: String, enum: ['client', 'admin', 'super_admin', 'team_member'], required: true },
  conversationId: { type: String, required: true, index: true },
  projectId: { type: String, required: true },
  content: { type: String, required: true, maxlength: 5000 },
  isRead: { type: Boolean, default: false },
  deliveryStatus: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
}, { timestamps: true });

MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ senderId: 1 });

export default mongoose.model('Message', MessageSchema);
