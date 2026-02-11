import type { BetContext, BetValidationResult } from '../../src/types/mission.types';

export class BetValidator {
  /**
   * Core bet validation — always applied regardless of mission.
   * The last player to bet cannot choose a value that makes the total bets
   * equal to the number of cards dealt (totalCards).
   */
  validateCoreBet(bet: number, context: BetContext): BetValidationResult {
    if (bet < 0) {
      return { valid: false, reason: 'Le pari ne peut pas être négatif' };
    }

    if (bet > context.totalCards) {
      return { valid: false, reason: `Le pari ne peut pas dépasser ${context.totalCards}` };
    }

    // Check if this is the last player to bet
    const betsPlaced = context.previousBets.filter((b) => b !== null);
    const isLastPlayer = betsPlaced.length === context.playerCount - 1;

    if (isLastPlayer) {
      const sumOfPreviousBets = betsPlaced.reduce((sum, b) => sum + (b ?? 0), 0);
      if (sumOfPreviousBets + bet === context.totalCards) {
        return {
          valid: false,
          reason: `Tu ne peux pas parier ${bet} — le total des paris ne peut pas être égal au nombre de cartes (${context.totalCards})`,
        };
      }
    }

    return { valid: true };
  }

  /**
   * Get forbidden bets for the last player (for UI display)
   */
  getForbiddenBetForLastPlayer(context: BetContext): number | null {
    const betsPlaced = context.previousBets.filter((b) => b !== null);
    const isLastPlayer = betsPlaced.length === context.playerCount - 1;

    if (!isLastPlayer) return null;

    const sumOfPreviousBets = betsPlaced.reduce((sum, b) => sum + (b ?? 0), 0);
    const forbidden = context.totalCards - sumOfPreviousBets;

    if (forbidden >= 0 && forbidden <= context.totalCards) {
      return forbidden;
    }
    return null;
  }
}
