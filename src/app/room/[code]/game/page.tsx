'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameSocket } from '@/hooks/useGameSocket';
import { useGameStore } from '@/stores/gameStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useSocket } from '@/hooks/useSocket';
import { GameBoard } from '@/components/game/GameBoard';

export default function GamePage() {
  const router = useRouter();
  const socket = useSocket();
  const { playerId, sessionToken, roomCode } = usePlayerStore();
  const phase = useGameStore((s) => s.phase);

  useGameSocket();

  // Try reconnection if we have a session
  useEffect(() => {
    if (sessionToken && roomCode && !phase) {
      socket.emit('player:reconnect', { sessionToken, roomCode });
    }
  }, [socket, sessionToken, roomCode, phase]);

  // Redirect if no game state
  useEffect(() => {
    if (!playerId && !sessionToken) {
      router.push('/');
    }
  }, [playerId, sessionToken, router]);

  if (!phase) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">&#x1F336;&#xFE0F;</div>
          <p className="text-text-muted">Connexion en cours...</p>
        </div>
      </div>
    );
  }

  return <GameBoard />;
}
