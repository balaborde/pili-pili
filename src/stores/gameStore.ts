import { create } from 'zustand';
import type {
  Card,
  ClientGameState,
  ClientPlayer,
  GamePhase,
  MissionCardDef,
  PlayedCard,
  PlayerScore,
  RoundScoringData,
  Trick,
} from '@/types/game.types';

interface GameStoreState {
  // Core state
  phase: GamePhase | null;
  players: ClientPlayer[];
  myPlayerId: string | null;
  myHand: Card[];
  currentRound: number;
  currentTrick: Trick | null;
  previousTricks: Trick[];
  currentMission: MissionCardDef | null;
  currentPlayerIndex: number;
  dealerIndex: number;
  totalTricksThisRound: number;
  missionState: Record<string, unknown>;

  // UI state
  selectedCardId: string | null;
  roundScoring: RoundScoringData | null;
  finalStandings: PlayerScore[] | null;
  eliminatedId: string | null;
  isPeeking: boolean;
  peekDurationMs: number;
  error: string | null;

  // Mission-specific state
  visibleOpponentHands: Map<string, Card[]>;
  designateRequired: boolean;
  exchangeRequired: { winnerId: string } | null;
  exchangeAsTarget: { winnerId: string } | null;

  // Actions
  syncState: (state: ClientGameState) => void;
  setPhase: (phase: GamePhase) => void;
  setMission: (mission: MissionCardDef) => void;
  setHand: (hand: Card[]) => void;
  addCardPlayed: (playerId: string, play: PlayedCard) => void;
  setBetPlaced: (playerId: string, bet: number) => void;
  setTrickWon: (winnerId: string, trick: Trick) => void;
  setTurnChanged: (currentPlayerIndex: number) => void;
  setRoundScoring: (data: RoundScoringData) => void;
  setRoundEnd: (scores: PlayerScore[]) => void;
  setGameOver: (standings: PlayerScore[], eliminatedId: string) => void;
  setSelectedCard: (cardId: string | null) => void;
  setPeeking: (isPeeking: boolean, durationMs?: number) => void;
  setError: (error: string | null) => void;
  setVisibleOpponentHands: (hands: { playerId: string; cards: Card[] }[]) => void;
  setDesignateRequired: (required: boolean) => void;
  setExchangeRequired: (data: { winnerId: string } | null) => void;
  setExchangeAsTarget: (data: { winnerId: string } | null) => void;
  updatePlayerConnection: (playerId: string, connected: boolean) => void;
  reset: () => void;
}

export const useGameStore = create<GameStoreState>((set) => ({
  phase: null,
  players: [],
  myPlayerId: null,
  myHand: [],
  currentRound: 0,
  currentTrick: null,
  previousTricks: [],
  currentMission: null,
  currentPlayerIndex: 0,
  dealerIndex: 0,
  totalTricksThisRound: 0,
  missionState: {},
  selectedCardId: null,
  roundScoring: null,
  finalStandings: null,
  eliminatedId: null,
  isPeeking: false,
  peekDurationMs: 0,
  error: null,
  visibleOpponentHands: new Map(),
  designateRequired: false,
  exchangeRequired: null,
  exchangeAsTarget: null,

  syncState: (state) =>
    set({
      phase: state.phase,
      players: state.players,
      myPlayerId: state.myPlayerId,
      myHand: state.myHand,
      currentRound: state.currentRound,
      currentTrick: state.currentTrick,
      previousTricks: state.previousTricks,
      currentMission: state.currentMission,
      currentPlayerIndex: state.currentPlayerIndex,
      dealerIndex: state.dealerIndex,
      totalTricksThisRound: state.totalTricksThisRound,
      missionState: state.missionState,
      designateRequired: false,
      exchangeRequired: null,
      exchangeAsTarget: null,
    }),

  setPhase: (phase) =>
    set((state) => ({
      phase,
      designateRequired: false,
      exchangeRequired: null,
      exchangeAsTarget: null,
      // Reset per-round state when a new round begins
      ...(phase === ('ROUND_START' as GamePhase) && {
        players: state.players.map((p) => ({ ...p, tricksWon: 0, bet: null })),
        previousTricks: [],
        currentTrick: null,
        roundScoring: null,
      }),
    })),

  setMission: (mission) => set({ currentMission: mission }),

  setHand: (hand) => set({ myHand: hand }),

  addCardPlayed: (playerId, play) =>
    set((state) => {
      const trick = state.currentTrick
        ? { ...state.currentTrick, plays: [...state.currentTrick.plays, play] }
        : { plays: [play], winnerId: null, trickNumber: 1 };
      return {
        currentTrick: trick,
        myHand: playerId === state.myPlayerId
          ? state.myHand.filter((c) => c.id !== play.card.id)
          : state.myHand,
        players: state.players.map((p) =>
          p.id === playerId ? { ...p, cardCount: p.cardCount - 1 } : p
        ),
      };
    }),

  setBetPlaced: (playerId, bet) =>
    set((state) => ({
      players: state.players.map((p) =>
        p.id === playerId ? { ...p, bet } : p
      ),
    })),

  setTrickWon: (winnerId, trick) =>
    set((state) => ({
      currentTrick: { plays: [], winnerId: null, trickNumber: trick.trickNumber + 1 },
      previousTricks: [...state.previousTricks, trick],
      players: state.players.map((p) =>
        p.id === winnerId ? { ...p, tricksWon: p.tricksWon + 1 } : p
      ),
      exchangeRequired: null,
      exchangeAsTarget: null,
    })),

  setTurnChanged: (currentPlayerIndex) => set({ currentPlayerIndex }),

  setRoundScoring: (data) => set({ roundScoring: data }),

  setRoundEnd: (scores) =>
    set((state) => ({
      players: state.players.map((p) => {
        const score = scores.find((s) => s.playerId === p.id);
        return score ? { ...p, pilis: score.pilis } : p;
      }),
    })),

  setGameOver: (standings, eliminatedId) =>
    set({ finalStandings: standings, eliminatedId }),

  setSelectedCard: (cardId) => set({ selectedCardId: cardId }),

  setPeeking: (isPeeking, durationMs) =>
    set({ isPeeking, peekDurationMs: durationMs ?? 0 }),

  setError: (error) => set({ error }),

  setVisibleOpponentHands: (hands) =>
    set((state) => {
      const handsMap = new Map(hands.map((h) => [h.playerId, h.cards]));
      return {
        visibleOpponentHands: handsMap,
        players: state.players.map((p) => {
          const visible = handsMap.get(p.id);
          return visible ? { ...p, visibleHand: visible } : p;
        }),
      };
    }),

  setDesignateRequired: (required) => set({ designateRequired: required }),

  setExchangeRequired: (data) => set({ exchangeRequired: data }),

  setExchangeAsTarget: (data) => set({ exchangeAsTarget: data }),

  updatePlayerConnection: (playerId, connected) =>
    set((state) => ({
      players: state.players.map((p) =>
        p.id === playerId ? { ...p, isConnected: connected } : p
      ),
    })),

  reset: () =>
    set({
      phase: null,
      players: [],
      myPlayerId: null,
      myHand: [],
      currentRound: 0,
      currentTrick: null,
      previousTricks: [],
      currentMission: null,
      currentPlayerIndex: 0,
      dealerIndex: 0,
      totalTricksThisRound: 0,
      missionState: {},
      selectedCardId: null,
      roundScoring: null,
      finalStandings: null,
      eliminatedId: null,
      isPeeking: false,
      peekDurationMs: 0,
      error: null,
      visibleOpponentHands: new Map(),
      designateRequired: false,
      exchangeRequired: null,
      exchangeAsTarget: null,
    }),
}));
