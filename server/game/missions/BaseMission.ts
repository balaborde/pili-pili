import type { Card, PlayedCard, Player, MissionCardDef } from '../../../src/types/game.types';
import type {
  BetContext,
  BetValidationResult,
  PlayConstraint,
  VisibilityRule,
  ScoreModification,
  StateModification,
  MissionType,
} from '../../../src/types/mission.types';

export abstract class BaseMission {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly isExpert: boolean;
  abstract readonly type: MissionType;
  abstract readonly cardsPerPlayer: number;
  abstract readonly params: Record<string, unknown>;

  toCardDef(): MissionCardDef {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      isExpert: this.isExpert,
      cardsPerPlayer: this.cardsPerPlayer,
      params: this.params,
    };
  }

  // Phase hooks
  hasPreBetPhase(): boolean {
    return false;
  }
  hasPostBetPhase(): boolean {
    return false;
  }

  // Bet validation (called in addition to core bet validation)
  validateBet(_bet: number, _context: BetContext): BetValidationResult {
    return { valid: true };
  }

  // Trick resolution modifier (e.g., reversed values)
  modifyEffectiveValue(cardValue: number, _isJoker: boolean): number {
    return cardValue;
  }

  // Called when a trick is won
  onTrickWon(
    _winnerId: string,
    _trick: PlayedCard[],
    _trickNumber: number,
    _totalTricks: number,
    _players: Player[]
  ): StateModification[] {
    return [];
  }

  // Called at end of round for scoring modifications
  onRoundEnd(_players: Player[]): ScoreModification[] {
    return [];
  }

  // Play constraints (e.g., must play highest or lowest)
  getPlayConstraints(_player: Player, _hand: Card[]): PlayConstraint {
    return { type: 'any' };
  }

  // Visibility rules
  getVisibility(): VisibilityRule {
    return { canSeeOwnCards: true, canSeeOthersCards: false };
  }

  // Whether tricks are played simultaneously
  isSimultaneous(): boolean {
    return false;
  }

  // Get the peek duration in ms (0 = no peek)
  getPeekDurationMs(): number {
    return 0;
  }

  // Number of cards to pass (0 = no passing)
  getPassCount(): number {
    return 0;
  }

  // Direction of card passing
  getPassDirection(): 'left' | 'right' {
    return 'left';
  }

  // Whether players pass all cards
  isPassAll(): boolean {
    return false;
  }

  // Whether players draw an extra card after betting
  drawsExtraCard(): boolean {
    return false;
  }

  // Whether players designate another player
  requiresDesignation(): boolean {
    return false;
  }

  // Whether trick winner exchanges a card
  requiresExchangeOnWin(): boolean {
    return false;
  }
}
