import { BaseMission } from './BaseMission';
import type { PlayedCard, Player } from '../../../src/types/game.types';
import type { MissionType, StateModification } from '../../../src/types/mission.types';

export class FirstLastTrickMission extends BaseMission {
  readonly id = 'firstLastTrick';
  readonly name = '1er / Dernier pli';
  readonly description =
    'Les joueurs qui remportent le premier et/ou le dernier pli reçoivent 1 Pili en pénalité.';
  readonly isExpert = true;
  readonly type: MissionType = 'firstLastTrick';
  readonly cardsPerPlayer: number;
  readonly params = {};

  constructor(cardsPerPlayer: number) {
    super();
    this.cardsPerPlayer = cardsPerPlayer;
  }

  onTrickWon(
    winnerId: string,
    _trick: PlayedCard[],
    trickNumber: number,
    totalTricks: number,
    _players: Player[]
  ): StateModification[] {
    const isFirst = trickNumber === 1;
    const isLast = trickNumber === totalTricks;

    if (isFirst || isLast) {
      return [{ type: 'addPili', playerId: winnerId, amount: 1 }];
    }
    return [];
  }
}
