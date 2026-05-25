import { Server } from 'socket.io';
import Message from '../../models/Message';
import Conversation from '../../models/Conversation';
import { getUsers } from '../../db';
import type { AuthSocket } from '../authMiddleware';

function getDisplayName(userId: string): string {
  const users = getUsers();
  const user = users.find((u: any) => u.id === userId);
  return user?.name || userId;
}

export function registerMessageHandler(io: Server, socket: AuthSocket) {
  socket.on('sendMessage', async (data: { conversationId: string; projectId: string; content: string }) => {
    if (!socket.userId || !socket.userRole) return;
    if (!data.content || data.content.length > 5000) return;
    if (!data.conversationId || !data.projectId) return;

    try {
      const message = (await Message.create({
        senderId: socket.userId,
        senderName: getDisplayName(socket.userId),
        senderRole: socket.userRole as 'admin' | 'client',
        conversationId: data.conversationId,
        projectId: data.projectId,
        content: data.content,
        deliveryStatus: 'sent',
      }))!;

      await Conversation.findByIdAndUpdate(data.conversationId, {
        lastMessage: {
          content: data.content,
          senderId: socket.userId,
          senderRole: socket.userRole,
          timestamp: new Date(),
        },
      });

      const conversation = await Conversation.findById(data.conversationId);
      const unreadTargets = socket.userRole === 'client'
        ? (conversation?.adminIds || [])
        : [conversation?.clientId].filter(Boolean);

      for (const uid of unreadTargets) {
        if (!uid) continue;
        const current = conversation?.unreadCounts?.get(uid) || 0;
        conversation?.unreadCounts?.set(uid, current + 1);
      }
      if (conversation) {
        conversation.markModified('unreadCounts');
        await conversation.save();
      }

      const room = `conversation_${data.conversationId}`;
      const enriched = {
        _id: message._id,
        senderId: { _id: socket.userId, name: getDisplayName(socket.userId), role: socket.userRole },
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
          senderRole: socket.userRole,
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
