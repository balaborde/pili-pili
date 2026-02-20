import { Server as SocketServer } from 'socket.io';
import type { Server as HttpServer } from 'http';
import type { ClientToServerEvents, ServerToClientEvents } from '../../src/types/socket.types';
import { registerLobbyHandlers, handlePostPlayerRemoval } from './handlers/lobby.handler';
import { registerGameHandlers } from './handlers/game.handler';
import { roomStore } from '../store/RoomStore';
import { gameStore } from '../store/GameStore';

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
    registerGameHandlers(io, socket);

    socket.on('disconnect', (reason) => {
      console.log(`[Socket] Disconnected: ${socket.id} (${reason})`);

      const info = roomStore.getPlayerBySocket(socket.id);
      if (info) {
        const game = gameStore.getGame(info.roomCode);
        if (game) {
          // In-game disconnection: mark player as disconnected but keep them
          game.handleDisconnect(info.playerId);
        } else {
          // Lobby disconnection: remove player from room
          const room = roomStore.getRoom(info.roomCode);
          if (room) {
            const wasHost = room.getHostId() === info.playerId;
            room.removePlayer(info.playerId);
            socket.to(info.roomCode).emit('room:playerLeft', { playerId: info.playerId });
            handlePostPlayerRemoval(io, info.roomCode, room, wasHost);
          }
        }

        // Clean up socket mapping
        roomStore.removeSocket(socket.id);
      }
    });
  });

  return io;
}
