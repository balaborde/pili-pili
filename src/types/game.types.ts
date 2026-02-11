// ============================================================
// Core Game Types — shared between client and server
// ============================================================

export enum GamePhase {
  LOBBY = 'LOBBY',
  ROUND_START = 'ROUND_START',
  MISSION_REVEAL = 'MISSION_REVEAL',
  DEALING = 'DEALING',
  PRE_BET_MISSION = 'PRE_BET_MISSION',
  BETTING = 'BETTING',
  POST_BET_MISSION = 'POST_BET_MISSION',
  TRICK_PLAY = 'TRICK_PLAY',
  TRICK_RESOLUTION = 'TRICK_RESOLUTION',
  ROUND_SCORING = 'ROUND_SCORING',
  ROUND_END = 'ROUND_END',
  GAME_OVER = 'GAME_OVER',
}

export interface Card {
  id: string;
  value: number; // 1-55 for numbered cards, 0 for joker (before declaration)
  isJoker: boolean;
}

export interface PlayedCard {
  playerId: string;
  card: Card;
  effectiveValue: number; // After joker declaration or reversed values
  jokerDeclaredValue?: number;
}

export interface Trick {
  plays: PlayedCard[];
  winnerId: string | null;
  trickNumber: number;
}

export type BotDifficulty = 'easy' | 'medium' | 'hard';

export interface Player {
  id: string;
  name: string;
  isBot: boolean;
  botDifficulty?: BotDifficulty;
  isConnected: boolean;
  isReady: boolean;
  hand: Card[];
  bet: number | null;
  tricksWon: number;
  pilis: number;
  seatIndex: number;
}

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
  // Only populated if mission reveals hands (face-up, indian poker for others)
  visibleHand?: Card[];
}

export interface MissionCardDef {
  id: string;
  name: string;
  description: string;
  isExpert: boolean;
  cardsPerPlayer: number;
  params: Record<string, unknown>;
}

export interface RoundScoringData {
  players: {
    playerId: string;
    name: string;
    bet: number;
    tricksWon: number;
    basePilis: number; // |bet - tricksWon|
    missionPilis: number; // Extra pilis from mission
    rewardPilis: number; // Pilis removed (e.g. mission 13)
    totalNewPilis: number;
    totalPilis: number;
  }[];
}

export interface PlayerScore {
  playerId: string;
  name: string;
  pilis: number;
  rank: number;
}

export interface ClientGameState {
  phase: GamePhase;
  roomCode: string;
  players: ClientPlayer[];
  myPlayerId: string;
  myHand: Card[];
  currentRound: number;
  currentTrick: Trick;
  previousTricks: Trick[];
  currentMission: MissionCardDef | null;
  currentPlayerIndex: number; // Whose turn to bet or play
  dealerIndex: number;
  totalTricksThisRound: number;
  missionState: Record<string, unknown>;
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
