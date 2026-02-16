import type { Server, Socket } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents } from '../../../src/types/socket.types';
import { roomStore } from '../../store/RoomStore';

type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
type AppServer = Server<ClientToServerEvents, ServerToClientEvents>;

const BOT_NAMES = [
  'Cayenne', 'Habanero', 'Jalapeño', 'Tabasco',
  'Sriracha', 'Chipotle', 'Paprika', 'Wasabi',
];

export function registerLobbyHandlers(io: AppServer, socket: AppSocket): void {
  socket.on('room:create', ({ playerName, settings }) => {
    const room = roomStore.createRoom(settings);
    const player = room.addPlayer(playerName);
    const sessionToken = roomStore.registerSocket(socket.id, room.roomCode, player.id);

    socket.join(room.roomCode);

    socket.emit('room:created', {
      roomCode: room.roomCode,
      playerId: player.id,
      sessionToken,
    });
  });

  socket.on('room:join', ({ roomCode, playerName }) => {
    const code = roomCode.toUpperCase();
    const room = roomStore.getRoom(code);

    if (!room) {
      socket.emit('room:error', { message: 'Room introuvable' });
      return;
    }

    const currentPlayers = room.getPlayers();
    if (currentPlayers.length >= room.getSettings().maxPlayers) {
      socket.emit('room:error', { message: 'La room est pleine' });
      return;
    }

    const player = room.addPlayer(playerName);
    const sessionToken = roomStore.registerSocket(socket.id, code, player.id);

    socket.join(code);

    socket.emit('room:joined', {
      roomState: {
        code,
        hostId: room.getHostId()!,
        players: room.getPlayers().map((p) => room.toClientPlayer(p)),
        settings: room.getSettings(),
        isGameStarted: false,
      },
      playerId: player.id,
      sessionToken,
    });

    socket.to(code).emit('room:playerJoined', { player: room.toClientPlayer(player) });
  });

  socket.on('room:leave', () => {
    const info = roomStore.removeSocket(socket.id);
    if (!info) return;

    const room = roomStore.getRoom(info.roomCode);
    if (!room) return;

    room.removePlayer(info.playerId);
    socket.leave(info.roomCode);

    io.to(info.roomCode).emit('room:playerLeft', { playerId: info.playerId });

    if (room.getPlayers().length === 0) {
      roomStore.deleteRoom(info.roomCode);
    }
  });

  socket.on('room:addBot', ({ difficulty }) => {
    const info = roomStore.getPlayerBySocket(socket.id);
    if (!info) return;

    const room = roomStore.getRoom(info.roomCode);
    if (!room) return;

    if (info.playerId !== room.getHostId()) {
      socket.emit('room:error', { message: "Seul l'hôte peut ajouter des bots" });
      return;
    }

    const players = room.getPlayers();
    if (players.length >= room.getSettings().maxPlayers) {
      socket.emit('room:error', { message: 'La room est pleine' });
      return;
    }

    const botIndex = players.filter((p) => p.isBot).length;
    const botName = BOT_NAMES[botIndex % BOT_NAMES.length];
    const bot = room.addPlayer(`${botName} (Bot)`, true, difficulty);

    io.to(info.roomCode).emit('room:botAdded', { bot: room.toClientPlayer(bot) });
  });

  socket.on('room:removeBot', ({ botId }) => {
    const info = roomStore.getPlayerBySocket(socket.id);
    if (!info) return;

    const room = roomStore.getRoom(info.roomCode);
    if (!room) return;

    if (info.playerId !== room.getHostId()) {
      socket.emit('room:error', { message: "Seul l'hôte peut retirer des bots" });
      return;
    }

    room.removePlayer(botId);
    io.to(info.roomCode).emit('room:botRemoved', { botId });
  });

  socket.on('room:toggleReady', () => {
    const info = roomStore.getPlayerBySocket(socket.id);
    if (!info) return;

    const room = roomStore.getRoom(info.roomCode);
    if (!room) return;

    const ready = room.toggleReady(info.playerId);
    io.to(info.roomCode).emit('room:readyChanged', { playerId: info.playerId, ready });
  });

  socket.on('room:updateSettings', (settings) => {
    const info = roomStore.getPlayerBySocket(socket.id);
    if (!info) return;

    const room = roomStore.getRoom(info.roomCode);
    if (!room) return;

    if (info.playerId !== room.getHostId()) {
      socket.emit('room:error', { message: "Seul l'hôte peut modifier les paramètres" });
      return;
    }

    room.updateSettings(settings);
    io.to(info.roomCode).emit('room:settingsUpdated', room.getSettings());
  });

  socket.on('room:startGame', () => {
    const info = roomStore.getPlayerBySocket(socket.id);
    if (!info) return;

    const room = roomStore.getRoom(info.roomCode);
    if (!room) return;

    if (info.playerId !== room.getHostId()) {
      socket.emit('room:error', { message: "Seul l'hôte peut lancer la partie" });
      return;
    }

    const check = room.canStart();
    if (!check.ok) {
      socket.emit('room:error', { message: check.reason! });
      return;
    }

    // TODO: Implement game start logic
    socket.emit('room:error', { message: 'Le jeu n\'est pas encore implémenté' });
  });
}
