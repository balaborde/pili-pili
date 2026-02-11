import type { Server, Socket } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents } from '../../../src/types/socket.types';
import type { ClientPlayer } from '../../../src/types/game.types';
import { roomStore } from '../../store/RoomStore';
import type { GameEngine, GameEvent } from '../../game/GameEngine';

type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
type AppServer = Server<ClientToServerEvents, ServerToClientEvents>;

const BOT_NAMES = [
  'Cayenne', 'Habanero', 'Jalapeño', 'Tabasco',
  'Sriracha', 'Chipotle', 'Paprika', 'Wasabi',
];

function toClientPlayer(player: { id: string; name: string; isBot: boolean; isConnected: boolean; isReady: boolean; hand: { length: number } | any[]; bet: number | null; tricksWon: number; pilis: number; seatIndex: number }): ClientPlayer {
  return {
    id: player.id,
    name: player.name,
    isBot: player.isBot,
    isConnected: player.isConnected,
    isReady: player.isReady,
    cardCount: Array.isArray(player.hand) ? player.hand.length : 0,
    bet: player.bet,
    tricksWon: player.tricksWon,
    pilis: player.pilis,
    seatIndex: player.seatIndex,
  };
}

export function registerLobbyHandlers(io: AppServer, socket: AppSocket): void {
  socket.on('room:create', ({ playerName, settings }) => {
    const engine = roomStore.createRoom(settings);
    const player = engine.addPlayer(playerName);
    const sessionToken = roomStore.registerSocket(socket.id, engine.roomCode, player.id);

    socket.join(engine.roomCode);

    socket.emit('room:created', {
      roomCode: engine.roomCode,
      playerId: player.id,
      sessionToken,
    });
  });

  socket.on('room:join', ({ roomCode, playerName }) => {
    const code = roomCode.toUpperCase();
    const engine = roomStore.getRoom(code);

    if (!engine) {
      socket.emit('room:error', { message: 'Room introuvable' });
      return;
    }

    if (engine.getPhase() !== 'LOBBY') {
      socket.emit('room:error', { message: 'La partie a déjà commencé' });
      return;
    }

    const currentPlayers = engine.getPlayers();
    if (currentPlayers.length >= engine.getSettings().maxPlayers) {
      socket.emit('room:error', { message: 'La room est pleine' });
      return;
    }

    const player = engine.addPlayer(playerName);
    const sessionToken = roomStore.registerSocket(socket.id, code, player.id);

    socket.join(code);

    // Send room state to joining player
    socket.emit('room:joined', {
      roomState: {
        code,
        hostId: engine.getHostId(),
        players: engine.getPlayers().map(toClientPlayer),
        settings: engine.getSettings(),
        isGameStarted: false,
      },
      playerId: player.id,
      sessionToken,
    });

    // Notify others
    socket.to(code).emit('room:playerJoined', { player: toClientPlayer(player) });
  });

  socket.on('room:leave', () => {
    const info = roomStore.removeSocket(socket.id);
    if (!info) return;

    const engine = roomStore.getRoom(info.roomCode);
    if (!engine) return;

    engine.removePlayer(info.playerId);
    socket.leave(info.roomCode);

    io.to(info.roomCode).emit('room:playerLeft', { playerId: info.playerId });

    // Clean up empty rooms
    if (engine.getPlayers().length === 0) {
      roomStore.deleteRoom(info.roomCode);
    }
  });

  socket.on('room:addBot', ({ difficulty }) => {
    const info = roomStore.getPlayerBySocket(socket.id);
    if (!info) return;

    const engine = roomStore.getRoom(info.roomCode);
    if (!engine) return;

    if (info.playerId !== engine.getHostId()) {
      socket.emit('room:error', { message: "Seul l'hôte peut ajouter des bots" });
      return;
    }

    const players = engine.getPlayers();
    if (players.length >= engine.getSettings().maxPlayers) {
      socket.emit('room:error', { message: 'La room est pleine' });
      return;
    }

    const botIndex = players.filter((p) => p.isBot).length;
    const botName = BOT_NAMES[botIndex % BOT_NAMES.length];
    const bot = engine.addPlayer(`${botName} (Bot)`, true, difficulty);

    io.to(info.roomCode).emit('room:botAdded', { bot: toClientPlayer(bot) });
  });

  socket.on('room:removeBot', ({ botId }) => {
    const info = roomStore.getPlayerBySocket(socket.id);
    if (!info) return;

    const engine = roomStore.getRoom(info.roomCode);
    if (!engine) return;

    if (info.playerId !== engine.getHostId()) {
      socket.emit('room:error', { message: "Seul l'hôte peut retirer des bots" });
      return;
    }

    engine.removePlayer(botId);
    io.to(info.roomCode).emit('room:botRemoved', { botId });
  });

  socket.on('room:toggleReady', () => {
    const info = roomStore.getPlayerBySocket(socket.id);
    if (!info) return;

    const engine = roomStore.getRoom(info.roomCode);
    if (!engine) return;

    const ready = engine.toggleReady(info.playerId);
    io.to(info.roomCode).emit('room:readyChanged', { playerId: info.playerId, ready });
  });

  socket.on('room:updateSettings', (settings) => {
    const info = roomStore.getPlayerBySocket(socket.id);
    if (!info) return;

    const engine = roomStore.getRoom(info.roomCode);
    if (!engine) return;

    if (info.playerId !== engine.getHostId()) {
      socket.emit('room:error', { message: "Seul l'hôte peut modifier les paramètres" });
      return;
    }

    engine.updateSettings(settings);
    io.to(info.roomCode).emit('room:settingsUpdated', engine.getSettings());
  });

  socket.on('room:startGame', () => {
    const info = roomStore.getPlayerBySocket(socket.id);
    if (!info) return;

    const engine = roomStore.getRoom(info.roomCode);
    if (!engine) return;

    if (info.playerId !== engine.getHostId()) {
      socket.emit('room:error', { message: "Seul l'hôte peut lancer la partie" });
      return;
    }

    const check = engine.canStart();
    if (!check.ok) {
      socket.emit('room:error', { message: check.reason! });
      return;
    }

    // Set up game event listener BEFORE starting
    setupGameEventListener(io, engine);

    try {
      engine.startGame();

      // Send initial game state to all players
      const players = engine.getPlayers();
      for (const player of players) {
        const state = engine.getClientState(player.id);
        const sockets = getSocketsForPlayer(io, info.roomCode, player.id);
        for (const s of sockets) {
          s.emit('game:started', { state });
        }
      }
    } catch (error) {
      console.error('[GameEngine] Error starting game:', error);
      socket.emit('room:error', {
        message: error instanceof Error ? error.message : 'Erreur lors du démarrage'
      });
    }
  });
}

function setupGameEventListener(io: AppServer, engine: GameEngine): void {
  engine.onEvent((event: GameEvent) => {
    const roomCode = engine.roomCode;

    switch (event.type) {
      case 'phaseChanged':
        io.to(roomCode).emit('game:phaseChanged', { phase: event.phase, phaseData: event.phaseData });
        break;

      case 'missionRevealed':
        io.to(roomCode).emit('game:missionRevealed', { mission: event.mission });
        break;

      case 'cardsDealt':
        // Send each player their own hand
        for (const [playerId, hand] of event.playerHands) {
          const sockets = getSocketsForPlayer(io, roomCode, playerId);
          for (const s of sockets) {
            s.emit('game:cardsDealt', { hand, totalCards: event.totalCards });
          }
        }
        break;

      case 'betPlaced':
        io.to(roomCode).emit('game:betPlaced', { playerId: event.playerId, bet: event.bet });
        break;

      case 'allBetsRevealed':
        io.to(roomCode).emit('game:allBetsRevealed', { bets: event.bets });
        break;

      case 'turnChanged':
        io.to(roomCode).emit('game:turnChanged', { currentPlayerIndex: event.currentPlayerIndex });
        break;

      case 'cardPlayed':
        io.to(roomCode).emit('game:cardPlayed', { playerId: event.playerId, play: event.play });
        break;

      case 'trickWon':
        io.to(roomCode).emit('game:trickWon', { winnerId: event.winnerId, trick: event.trick });
        break;

      case 'roundScoring':
        io.to(roomCode).emit('game:roundScoring', event.data);
        break;

      case 'roundEnd':
        io.to(roomCode).emit('game:roundEnd', { scores: event.scores });
        break;

      case 'gameOver':
        io.to(roomCode).emit('game:over', {
          finalStandings: event.finalStandings,
          eliminatedId: event.eliminatedId,
        });
        break;

      case 'peekStart':
        io.to(roomCode).emit('game:peekStart', { durationMs: event.durationMs });
        break;

      case 'peekEnd':
        io.to(roomCode).emit('game:peekEnd');
        break;

      case 'cardsPassRequired':
        io.to(roomCode).emit('game:cardsPassRequired', {
          direction: event.direction,
          count: event.count,
        });
        break;

      case 'handUpdate': {
        const sockets = getSocketsForPlayer(io, roomCode, event.playerId);
        for (const s of sockets) {
          s.emit('game:handUpdate', { hand: event.hand });
        }
        break;
      }

      case 'designateRequired':
        io.to(roomCode).emit('game:designateRequired');
        break;

      case 'exchangeRequired':
        io.to(roomCode).emit('game:exchangeRequired', { withPlayerId: event.winnerId });
        break;

      case 'opponentHandsRevealed':
        io.to(roomCode).emit('game:opponentHandsRevealed', { hands: event.hands });
        break;

      case 'indianPokerReveal': {
        const sockets = getSocketsForPlayer(io, roomCode, event.targetPlayerId);
        for (const s of sockets) {
          s.emit('game:indianPokerReveal', { otherPlayersCards: event.otherPlayersCards });
        }
        break;
      }
    }
  });
}

function getSocketsForPlayer(io: AppServer, roomCode: string, playerId: string): any[] {
  const room = io.sockets.adapter.rooms.get(roomCode);
  if (!room) return [];

  const result: any[] = [];
  for (const socketId of room) {
    const info = roomStore.getPlayerBySocket(socketId);
    if (info?.playerId === playerId) {
      const s = io.sockets.sockets.get(socketId);
      if (s) result.push(s);
    }
  }
  return result;
}
