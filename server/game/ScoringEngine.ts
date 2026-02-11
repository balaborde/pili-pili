import type { Player, RoundScoringData, PlayerScore } from '../../src/types/game.types';
import type { ScoreModification } from '../../src/types/mission.types';

export class ScoringEngine {
  /**
   * Calculate round scoring for all players
   */
  calculateRoundScoring(
    players: Player[],
    missionModifications: ScoreModification[]
  ): RoundScoringData {
    const playerScores = players.map((player) => {
      const bet = player.bet ?? 0;
      const basePilis = Math.abs(bet - player.tricksWon);

      // Get mission-specific modifications for this player
      const mods = missionModifications.filter((m) => m.playerId === player.id);
      const missionPilis = mods.reduce((sum, m) => sum + m.extraPilis, 0);
      const rewardPilis = mods.reduce((sum, m) => sum + m.removedPilis, 0);

      const totalNewPilis = Math.max(0, basePilis + missionPilis - rewardPilis);
      const totalPilis = player.pilis + totalNewPilis;

      return {
        playerId: player.id,
        name: player.name,
        bet,
        tricksWon: player.tricksWon,
        basePilis,
        missionPilis,
        rewardPilis,
        totalNewPilis,
        totalPilis,
      };
    });

    return { players: playerScores };
  }

  /**
   * Apply scoring to players (mutates player pilis)
   */
  applyScoring(players: Player[], scoring: RoundScoringData): void {
    for (const score of scoring.players) {
      const player = players.find((p) => p.id === score.playerId);
      if (player) {
        player.pilis = score.totalPilis;
      }
    }
  }

  /**
   * Check if game is over (any player reached pili limit)
   */
  isGameOver(players: Player[], piliLimit: number): boolean {
    return players.some((p) => p.pilis >= piliLimit);
  }

  /**
   * Get final standings sorted by fewest pilis
   */
  getFinalStandings(players: Player[]): PlayerScore[] {
    const sorted = [...players].sort((a, b) => a.pilis - b.pilis);
    return sorted.map((p, i) => ({
      playerId: p.id,
      name: p.name,
      pilis: p.pilis,
      rank: i + 1,
    }));
  }

  /**
   * Get the eliminated player (first to reach pili limit)
   */
  getEliminatedPlayerId(players: Player[], piliLimit: number): string | null {
    const eliminated = players.find((p) => p.pilis >= piliLimit);
    return eliminated?.id ?? null;
  }
}
