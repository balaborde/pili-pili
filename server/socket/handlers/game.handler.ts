import type { Server, Socket } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents } from '../../../src/types/socket.types';
import { roomStore } from '../../store/RoomStore';
import { gameStore } from '../../store/GameStore';

type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
type AppServer = Server<ClientToServerEvents, ServerToClientEvents>;

export function registerGameHandlers(io: AppServer, socket: AppSocket): void {
  socket.on('game:placeBet', ({ bet }) => {
    const info = roomStore.getPlayerBySocket(socket.id);
    if (!info) return;
    const game = gameStore.getGame(info.roomCode);
    if (!game) return;
    const result = game.placeBet(info.playerId, bet);
    if (!result.ok) {
      socket.emit('game:error', { message: result.error! });
    }
  });

  socket.on('game:playCard', ({ cardId }) => {
    const info = roomStore.getPlayerBySocket(socket.id);
    if (!info) return;
    const game = gameStore.getGame(info.roomCode);
    if (!game) return;
    const result = game.playCard(info.playerId, cardId);
    if (!result.ok) {
      socket.emit('game:error', { message: result.error! });
    }
  });

  socket.on('game:missionAction', ({ action }) => {
    const info = roomStore.getPlayerBySocket(socket.id);
    if (!info) return;
    const game = gameStore.getGame(info.roomCode);
    if (!game) return;
    const result = game.handleMissionAction(info.playerId, action);
    if (!result.ok) {
      socket.emit('game:error', { message: result.error! });
    }
  });

  socket.on('game:chooseJokerValue', ({ value }) => {
    const info = roomStore.getPlayerBySocket(socket.id);
    if (!info) return;
    const game = gameStore.getGame(info.roomCode);
    if (!game) return;
    const result = game.chooseJokerValue(info.playerId, value);
    if (!result.ok) {
      socket.emit('game:error', { message: result.error! });
    }
  });

  socket.on('game:acknowledgePhase', () => {
    const info = roomStore.getPlayerBySocket(socket.id);
    if (!info) return;
    const game = gameStore.getGame(info.roomCode);
    if (!game) return;
    game.acknowledgePhase(info.playerId);
  });
}
