import type { Card } from '../src/types/game.types';

export class Deck {
  private cards: Card[] = [];

  constructor(includeJoker = true) {
    for (let i = 1; i <= 55; i++) {
      this.cards.push({ id: i, value: i, isJoker: false });
    }
    if (includeJoker) {
      this.cards.push({ id: 0, value: 0, isJoker: true });
    }
    this.shuffle();
  }

  shuffle(): void {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  deal(count: number): Card[] {
    return this.cards.splice(0, count);
  }

  drawOne(): Card | undefined {
    return this.cards.shift();
  }

  remaining(): number {
    return this.cards.length;
  }
}
