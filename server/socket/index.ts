import { Server as SocketServer } from 'socket.io';
import type { Server as HttpServer } from 'http';
import type { ClientToServerEvents, ServerToClientEvents } from '../../src/types/socket.types';
import { registerLobbyHandlers } from './handlers/lobby.handler';

export function createSocketServer(httpServer: HttpServer): SocketServer<ClientToServerEvents, ServerToClientEvents> {
  const io = new SocketServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    pingTimeout: 30000,
    pingInterval: 10000,
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] Connected: ${socket.id}`);

    registerLobbyHandlers(io, socket);

    socket.on('disconnect', (reason) => {
      console.log(`[Socket] Disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
}
