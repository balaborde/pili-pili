import { Game } from '../Game';

class GameStore {
  private games = new Map<string, Game>();

  setGame(roomCode: string, game: Game): void {
    this.games.set(roomCode, game);
  }

  getGame(roomCode: string): Game | undefined {
    return this.games.get(roomCode);
  }

  removeGame(roomCode: string): void {
    const game = this.games.get(roomCode);
    if (game) {
      game.destroy();
      this.games.delete(roomCode);
    }
  }

  hasGame(roomCode: string): boolean {
    return this.games.has(roomCode);
  }
}

export const gameStore = new GameStore();
