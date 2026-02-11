import { BaseMission } from './BaseMission';
import type { Card, Player } from '../../../src/types/game.types';
import type { MissionType, PlayConstraint } from '../../../src/types/mission.types';

export class HighestLowestMission extends BaseMission {
  readonly id = 'highestLowest';
  readonly name = 'Plus haute ou plus basse';
  readonly description =
    'Les joueurs doivent TOUJOURS jouer leur carte la plus forte ou la plus faible.';
  readonly isExpert = false;
  readonly type: MissionType = 'highestLowest';
  readonly cardsPerPlayer: number;
  readonly params = {};

  constructor(cardsPerPlayer: number) {
    super();
    this.cardsPerPlayer = cardsPerPlayer;
  }

  getPlayConstraints(_player: Player, hand: Card[]): PlayConstraint {
    if (hand.length <= 2) {
      return { type: 'any' };
    }

    const sorted = [...hand].sort((a, b) => a.value - b.value);
    const lowest = sorted[0];
    const highest = sorted[sorted.length - 1];

    const allowedIds = new Set<string>();
    allowedIds.add(lowest.id);
    allowedIds.add(highest.id);

    // Joker can always be played (it can be declared as any value)
    const joker = hand.find((c) => c.isJoker);
    if (joker) allowedIds.add(joker.id);

    return { type: 'restricted', allowedCardIds: Array.from(allowedIds) };
  }
}
