import Conversation from '../../models/Conversation';
import type { AuthSocket } from '../authMiddleware';

export function registerRoomHandler(socket: AuthSocket) {
  socket.on('joinConversation', async (conversationId: string) => {
    if (!socket.userId || !socket.userRole || !conversationId) return;

    try {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        socket.emit('error', { message: 'Conversation not found' });
        return;
      }

      const clientMatch = conversation.clientId === socket.userId;
      const adminMatch = conversation.adminIds.some((id: string) => id === socket.userId);
      if (!clientMatch && !adminMatch) {
        socket.emit('error', { message: 'Access denied' });
        return;
      }

      socket.join(`conversation_${conversationId}`);
    } catch {
      socket.emit('error', { message: 'Failed to join conversation' });
    }
  });

  socket.on('leaveConversation', (conversationId: string) => {
    if (conversationId) {
      socket.leave(`conversation_${conversationId}`);
    }
  });
}
