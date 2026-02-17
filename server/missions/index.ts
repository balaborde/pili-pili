import type { Card, MissionActionRequest } from '../../src/types/game.types';

// ============================================================
// Mission Hook Context — passed to lifecycle hooks
// ============================================================

export interface MissionContext {
  players: Array<{
    id: string;
    hand: Card[];
    bet: number | null;
    tricksWon: number;
    pilis: number;
    seatIndex: number;
  }>;
  cardsPerPlayer: number;
  totalPlayers: number;
  deck: { drawOne(): Card | undefined };
  trickCards?: Array<{ playerId: string; card: Card }>;
  trickNumber?: number;
  totalTricks?: number;
}

// ============================================================
// Hook Return Types
// ============================================================

export interface PreBettingResult {
  blindBetting?: boolean;
  foreheadCards?: boolean;
  dealAfterBetting?: boolean;
}

export interface BettingConstraints {
  forbiddenValues?: number[];
  allDifferent?: boolean;
}

export interface PostBettingResult {
  extraDraws?: number;
  revealAllHands?: boolean;
  passEntireHand?: boolean;
}

export interface TrickModifier {
  extraPilis?: Array<{ playerId: string; amount: number; reason: string }>;
}

export interface RoundModifier {
  bonusRemovals?: Array<{ playerId: string; amount: number }>;
}

// ============================================================
// Mission Interface
// ============================================================

export interface Mission {
  id: number;
  name: string;
  description: string;
  difficulty: 'standard' | 'expert';
  icon: string;

  getCardsPerPlayer(totalPlayers: number): number;

  preBetting?(ctx: MissionContext): PreBettingResult;
  getBettingConstraints?(ctx: MissionContext): BettingConstraints;
  postBetting?(ctx: MissionContext): PostBettingResult;
  validatePlay?(ctx: MissionContext, playerId: string, card: Card): { valid: boolean; reason?: string };
  afterTrick?(ctx: MissionContext, winnerId: string): TrickModifier;
  afterRound?(ctx: MissionContext): RoundModifier;

  isSimultaneous?: boolean;
  invertValues?: boolean;

  getRequiredAction?(phase: 'preBetting' | 'postBetting', ctx: MissionContext, playerId: string): MissionActionRequest | null;
  getVisibility?(ctx: MissionContext, viewerPlayerId: string): Record<string, Card[]>;
}

// ============================================================
// Registry
// ============================================================

const missionRegistry = new Map<number, Mission>();
let missionsLoaded = false;

export function registerMission(mission: Mission): void {
  missionRegistry.set(mission.id, mission);
}

function ensureLoaded(): void {
  if (missionsLoaded) return;
  missionsLoaded = true;
  // Dynamic require to avoid circular init issues
  require('./standard');
  require('./expert');
}

export function getMission(id: number): Mission {
  ensureLoaded();
  const m = missionRegistry.get(id);
  if (!m) throw new Error(`Mission ${id} not found`);
  return m;
}

export function getAllMissionIds(includeExpert: boolean): number[] {
  ensureLoaded();
  const ids: number[] = [];
  for (const [id, m] of missionRegistry) {
    if (m.difficulty === 'standard' || includeExpert) {
      ids.push(id);
    }
  }
  return ids;
}
