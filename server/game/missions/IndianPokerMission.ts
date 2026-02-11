import { BaseMission } from './BaseMission';
import type { MissionType, VisibilityRule } from '../../../src/types/mission.types';

export class IndianPokerMission extends BaseMission {
  readonly id = 'indianPoker';
  readonly name = 'Poker indien';
  readonly description =
    'Avant de parier, chaque joueur place ses cartes sur son front sans les regarder. On voit les cartes des autres, pas les siennes. On découvre ses cartes après avoir parié.';
  readonly isExpert = false;
  readonly type: MissionType = 'indianPoker';
  readonly cardsPerPlayer: number;
  readonly params = {};

  constructor(cardsPerPlayer: number) {
    super();
    this.cardsPerPlayer = cardsPerPlayer;
  }

  hasPreBetPhase(): boolean {
    return true;
  }

  getVisibility(): VisibilityRule {
    return { canSeeOwnCards: false, canSeeOthersCards: true };
  }
}
