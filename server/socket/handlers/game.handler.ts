import type { Server, Socket } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents } from '../../../src/types/socket.types';
import { roomStore } from '../../store/RoomStore';

type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
type AppServer = Server<ClientToServerEvents, ServerToClientEvents>;

export function registerGameHandlers(io: AppServer, socket: AppSocket): void {
  socket.on('game:placeBet', ({ bet }) => {
    const info = roomStore.getPlayerBySocket(socket.id);
    if (!info) return;

    const engine = roomStore.getRoom(info.roomCode);
    if (!engine) return;

    const result = engine.placeBet(info.playerId, bet);
    if (!result.ok) {
      socket.emit('game:betError', { message: result.error! });
    }
  });

  socket.on('game:playCard', ({ cardId, jokerDeclaredValue }) => {
    const info = roomStore.getPlayerBySocket(socket.id);
    if (!info) return;

    const engine = roomStore.getRoom(info.roomCode);
    if (!engine) return;

    const result = engine.playCard(info.playerId, cardId, jokerDeclaredValue);
    if (!result.ok) {
      socket.emit('game:playError', { message: result.error! });
    }
  });

  socket.on('game:passCards', ({ cardIds }) => {
    const info = roomStore.getPlayerBySocket(socket.id);
    if (!info) return;

    const engine = roomStore.getRoom(info.roomCode);
    if (!engine) return;

    const result = engine.submitPassCards(info.playerId, cardIds);
    if (!result.ok) {
      socket.emit('game:playError', { message: result.error! });
    }
  });

  socket.on('game:exchangeCard', ({ cardId, targetPlayerId }) => {
    const info = roomStore.getPlayerBySocket(socket.id);
    if (!info) return;

    const engine = roomStore.getRoom(info.roomCode);
    if (!engine) return;

    const result = engine.submitExchange(info.playerId, cardId, targetPlayerId);
    if (!result.ok) {
      socket.emit('game:playError', { message: result.error! });
    }
  });

  socket.on('game:designatePlayer', ({ targetPlayerId }) => {
    const info = roomStore.getPlayerBySocket(socket.id);
    if (!info) return;

    const engine = roomStore.getRoom(info.roomCode);
    if (!engine) return;

    const result = engine.submitDesignation(info.playerId, targetPlayerId);
    if (!result.ok) {
      socket.emit('game:playError', { message: result.error! });
    }
  });
}
