import { BaseMission } from './BaseMission';
import type { MissionType } from '../../../src/types/mission.types';

export class CardExchangeMission extends BaseMission {
  readonly id = 'cardExchange';
  readonly name = 'Échange sur victoire';
  readonly description =
    "Chaque fois qu'un joueur remporte un pli, il échange une carte avec le joueur de son choix. Chacun des deux joueurs choisit la carte qu'il souhaite donner.";
  readonly isExpert = false;
  readonly type: MissionType = 'cardExchange';
  readonly cardsPerPlayer: number;
  readonly params = {};

  constructor(cardsPerPlayer: number) {
    super();
    this.cardsPerPlayer = cardsPerPlayer;
  }

  requiresExchangeOnWin(): boolean {
    return true;
  }
}
