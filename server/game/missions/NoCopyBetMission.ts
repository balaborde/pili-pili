import { BaseMission } from './BaseMission';
import type { MissionType, BetContext, BetValidationResult } from '../../../src/types/mission.types';

export class NoCopyBetMission extends BaseMission {
  readonly id = 'noCopyBet';
  readonly name = 'Pas de copie';
  readonly description =
    'Interdit de copier le pari du joueur précédent.';
  readonly isExpert = false;
  readonly type: MissionType = 'noCopyBet';
  readonly cardsPerPlayer: number;
  readonly params = {};

  constructor(cardsPerPlayer: number) {
    super();
    this.cardsPerPlayer = cardsPerPlayer;
  }

  validateBet(bet: number, context: BetContext): BetValidationResult {
    // Find the previous player's bet
    const prevIndex = context.playerIndex - 1;
    if (prevIndex >= 0 && context.previousBets[prevIndex] !== null) {
      if (bet === context.previousBets[prevIndex]) {
        return {
          valid: false,
          reason: `Interdit de copier le pari du joueur précédent (${context.previousBets[prevIndex]})`,
        };
      }
    }
    return { valid: true };
  }
}
