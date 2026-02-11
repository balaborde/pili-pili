import { BaseMission } from './BaseMission';
import type { MissionType, VisibilityRule } from '../../../src/types/mission.types';

export class FaceUpMission extends BaseMission {
  readonly id = 'faceUp';
  readonly name = 'Cartes visibles';
  readonly description =
    'Après les paris, tous les joueurs placent leurs cartes face visible devant eux.';
  readonly isExpert = false;
  readonly type: MissionType = 'faceUp';
  readonly cardsPerPlayer: number;
  readonly params = {};

  constructor(cardsPerPlayer: number) {
    super();
    this.cardsPerPlayer = cardsPerPlayer;
  }

  hasPostBetPhase(): boolean {
    return true;
  }

  getVisibility(): VisibilityRule {
    return { canSeeOwnCards: true, canSeeOthersCards: true };
  }
}
