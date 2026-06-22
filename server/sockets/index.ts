import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { authMiddleware, type AuthSocket } from './authMiddleware';
import { registerMessageHandler } from './handlers/messageHandler';
import { registerRoomHandler } from './handlers/roomHandler';
import { registerTypingHandler } from './handlers/typingHandler';

let io: Server | null = null;

export function setupSocketIO(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:5173'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use(authMiddleware);

  io.on('connection', (socket: AuthSocket) => {
    if (socket.userId) {
      socket.join(socket.userId);
    }
    
    if (socket.userRole === 'admin' || socket.userRole === 'super_admin') {
      socket.join('admins');
    }

    registerRoomHandler(socket);
    registerMessageHandler(io!, socket);
    registerTypingHandler(io!, socket);

    socket.on('disconnect', () => {
      // cleanup handled in individual handlers
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
}
