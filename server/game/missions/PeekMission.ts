import { BaseMission } from './BaseMission';
import type { MissionType, VisibilityRule } from '../../../src/types/mission.types';

export class PeekMission extends BaseMission {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly isExpert: boolean;
  readonly type: MissionType = 'peek';
  readonly cardsPerPlayer: number;
  readonly params: { durationSeconds: number };

  constructor(cardsPerPlayer: number, durationSeconds: 3 | 5) {
    super();
    this.cardsPerPlayer = cardsPerPlayer;
    this.params = { durationSeconds };
    this.id = `peek-${durationSeconds}s`;
    this.isExpert = durationSeconds === 3;
    this.name = `Peek ${durationSeconds}s`;
    this.description = `Les joueurs ont ${durationSeconds} secondes pour regarder leurs cartes, puis les posent face cachée : les paris et les plis se font à l'aveugle.`;
  }

  hasPreBetPhase(): boolean {
    return true;
  }

  getPeekDurationMs(): number {
    return this.params.durationSeconds * 1000;
  }

  getVisibility(): VisibilityRule {
    // After peek, players can't see their own cards
    return { canSeeOwnCards: false, canSeeOthersCards: false };
  }
}
