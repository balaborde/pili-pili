import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PlayerState {
  playerId: string | null;
  playerName: string;
  sessionToken: string | null;
  roomCode: string | null;
  setPlayer: (playerId: string, sessionToken: string, roomCode: string) => void;
  setPlayerName: (name: string) => void;
  clearSession: () => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set) => ({
      playerId: null,
      playerName: '',
      sessionToken: null,
      roomCode: null,
      setPlayer: (playerId, sessionToken, roomCode) =>
        set({ playerId, sessionToken, roomCode }),
      setPlayerName: (name) => set({ playerName: name }),
      clearSession: () =>
        set({ playerId: null, sessionToken: null, roomCode: null }),
    }),
    {
      name: 'pilipili-player',
    }
  )
);
