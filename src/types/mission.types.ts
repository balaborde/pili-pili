import type { Card, PlayedCard, Player } from './game.types';

// ============================================================
// Mission Types — used by server-side mission implementations
// ============================================================

export interface BetContext {
  playerIndex: number;
  playerCount: number;
  totalCards: number;
  previousBets: (number | null)[];
  hand: Card[];
}

export interface BetValidationResult {
  valid: boolean;
  reason?: string;
}

export interface PlayContext {
  trickNumber: number;
  currentTrick: PlayedCard[];
  isLeading: boolean;
  totalTricks: number;
  tricksWon: number;
}

export type PlayConstraint =
  | { type: 'any' }
  | { type: 'restricted'; allowedCardIds: string[] };

export interface VisibilityRule {
  canSeeOwnCards: boolean;
  canSeeOthersCards: boolean;
}

export type StateModificationType =
  | 'addPili'
  | 'removePili'
  | 'addCardToHand'
  | 'removeCardFromHand'
  | 'exchangeCards';

export interface StateModification {
  type: StateModificationType;
  playerId: string;
  amount?: number;
  cards?: Card[];
  targetPlayerId?: string;
}

export interface ScoreModification {
  playerId: string;
  extraPilis: number;
  removedPilis: number;
  reason: string;
}

export type MissionTiming = 'preBet' | 'postBet' | 'onTrickWon' | 'onRoundEnd';

export type MissionType =
  | 'passCards'
  | 'passAllCards'
  | 'forbiddenBet'
  | 'drawExtra'
  | 'faceUp'
  | 'peek'
  | 'noCopyBet'
  | 'designatePlayer'
  | 'highestLowest'
  | 'penaltyNumbers'
  | 'cardExchange'
  | 'successfulBetReward'
  | 'reversedValues'
  | 'simultaneousPlay'
  | 'firstLastTrick'
  | 'standard';
