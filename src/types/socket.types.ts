import type {
  ClientPlayer,
  RoomSettings,
  RoomState,
  BotDifficulty,
} from './game.types';

// ============================================================
// Socket.io Event Maps
// ============================================================

export interface ClientToServerEvents {
  // Room / Lobby
  'room:create': (data: { playerName: string; settings?: Partial<RoomSettings> }) => void;
  'room:join': (data: { roomCode: string; playerName: string }) => void;
  'room:leave': () => void;
  'room:addBot': (data: { difficulty: BotDifficulty }) => void;
  'room:removeBot': (data: { botId: string }) => void;
  'room:toggleReady': () => void;
  'room:startGame': () => void;
  'room:updateSettings': (data: Partial<RoomSettings>) => void;
}

export interface ServerToClientEvents {
  // Room / Lobby
  'room:created': (data: { roomCode: string; playerId: string; sessionToken: string }) => void;
  'room:joined': (data: { roomState: RoomState; playerId: string; sessionToken: string }) => void;
  'room:playerJoined': (data: { player: ClientPlayer }) => void;
  'room:playerLeft': (data: { playerId: string }) => void;
  'room:botAdded': (data: { bot: ClientPlayer }) => void;
  'room:botRemoved': (data: { botId: string }) => void;
  'room:readyChanged': (data: { playerId: string; ready: boolean }) => void;
  'room:settingsUpdated': (data: RoomSettings) => void;
  'room:error': (data: { message: string }) => void;
}
