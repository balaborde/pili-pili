import { nanoid } from 'nanoid';
import type { Card } from '../../src/types/game.types';
import { TOTAL_NUMBERED_CARDS } from '../../src/lib/constants';

export class Deck {
  private cards: Card[] = [];

  constructor() {
    this.reset();
  }

  reset(): void {
    this.cards = [];
    // Cards 1-55
    for (let i = 1; i <= TOTAL_NUMBERED_CARDS; i++) {
      this.cards.push({ id: nanoid(8), value: i, isJoker: false });
    }
    // Joker
    this.cards.push({ id: nanoid(8), value: 0, isJoker: true });
  }

  shuffle(): void {
    // Fisher-Yates shuffle
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  deal(playerCount: number, cardsPerPlayer: number): Card[][] {
    this.reset();
    this.shuffle();

    const hands: Card[][] = Array.from({ length: playerCount }, () => []);
    const totalNeeded = playerCount * cardsPerPlayer;

    if (totalNeeded > this.cards.length) {
      throw new Error(
        `Cannot deal ${cardsPerPlayer} cards to ${playerCount} players (need ${totalNeeded}, have ${this.cards.length})`
      );
    }

    for (let i = 0; i < totalNeeded; i++) {
      hands[i % playerCount].push(this.cards[i]);
    }

    // Track remaining cards for draw-extra mission
    this._remaining = this.cards.slice(totalNeeded);

    return hands;
  }

  private _remaining: Card[] = [];

  drawOne(): Card | null {
    return this._remaining.shift() ?? null;
  }

  get remaining(): Card[] {
    return this._remaining;
  }
}
