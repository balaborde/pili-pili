import { BaseMission } from './BaseMission';
import type { MissionType } from '../../../src/types/mission.types';

export class StandardMission extends BaseMission {
  readonly id = 'standard';
  readonly name = 'Standard';
  readonly description = 'Pas de règle spéciale pour cette manche.';
  readonly isExpert = false;
  readonly type: MissionType = 'standard';
  readonly cardsPerPlayer: number;
  readonly params = {};

  constructor(cardsPerPlayer: number = 5) {
    super();
    this.cardsPerPlayer = cardsPerPlayer;
  }
}
