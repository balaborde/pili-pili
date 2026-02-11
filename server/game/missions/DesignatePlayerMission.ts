import { BaseMission } from './BaseMission';
import type { Player } from '../../../src/types/game.types';
import type { MissionType, ScoreModification } from '../../../src/types/mission.types';

export class DesignatePlayerMission extends BaseMission {
  readonly id = 'designatePlayer';
  readonly name = 'Désigner un joueur';
  readonly description =
    "Après les paris, chaque joueur désigne un autre joueur. À la fin de la manche, chaque joueur reçoit ses propres Pilis + ceux du joueur désigné.";
  readonly isExpert = false;
  readonly type: MissionType = 'designatePlayer';
  readonly cardsPerPlayer: number;
  readonly params = {};

  // Stored designations: { designatorId: targetId }
  private designations: Map<string, string> = new Map();

  constructor(cardsPerPlayer: number) {
    super();
    this.cardsPerPlayer = cardsPerPlayer;
  }

  hasPostBetPhase(): boolean {
    return true;
  }

  requiresDesignation(): boolean {
    return true;
  }

  setDesignation(playerId: string, targetId: string): void {
    this.designations.set(playerId, targetId);
  }

  getDesignations(): Map<string, string> {
    return this.designations;
  }

  onRoundEnd(players: Player[]): ScoreModification[] {
    const modifications: ScoreModification[] = [];

    for (const player of players) {
      const targetId = this.designations.get(player.id);
      if (targetId) {
        const target = players.find((p) => p.id === targetId);
        if (target) {
          // Player receives the target's pilis as extra
          const targetBasePilis = Math.abs((target.bet ?? 0) - target.tricksWon);
          modifications.push({
            playerId: player.id,
            extraPilis: targetBasePilis,
            removedPilis: 0,
            reason: `Reçoit les Pilis de ${target.name}`,
          });
        }
      }
    }

    return modifications;
  }
}
