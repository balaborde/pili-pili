import { GamePhase } from '../../src/types/game.types';

const TRANSITIONS: Record<GamePhase, GamePhase[]> = {
  [GamePhase.LOBBY]: [GamePhase.ROUND_START],
  [GamePhase.ROUND_START]: [GamePhase.MISSION_REVEAL],
  [GamePhase.MISSION_REVEAL]: [GamePhase.DEALING],
  [GamePhase.DEALING]: [GamePhase.PRE_BET_MISSION, GamePhase.BETTING],
  [GamePhase.PRE_BET_MISSION]: [GamePhase.BETTING],
  [GamePhase.BETTING]: [GamePhase.POST_BET_MISSION, GamePhase.TRICK_PLAY],
  [GamePhase.POST_BET_MISSION]: [GamePhase.TRICK_PLAY],
  [GamePhase.TRICK_PLAY]: [GamePhase.TRICK_RESOLUTION],
  [GamePhase.TRICK_RESOLUTION]: [GamePhase.TRICK_PLAY, GamePhase.ROUND_SCORING],
  [GamePhase.ROUND_SCORING]: [GamePhase.ROUND_END],
  [GamePhase.ROUND_END]: [GamePhase.ROUND_START, GamePhase.GAME_OVER],
  [GamePhase.GAME_OVER]: [GamePhase.LOBBY],
};

export class StateMachine {
  private _phase: GamePhase = GamePhase.LOBBY;

  get phase(): GamePhase {
    return this._phase;
  }

  canTransition(to: GamePhase): boolean {
    return TRANSITIONS[this._phase]?.includes(to) ?? false;
  }

  transition(to: GamePhase): void {
    if (!this.canTransition(to)) {
      throw new Error(
        `Invalid transition: ${this._phase} → ${to}. Allowed: ${TRANSITIONS[this._phase]?.join(', ')}`
      );
    }
    this._phase = to;
  }

  reset(): void {
    this._phase = GamePhase.LOBBY;
  }
}
