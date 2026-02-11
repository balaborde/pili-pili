import type { Server, Socket } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents } from '../../../src/types/socket.types';
import { roomStore } from '../../store/RoomStore';

type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
type AppServer = Server<ClientToServerEvents, ServerToClientEvents>;

export function registerReconnectHandlers(io: AppServer, socket: AppSocket): void {
  socket.on('player:reconnect', ({ sessionToken, roomCode }) => {
    const session = roomStore.getSessionByToken(sessionToken);
    if (!session || session.roomCode !== roomCode.toUpperCase()) {
      socket.emit('room:error', { message: 'Session invalide' });
      return;
    }

    const engine = roomStore.getRoom(session.roomCode);
    if (!engine) {
      socket.emit('room:error', { message: 'Room introuvable' });
      return;
    }

    // Update socket mapping
    roomStore.updateSocketId(sessionToken, socket.id);

    // Rejoin socket.io room
    socket.join(session.roomCode);

    // Mark player as connected
    engine.setPlayerConnected(session.playerId, true);

    // Send full state sync
    const state = engine.getClientState(session.playerId);
    socket.emit('game:stateSync', { state });

    // Notify others
    socket.to(session.roomCode).emit('player:reconnected', { playerId: session.playerId });
  });
}

export function handleDisconnect(io: AppServer, socket: AppSocket): void {
  const info = roomStore.removeSocket(socket.id);
  if (!info) return;

  const engine = roomStore.getRoom(info.roomCode);
  if (!engine) return;

  engine.setPlayerConnected(info.playerId, false);
  io.to(info.roomCode).emit('player:disconnected', { playerId: info.playerId });

  // If in lobby and no humans connected, clean up
  if (engine.getPhase() === 'LOBBY') {
    const hasHumans = engine.getPlayers().some((p) => !p.isBot && p.isConnected);
    if (!hasHumans) {
      roomStore.deleteRoom(info.roomCode);
    }
  }
}
