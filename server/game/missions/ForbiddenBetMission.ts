import { BaseMission } from './BaseMission';
import type { MissionType, BetContext, BetValidationResult } from '../../../src/types/mission.types';

export class ForbiddenBetMission extends BaseMission {
  readonly id: string;
  readonly name = 'Pari interdit';
  readonly description: string;
  readonly isExpert = false;
  readonly type: MissionType = 'forbiddenBet';
  readonly cardsPerPlayer: number;
  readonly params: { forbiddenValue: number };

  constructor(cardsPerPlayer: number, forbiddenValue: 0 | 1) {
    super();
    this.cardsPerPlayer = cardsPerPlayer;
    this.params = { forbiddenValue };
    this.id = `forbiddenBet-${forbiddenValue}`;
    this.description = `Interdit de parier ${forbiddenValue}.`;
  }

  validateBet(bet: number, _context: BetContext): BetValidationResult {
    if (bet === this.params.forbiddenValue) {
      return { valid: false, reason: `Interdit de parier ${this.params.forbiddenValue} pour cette mission` };
    }
    return { valid: true };
  }
}
