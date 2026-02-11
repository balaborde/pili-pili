import { BaseMission } from './BaseMission';
import type { PlayedCard, Player } from '../../../src/types/game.types';
import type { MissionType, StateModification } from '../../../src/types/mission.types';

export class PenaltyNumbersMission extends BaseMission {
  readonly id: string;
  readonly name = 'Numéros pénalité';
  readonly description: string;
  readonly isExpert = false;
  readonly type: MissionType = 'penaltyNumbers';
  readonly cardsPerPlayer: number;
  readonly params: { penaltyNumbers: number[] };

  constructor(cardsPerPlayer: number, penaltyNumbers: number[]) {
    super();
    this.cardsPerPlayer = cardsPerPlayer;
    this.params = { penaltyNumbers };
    this.id = `penaltyNumbers-${penaltyNumbers.join('-')}`;
    this.description = `Les joueurs qui remportent un pli contenant l'un des numéros ${penaltyNumbers.join(', ')} reçoivent 1 Pili en pénalité.`;
  }

  onTrickWon(
    winnerId: string,
    trick: PlayedCard[],
    _trickNumber: number,
    _totalTricks: number,
    _players: Player[]
  ): StateModification[] {
    const hasPenaltyCard = trick.some((play) =>
      this.params.penaltyNumbers.includes(play.card.value)
    );

    if (hasPenaltyCard) {
      return [{ type: 'addPili', playerId: winnerId, amount: 1 }];
    }
    return [];
  }
}
