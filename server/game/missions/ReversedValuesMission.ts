import { BaseMission } from './BaseMission';
import type { MissionType } from '../../../src/types/mission.types';

export class ReversedValuesMission extends BaseMission {
  readonly id = 'reversedValues';
  readonly name = 'Valeurs inversées';
  readonly description =
    'Toutes les valeurs sont inversées : le 55 devient le plus faible et le 1 le plus fort.';
  readonly isExpert = true;
  readonly type: MissionType = 'reversedValues';
  readonly cardsPerPlayer: number;
  readonly params = {};

  constructor(cardsPerPlayer: number) {
    super();
    this.cardsPerPlayer = cardsPerPlayer;
  }

  modifyEffectiveValue(cardValue: number, _isJoker: boolean): number {
    // Reverse: 1→55, 55→1, 0→56, 56→0
    return 56 - cardValue;
  }
}
