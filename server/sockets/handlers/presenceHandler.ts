import { Server } from 'socket.io';
import { type AuthSocket } from '../authMiddleware';
import User from '../../models/User';

export function registerPresenceHandler(io: Server, socket: AuthSocket) {
  if (!socket.userId) return;

  const updatePresence = async (isOnline: boolean) => {
    try {
      const lastSeen = isOnline ? null : new Date();
      await User.findByIdAndUpdate(socket.userId, { isOnline, lastSeen });
      // Broadcast presence to everyone. In a huge system, we'd only broadcast to specific rooms.
      io.emit('userStatusUpdate', { userId: socket.userId, isOnline, lastSeen });
    } catch (err) {
      console.error('Error updating presence:', err);
    }
  };

  // Mark online on connect
  updatePresence(true);

  socket.on('disconnect', () => {
    // Check if the user has other active connections
    const userSockets = io.sockets.adapter.rooms.get(socket.userId!);
    if (!userSockets || userSockets.size === 0) {
      updatePresence(false);
    }
  });
}
