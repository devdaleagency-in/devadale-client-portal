import { Server } from 'socket.io';
import Message from '../../models/Message';
import Conversation from '../../models/Conversation';
import User from '../../models/User';
import type { AuthSocket } from '../authMiddleware';
import { sendNotification } from '../../services/notification.service';

async function getDisplayName(userId: string): Promise<string> {
  try {
    const user = await User.findById(userId).select('name');
    return user?.name || userId;
  } catch {
    return userId;
  }
}

export function registerMessageHandler(io: Server, socket: AuthSocket) {
  socket.on('sendMessage', async (data: { conversationId: string; projectId: string; content: string }) => {
    if (!socket.userId || !socket.userRole) return;
    if (!data.content || data.content.length > 5000) return;
    if (!data.conversationId || !data.projectId) return;

    try {
      const conversation = await Conversation.findById(data.conversationId);
      if (!conversation) {
        socket.emit('error', { message: 'Conversation not found' });
        return;
      }

      // Verify sender is a participant in this conversation
      const isClient = conversation.clientId === socket.userId;
      const isAdmin = conversation.adminIds?.includes(socket.userId);
      if (!isClient && !isAdmin) {
        socket.emit('error', { message: 'Access denied' });
        return;
      }

      const displayName = await getDisplayName(socket.userId);
      const message = (await Message.create({
        senderId: socket.userId,
        senderName: displayName,
        senderRole: socket.userRole as 'admin' | 'super_admin' | 'client' | 'team_member',
        conversationId: data.conversationId,
        projectId: data.projectId,
        content: data.content,
        deliveryStatus: 'sent',
      }));

      if (!message) {
        socket.emit('error', { message: 'Failed to create message' });
        return;
      }

      conversation.lastMessage = {
        content: data.content,
        senderId: socket.userId,
        senderRole: socket.userRole as 'admin' | 'client',
        timestamp: new Date(),
      };

      const unreadTargets = socket.userRole === 'client'
        ? (conversation.adminIds || [])
        : [conversation.clientId].filter(Boolean);

      for (const uid of unreadTargets) {
        if (!uid) continue;
        const current = conversation.unreadCounts?.get(uid) || 0;
        conversation.unreadCounts?.set(uid, current + 1);
      }

      conversation.markModified('unreadCounts');
      await conversation.save();

      for (const uid of unreadTargets) {
        if (uid) {
          await sendNotification({
            userId: uid,
            type: 'in_app',
            title: 'New Message',
            body: `${displayName}: ${data.content.slice(0, 120)}${data.content.length > 120 ? '...' : ''}`,
            data: { category: 'message', metadata: { sender: displayName, conversationId: data.conversationId } },
          });
        }
      }

      const room = `conversation_${data.conversationId}`;
      const enriched = {
        _id: message._id,
        senderId: { _id: socket.userId, name: displayName, role: socket.userRole },
        senderRole: socket.userRole,
        conversationId: message.conversationId,
        projectId: message.projectId,
        content: message.content,
        isRead: message.isRead,
        deliveryStatus: message.deliveryStatus,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
      };

      io.to(room).emit('receiveMessage', enriched);
      io.to(room).emit('conversationUpdated', {
        conversationId: data.conversationId,
        lastMessage: {
          content: data.content,
          senderId: socket.userId,
        senderRole: socket.userRole as 'admin' | 'client',
          timestamp: new Date(),
        },
      });
    } catch (err) {
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  socket.on('markAsRead', async (data: { conversationId: string; messageIds: string[] }) => {
    if (!socket.userId || !data.conversationId) return;

    try {
      await Message.updateMany(
        { _id: { $in: data.messageIds }, conversationId: data.conversationId, isRead: false },
        { isRead: true, deliveryStatus: 'read' },
      );

      const conversation = await Conversation.findById(data.conversationId);
      if (conversation) {
        conversation.unreadCounts?.set(socket.userId, 0);
        conversation.markModified('unreadCounts');
        await conversation.save();
      }

      const room = `conversation_${data.conversationId}`;
      io.to(room).emit('messagesRead', { conversationId: data.conversationId, userId: socket.userId });
    } catch {
      socket.emit('error', { message: 'Failed to mark as read' });
    }
  });
}
