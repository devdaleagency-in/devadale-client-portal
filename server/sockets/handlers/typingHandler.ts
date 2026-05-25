import { Server } from 'socket.io';
import type { AuthSocket } from '../authMiddleware';

export function registerTypingHandler(io: Server, socket: AuthSocket) {
  let typingTimeout: ReturnType<typeof setTimeout> | null = null;

  socket.on('typing', (data: { conversationId: string }) => {
    if (!data.conversationId || !socket.userId) return;
    const room = `conversation_${data.conversationId}`;
    socket.to(room).emit('userTyping', { userId: socket.userId, conversationId: data.conversationId });

    if (typingTimeout) clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      socket.to(room).emit('userStopTyping', { userId: socket.userId, conversationId: data.conversationId });
    }, 2000);
  });

  socket.on('stopTyping', (data: { conversationId: string }) => {
    if (!data.conversationId || !socket.userId) return;
    const room = `conversation_${data.conversationId}`;
    socket.to(room).emit('userStopTyping', { userId: socket.userId, conversationId: data.conversationId });
    if (typingTimeout) clearTimeout(typingTimeout);
  });

  socket.on('disconnect', () => {
    if (typingTimeout) clearTimeout(typingTimeout);
  });
}
