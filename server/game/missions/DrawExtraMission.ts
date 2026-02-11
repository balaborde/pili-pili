import { BaseMission } from './BaseMission';
import type { MissionType } from '../../../src/types/mission.types';

export class DrawExtraMission extends BaseMission {
  readonly id = 'drawExtra';
  readonly name = 'Carte bonus';
  readonly description =
    'Après les paris, chaque joueur pioche une carte au hasard et l\'ajoute à sa main. Les paris portent donc sur 3 cartes au lieu de 2.';
  readonly isExpert = false;
  readonly type: MissionType = 'drawExtra';
  readonly cardsPerPlayer: number;
  readonly params = {};

  constructor(cardsPerPlayer: number) {
    super();
    this.cardsPerPlayer = cardsPerPlayer;
  }

  hasPostBetPhase(): boolean {
    return true;
  }

  drawsExtraCard(): boolean {
    return true;
  }
}
