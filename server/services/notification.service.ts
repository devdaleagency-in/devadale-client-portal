import Notification from '../models/Notification';

export async function sendNotification(data: {
  userId: string;
  type: 'email' | 'whatsapp' | 'sms' | 'in_app';
  title: string;
  body: string;
  data?: Record<string, any>;
}): Promise<void> {
  try {
    const notification = await Notification.create({
      _id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      userId: data.userId,
      type: data.type,
      channel: data.type,
      title: data.title,
      body: data.body,
      data: data.data,
      status: 'pending',
    });

    // In production, push to queue for async delivery
    // For now, immediately mark as sent for in_app notifications
    if (data.type === 'in_app') {
      notification.status = 'sent';
      notification.sentAt = new Date();
      await notification.save();
    }
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
}

export async function getNotifications(userId: string, limit = 50) {
  return Notification.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit);
}

export async function getUnreadCount(userId: string): Promise<number> {
  return Notification.countDocuments({ userId, status: { $in: ['sent', 'delivered'] } });
}

export async function markAsRead(notificationId: string, userId: string) {
  return Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { status: 'read', readAt: new Date() },
    { new: true }
  );
}

export async function markAllAsRead(userId: string) {
  return Notification.updateMany(
    { userId, status: { $in: ['sent', 'delivered'] } },
    { status: 'read', readAt: new Date() }
  );
}
