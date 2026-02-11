import { BaseMission } from './BaseMission';
import type { MissionType } from '../../../src/types/mission.types';

export class PassCardsMission extends BaseMission {
  readonly id: string;
  readonly name = 'Passer des cartes';
  readonly description: string;
  readonly isExpert = false;
  readonly type: MissionType = 'passCards';
  readonly cardsPerPlayer: number;
  readonly params: { passCount: number; direction: 'left' | 'right' };

  constructor(cardsPerPlayer: number, passCount: number, direction: 'left' | 'right') {
    super();
    this.cardsPerPlayer = cardsPerPlayer;
    this.params = { passCount, direction };
    this.id = `passCards-${passCount}-${direction}`;
    this.description = `Après les paris, chaque joueur donne ${passCount} carte(s) au joueur à sa ${direction === 'left' ? 'gauche' : 'droite'}.`;
  }

  hasPostBetPhase(): boolean {
    return true;
  }

  getPassCount(): number {
    return this.params.passCount;
  }

  getPassDirection(): 'left' | 'right' {
    return this.params.direction;
  }
}
