import { BaseMission } from './BaseMission';
import type { MissionType } from '../../../src/types/mission.types';

export class PassAllCardsMission extends BaseMission {
  readonly id: string;
  readonly name = 'Passer toutes les cartes';
  readonly description: string;
  readonly isExpert = false;
  readonly type: MissionType = 'passAllCards';
  readonly cardsPerPlayer: number;
  readonly params: { direction: 'left' | 'right' };

  constructor(cardsPerPlayer: number, direction: 'left' | 'right') {
    super();
    this.cardsPerPlayer = cardsPerPlayer;
    this.params = { direction };
    this.id = `passAll-${direction}`;
    this.description = `Après les paris, chaque joueur donne toutes ses cartes au joueur à sa ${direction === 'left' ? 'gauche' : 'droite'}.`;
  }

  hasPostBetPhase(): boolean {
    return true;
  }

  isPassAll(): boolean {
    return true;
  }

  getPassDirection(): 'left' | 'right' {
    return this.params.direction;
  }
}
