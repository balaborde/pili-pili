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

  socket.on('game:leave', () => {
    const info = roomStore.getPlayerBySocket(socket.id);
    if (!info) return;

    const room = roomStore.getRoom(info.roomCode);
    const game = gameStore.getGame(info.roomCode);

    if (!room || !game) return;

    // Get remaining human players (excluding the one leaving)
    const remainingHumans = room.getPlayers().filter(p => !p.isBot && p.id !== info.playerId);

    if (remainingHumans.length === 0) {
      // Last human player - end game and delete room
      gameStore.removeGame(info.roomCode);
      roomStore.deleteRoom(info.roomCode);
      io.to(info.roomCode).emit('game:notification', {
        message: 'Partie terminée : tous les joueurs ont quitté',
        type: 'info',
      });
    } else {
      // Replace with bot
      const botNames = ['Cayenne', 'Habanero', 'Jalapeño', 'Tabasco', 'Sriracha', 'Chipotle', 'Paprika', 'Wasabi'];
      const botIndex = room.getPlayers().filter(p => p.isBot).length;
      const botName = `${botNames[botIndex % botNames.length]} (Bot)`;

      const result = game.replacePlayerWithBot(info.playerId, botName, 'medium');

      if (result.ok && result.botId) {
        // Update room
        const player = room.getPlayers().find(p => p.id === info.playerId);
        if (player) {
          player.isBot = true;
          player.botDifficulty = 'medium';
          player.name = botName;
        }

        // Notify everyone
        io.to(info.roomCode).emit('game:playerReplacedByBot', {
          playerId: info.playerId,
          botId: result.botId,
          botName,
        });

        io.to(info.roomCode).emit('game:notification', {
          message: `${botName} remplace le joueur`,
          type: 'info',
        });
      }
    }

    // Remove socket mapping and leave room
    roomStore.removeSocket(socket.id);
    socket.leave(info.roomCode);
  });

  socket.on('game:returnToLobby', () => {
    const info = roomStore.getPlayerBySocket(socket.id);
    if (!info) return;

    const room = roomStore.getRoom(info.roomCode);
    if (!room) return;

    const game = gameStore.getGame(info.roomCode);
    if (game) {
      game.destroy();
      gameStore.removeGame(info.roomCode);
    }

    room.resetForLobby();

    const roomState = {
      code: room.roomCode,
      hostId: room.getHostId()!,
      players: room.getPlayers().map((p) => room.toClientPlayer(p)),
      settings: room.getSettings(),
      isGameStarted: false,
    };

    io.to(info.roomCode).emit('room:returnedToLobby', { roomState });
  });
}
