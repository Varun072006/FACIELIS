import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

let io: SocketIOServer | null = null;

export function initSocketServer(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Client connected to Real-Time Socket: ${socket.id}`);

    // Join room event
    socket.on('join_rooms', (data: { userId?: string; role?: string; venueId?: string }) => {
      const { userId, role, venueId } = data || {};
      if (role) {
        socket.join(`room:role:${role}`);
        console.log(`Socket ${socket.id} joined room:role:${role}`);
      }
      if (userId) {
        socket.join(`room:user:${userId}`);
        console.log(`Socket ${socket.id} joined room:user:${userId}`);
      }
      if (venueId) {
        socket.join(`room:venue:${venueId}`);
        console.log(`Socket ${socket.id} joined room:venue:${venueId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}

export function broadcastNotification(room: string, event: string, payload: any) {
  if (io) {
    io.to(room).emit(event, payload);
    console.log(`📡 Emitted ${event} to ${room}:`, payload?.title || payload?.defectNo || 'Event payload');
  }
}
