// ============================================================
// Core Types — shared between client and server
// ============================================================

export type BotDifficulty = 'easy' | 'medium' | 'hard';

export interface ClientPlayer {
  id: string;
  name: string;
  isBot: boolean;
  botDifficulty?: BotDifficulty;
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

// ============================================================
// Card Types
// ============================================================

export interface Card {
  id: number;       // 0 = joker, 1-55 = numbered
  value: number;    // effective value (joker: 0 or 56 once chosen)
  isJoker: boolean;
}

// ============================================================
// Game Phase
// ============================================================

export type GamePhase =
  | 'ROUND_START'
  | 'DEALING'
  | 'PRE_BETTING'
  | 'BETTING'
  | 'POST_BETTING'
  | 'TRICK_PLAY'
  | 'TRICK_RESOLVE'
  | 'ROUND_END'
  | 'GAME_OVER';

// ============================================================
// Mission Info (client-facing)
// ============================================================

export interface MissionInfo {
  id: number;
  name: string;
  description: string;
  difficulty: 'standard' | 'expert';
  cardsPerPlayer: number;
  icon: string;
}

// ============================================================
// Trick
// ============================================================

export interface TrickCard {
  playerId: string;
  card: Card;
}

// ============================================================
// Round Results
// ============================================================

export interface PlayerRoundResult {
  playerId: string;
  playerName: string;
  bet: number;
  tricksWon: number;
  gap: number;
  pilisGained: number;  // gap + victim designation (applied at endRound)
  missionPilis: number; // trick-time + designation bonus (display only)
  pilisRemoved: number;
  totalPilis: number;
  isEliminated: boolean;
}

// ============================================================
// Mission Action Requests (server → client)
// ============================================================

export type MissionActionRequest =
  | { type: 'CHOOSE_CARDS_TO_PASS'; count: number; direction: 'left' | 'right' }
  | { type: 'DESIGNATE_VICTIM'; excludeSelf: boolean }
  | { type: 'CHOOSE_JOKER_VALUE' };

// ============================================================
// Mission Action Payloads (client → server)
// ============================================================

export type MissionActionPayload =
  | { type: 'CARDS_TO_PASS'; cardIds: number[] }
  | { type: 'DESIGNATE_VICTIM'; victimId: string };

// ============================================================
// Client Game Player (public info during game)
// ============================================================

export interface ClientGamePlayer {
  id: string;
  name: string;
  isBot: boolean;
  seatIndex: number;
  cardCount: number;
  bet: number | null;
  tricksWon: number;
  pilis: number;
  isCurrentTurn: boolean;
  isEliminated: boolean;
  isConnected: boolean;
  designatedVictimId?: string;
}

// ============================================================
// Client Game State (personalized per player)
// ============================================================

export interface ClientGameState {
  phase: GamePhase;
  roundNumber: number;
  trickNumber: number;
  totalTricks: number;
  mission: MissionInfo;

  players: ClientGamePlayer[];

  myHand: Card[];
  visibleHands: Record<string, Card[]>;

  currentTrick: TrickCard[];
  leadPlayerId: string | null;

  bettingOrder: string[];
  currentBettorId: string | null;
  bettingConstraint: {
    sumSoFar: number;
    forbiddenBet: number | null;
  } | null;
  forbiddenBetValues: number[];

  currentTurnPlayerId: string | null;
  turnTimeRemaining: number | null;

  isSimultaneous: boolean;
  simultaneousPlayed: string[];

  missionAction: MissionActionRequest | null;

  roundResults: PlayerRoundResult[] | null;
  finalStandings: PlayerRoundResult[] | null;
  winnerId: string | null;
}
