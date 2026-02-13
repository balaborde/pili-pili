import type { Card, BotDifficulty, Player, Trick } from '../../../src/types/game.types';
import type { BetContext } from '../../../src/types/mission.types';
import { BOT_THINK_DELAY_MIN, BOT_THINK_DELAY_MAX } from '../../../src/lib/constants';
import type { BaseMission } from '../missions/BaseMission';
import type { BetValidator } from '../BetValidator';

export class BotPlayer {
  readonly id: string;
  readonly difficulty: BotDifficulty;

  constructor(id: string, difficulty: BotDifficulty) {
    this.id = id;
    this.difficulty = difficulty;
  }

  getThinkDelay(): number {
    const base = this.difficulty === 'easy' ? 800 : this.difficulty === 'medium' ? 1200 : 1800;
    const jitter = Math.random() * 1000;
    return Math.min(base + jitter, BOT_THINK_DELAY_MAX);
  }

  decideBet(
    hand: Card[],
    mission: BaseMission,
    context: BetContext,
    validator: BetValidator
  ): number {
    const maxBet = context.totalCards;
    let bet: number;

    switch (this.difficulty) {
      case 'easy':
        bet = Math.floor(Math.random() * (maxBet + 1));
        break;
      case 'medium':
        bet = this.mediumBetStrategy(hand, context);
        break;
      case 'hard':
        bet = this.hardBetStrategy(hand, context);
        break;
      default:
        bet = Math.floor(Math.random() * (maxBet + 1));
    }

    // Clamp
    bet = Math.max(0, Math.min(bet, maxBet));

    // Validate and adjust if needed
    const coreResult = validator.validateCoreBet(bet, context);
    const missionResult = mission.validateBet(bet, context);

    if (!coreResult.valid || !missionResult.valid) {
      // Try other values
      for (let b = 0; b <= maxBet; b++) {
        const ctx = { ...context };
        const cr = validator.validateCoreBet(b, ctx);
        const mr = mission.validateBet(b, ctx);
        if (cr.valid && mr.valid) {
          bet = b;
          break;
        }
      }
    }

    return bet;
  }

  private mediumBetStrategy(hand: Card[], context: BetContext): number {
    const median = 28;
    let estimate = 0;
    for (const card of hand) {
      if (card.isJoker) {
        estimate += 0.8;
      } else if (card.value > median) {
        estimate += 0.6;
      } else {
        estimate += 0.2;
      }
    }
    return Math.round(estimate);
  }

  private hardBetStrategy(hand: Card[], context: BetContext): number {
    let estimate = 0;
    const playerCount = context.playerCount;

    for (const card of hand) {
      if (card.isJoker) {
        estimate += 0.9;
      } else if (card.value >= 45) {
        estimate += 0.85;
      } else if (card.value >= 35) {
        estimate += 0.6;
      } else if (card.value >= 25) {
        estimate += 0.35;
      } else if (card.value >= 15) {
        estimate += 0.15;
      } else {
        estimate += 0.05;
      }
    }

    // Adjust for player count (more players = harder to win)
    const adjustment = 1 - (playerCount - 2) * 0.08;
    estimate *= Math.max(0.5, adjustment);

    return Math.round(estimate);
  }

  decideCardToPlay(hand: Card[], trick: Trick, mission: BaseMission): Card {
    if (hand.length === 1) return hand[0];

    // Get play constraints
    const constraints = mission.getPlayConstraints(
      { hand } as any,
      hand
    );

    let playableCards = hand;
    if (constraints.type === 'restricted') {
      playableCards = hand.filter((c) => constraints.allowedCardIds.includes(c.id));
      if (playableCards.length === 0) playableCards = hand; // Fallback
    }

    if (this.difficulty === 'easy') {
      return playableCards[Math.floor(Math.random() * playableCards.length)];
    }

    const isLeading = trick.plays.length === 0;
    const sorted = [...playableCards].sort((a, b) => {
      const va = a.isJoker ? 56 : a.value;
      const vb = b.isJoker ? 56 : b.value;
      return va - vb;
    });

    if (isLeading) {
      // Play medium card
      return sorted[Math.floor(sorted.length / 2)];
    }

    // Following
    const highestInTrick = Math.max(...trick.plays.map((p) => p.effectiveValue));

    // Find smallest card that beats current highest
    const canBeat = sorted.filter((c) => {
      const v = c.isJoker ? 56 : c.value;
      return v > highestInTrick;
    });

    if (canBeat.length > 0) {
      // Play lowest winning card
      return canBeat[0];
    }

    // Can't beat — dump lowest
    return sorted[0];
  }

  decideJokerValue(mission: BaseMission): number {
    // Easy bots randomly pick 0 or 56
    if (this.difficulty === 'easy') {
      return Math.random() < 0.5 ? 0 : 56;
    }
    // Medium/hard bots usually play 56 (strongest), occasionally 0
    return Math.random() < 0.15 ? 0 : 56;
  }

  decideDesignation(players: Player[]): string {
    const others = players.filter((p) => p.id !== this.id);
    if (others.length === 0) return '';

    switch (this.difficulty) {
      case 'easy':
        // Pure random
        return others[Math.floor(Math.random() * others.length)].id;

      case 'medium':
        // Prefer designating the player with the most pilis (weakest player)
        return [...others].sort((a, b) => b.pilis - a.pilis)[0].id;

      case 'hard':
        // Designate the player with fewest pilis (most likely to get 0 extra pilis)
        // This minimizes the damage of designating someone
        return [...others].sort((a, b) => a.pilis - b.pilis)[0].id;

      default:
        return others[Math.floor(Math.random() * others.length)].id;
    }
  }

  decideCardsToPass(hand: Card[], count: number): Card[] {
    // Pass the weakest cards
    const sorted = [...hand].sort((a, b) => {
      const va = a.isJoker ? 56 : a.value;
      const vb = b.isJoker ? 56 : b.value;
      return va - vb;
    });
    return sorted.slice(0, Math.min(count, sorted.length));
  }
}
