import { BaseMission } from './BaseMission';
import type { MissionType } from '../../../src/types/mission.types';

export class SimultaneousPlayMission extends BaseMission {
  readonly id = 'simultaneousPlay';
  readonly name = 'Jeu simultané';
  readonly description =
    'À chaque pli, les joueurs jouent leurs cartes en même temps.';
  readonly isExpert = true;
  readonly type: MissionType = 'simultaneousPlay';
  readonly cardsPerPlayer: number;
  readonly params = {};

  constructor(cardsPerPlayer: number) {
    super();
    this.cardsPerPlayer = cardsPerPlayer;
  }

  isSimultaneous(): boolean {
    return true;
  }
}
