'use client';

import { useEffect } from 'react';
import { useSocket } from './useSocket';
import { useGameStore } from '@/stores/gameStore';
import { useRoomStore } from '@/stores/roomStore';
import type { ClientGameState, GamePhase, TrickCard, PlayerRoundResult } from '@/types/game.types';

export function useGameSocket(): void {
  const socket = useSocket();
  const setGameState = useGameStore((s) => s.setGameState);
  const setShowRoundResults = useGameStore((s) => s.setShowRoundResults);
  const setShowGameOver = useGameStore((s) => s.setShowGameOver);
  const setLastTrickResult = useGameStore((s) => s.setLastTrickResult);
  const setGameStarted = useRoomStore((s) => s.setGameStarted);

  useEffect(() => {
    const onGameStarted = () => {
      setGameStarted(true);
    };

    const onStateUpdate = ({ gameState }: { gameState: ClientGameState }) => {
      setGameState(gameState);
    };

    const onPhaseChange = ({ phase, gameState }: { phase: GamePhase; gameState: ClientGameState }) => {
      setGameState(gameState);
    };

    const onTrickResult = ({ winnerId, winnerName, trick }: { winnerId: string; winnerName: string; trick: TrickCard[] }) => {
      setLastTrickResult({ winnerId, winnerName, trick });
      setTimeout(() => setLastTrickResult(null), 2500);
    };

    const onRoundResults = ({ results }: { results: PlayerRoundResult[] }) => {
      setShowRoundResults(true);
    };

    const onGameOver = ({ standings, winnerId }: { standings: PlayerRoundResult[]; winnerId: string }) => {
      setShowGameOver(true);
    };

    socket.on('room:gameStarted', onGameStarted);
    socket.on('game:stateUpdate', onStateUpdate);
    socket.on('game:phaseChange', onPhaseChange);
    socket.on('game:trickResult', onTrickResult);
    socket.on('game:roundResults', onRoundResults);
    socket.on('game:gameOver', onGameOver);

    return () => {
      socket.off('room:gameStarted', onGameStarted);
      socket.off('game:stateUpdate', onStateUpdate);
      socket.off('game:phaseChange', onPhaseChange);
      socket.off('game:trickResult', onTrickResult);
      socket.off('game:roundResults', onRoundResults);
      socket.off('game:gameOver', onGameOver);
    };
  }, [socket, setGameState, setShowRoundResults, setShowGameOver, setLastTrickResult, setGameStarted]);
}
