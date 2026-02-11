import type { PlayedCard } from '../../src/types/game.types';

export class TrickResolver {
  /**
   * Determine the winner of a trick.
   * The highest effectiveValue wins. Ties go to the first card played.
   */
  resolve(plays: PlayedCard[]): PlayedCard {
    if (plays.length === 0) {
      throw new Error('Cannot resolve an empty trick');
    }

    let winner = plays[0];
    for (let i = 1; i < plays.length; i++) {
      if (plays[i].effectiveValue > winner.effectiveValue) {
        winner = plays[i];
      }
    }
    return winner;
  }

  /**
   * Compute effective value for a card.
   * @param cardValue The card's face value (or joker declared value)
   * @param reversed Whether values are reversed (mission 14)
   */
  computeEffectiveValue(cardValue: number, reversed: boolean): number {
    if (reversed) {
      // 1 becomes strongest (value 55), 55 becomes weakest (value 1)
      // Joker declared 0 → 56, declared 56 → 0
      return 56 - cardValue;
    }
    return cardValue;
  }
}
