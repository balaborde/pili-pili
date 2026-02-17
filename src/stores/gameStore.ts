import { create } from 'zustand';
import type {
  ClientGameState,
  PlayerRoundResult,
  TrickCard,
} from '@/types/game.types';

interface GameStoreState {
  gameState: ClientGameState | null;

  // Local UI state
  selectedCardId: number | null;
  showRoundResults: boolean;
  showGameOver: boolean;
  showMissionInfo: boolean;

  // Last trick result (for animation)
  lastTrickResult: {
    winnerId: string;
    winnerName: string;
    trick: TrickCard[];
  } | null;

  // Actions
  setGameState: (state: ClientGameState) => void;
  clearGameState: () => void;
  selectCard: (cardId: number | null) => void;
  setShowRoundResults: (show: boolean) => void;
  setShowGameOver: (show: boolean) => void;
  setShowMissionInfo: (show: boolean) => void;
  setLastTrickResult: (result: { winnerId: string; winnerName: string; trick: TrickCard[] } | null) => void;
}

export const useGameStore = create<GameStoreState>((set) => ({
  gameState: null,
  selectedCardId: null,
  showRoundResults: false,
  showGameOver: false,
  showMissionInfo: false,
  lastTrickResult: null,

  setGameState: (gameState) => set({ gameState }),
  clearGameState: () => set({
    gameState: null,
    selectedCardId: null,
    showRoundResults: false,
    showGameOver: false,
    lastTrickResult: null,
  }),
  selectCard: (cardId) => set({ selectedCardId: cardId }),
  setShowRoundResults: (show) => set({ showRoundResults: show }),
  setShowGameOver: (show) => set({ showGameOver: show }),
  setShowMissionInfo: (show) => set({ showMissionInfo: show }),
  setLastTrickResult: (result) => set({ lastTrickResult: result }),
}));
