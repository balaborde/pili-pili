// ============================================================
// Core Types — shared between client and server
// ============================================================

export type BotDifficulty = 'easy' | 'medium' | 'hard';

export interface ClientPlayer {
  id: string;
  name: string;
  isBot: boolean;
  isConnected: boolean;
  isReady: boolean;
  cardCount: number;
  bet: number | null;
  tricksWon: number;
  pilis: number;
  seatIndex: number;
}

export interface RoomSettings {
  maxPlayers: number;
  includeExpertMissions: boolean;
  turnTimerSeconds: number;
  botDifficulty: BotDifficulty;
  piliLimit: number;
}

export const DEFAULT_ROOM_SETTINGS: RoomSettings = {
  maxPlayers: 8,
  includeExpertMissions: false,
  turnTimerSeconds: 30,
  botDifficulty: 'medium',
  piliLimit: 6,
};

export interface RoomState {
  code: string;
  hostId: string;
  players: ClientPlayer[];
  settings: RoomSettings;
  isGameStarted: boolean;
}
