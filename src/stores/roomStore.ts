import { create } from 'zustand';
import type { ClientPlayer, RoomSettings, RoomState } from '@/types/game.types';

interface RoomStoreState {
  room: RoomState | null;
  setRoom: (room: RoomState) => void;
  addPlayer: (player: ClientPlayer) => void;
  removePlayer: (playerId: string) => void;
  setPlayerReady: (playerId: string, ready: boolean) => void;
  updateSettings: (settings: RoomSettings) => void;
  setGameStarted: (started: boolean) => void;
  clearRoom: () => void;
}

export const useRoomStore = create<RoomStoreState>((set) => ({
  room: null,

  setRoom: (room) => set({ room }),

  addPlayer: (player) =>
    set((state) => {
      if (!state.room) return state;
      return {
        room: {
          ...state.room,
          players: [...state.room.players, player],
        },
      };
    }),

  removePlayer: (playerId) =>
    set((state) => {
      if (!state.room) return state;
      return {
        room: {
          ...state.room,
          players: state.room.players.filter((p) => p.id !== playerId),
        },
      };
    }),

  setPlayerReady: (playerId, ready) =>
    set((state) => {
      if (!state.room) return state;
      return {
        room: {
          ...state.room,
          players: state.room.players.map((p) =>
            p.id === playerId ? { ...p, isReady: ready } : p
          ),
        },
      };
    }),

  updateSettings: (settings) =>
    set((state) => {
      if (!state.room) return state;
      return { room: { ...state.room, settings } };
    }),

  setGameStarted: (started) =>
    set((state) => {
      if (!state.room) return state;
      return { room: { ...state.room, isGameStarted: started } };
    }),

  clearRoom: () => set({ room: null }),
}));
