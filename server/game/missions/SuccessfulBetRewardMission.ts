import { BaseMission } from './BaseMission';
import type { Player } from '../../../src/types/game.types';
import type { MissionType, ScoreModification } from '../../../src/types/mission.types';

export class SuccessfulBetRewardMission extends BaseMission {
  readonly id = 'successfulBetReward';
  readonly name = 'Récompense pari réussi';
  readonly description =
    'Pari réussi ? Le joueur défausse autant de Pilis que la valeur de son pari.';
  readonly isExpert = true;
  readonly type: MissionType = 'successfulBetReward';
  readonly cardsPerPlayer: number;
  readonly params = {};

  constructor(cardsPerPlayer: number) {
    super();
    this.cardsPerPlayer = cardsPerPlayer;
  }

  onRoundEnd(players: Player[]): ScoreModification[] {
    const modifications: ScoreModification[] = [];

    for (const player of players) {
      const bet = player.bet ?? 0;
      if (bet === player.tricksWon && bet > 0) {
        modifications.push({
          playerId: player.id,
          extraPilis: 0,
          removedPilis: Math.min(bet, player.pilis),
          reason: `Pari réussi (${bet}) → défausse ${Math.min(bet, player.pilis)} Pili(s)`,
        });
      }
    }

    return modifications;
  }
}
