'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';
import { usePlayerStore } from '@/stores/playerStore';
import { useRoomStore } from '@/stores/roomStore';
import { useGameSocket } from '@/hooks/useGameSocket';
import { useGameStore } from '@/stores/gameStore';
import type { BotDifficulty } from '@/types/game.types';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const socket = useSocket();
  const code = (params.code as string)?.toUpperCase();
  const { playerId } = usePlayerStore();
  const { room } = useRoomStore();
  const phase = useGameStore((s) => s.phase);

  useGameSocket();

  // Redirect to game page when game starts
  useEffect(() => {
    const handler = () => {
      router.push(`/room/${code}/game`);
    };
    socket.on('game:started', handler);
    return () => { socket.off('game:started', handler); };
  }, [socket, router, code]);

  // Redirect to home if no room
  useEffect(() => {
    if (!room && !playerId) {
      router.push('/');
    }
  }, [room, playerId, router]);

  if (!room) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <p className="text-text-muted">Chargement...</p>
      </div>
    );
  }

  const isHost = playerId === room.hostId;
  const players = room.players;
  const canStart = players.length >= 2 && players.filter((p) => !p.isBot).every((p) => p.isReady);

  const handleAddBot = (difficulty: BotDifficulty) => {
    socket.emit('room:addBot', { difficulty });
  };

  const handleRemoveBot = (botId: string) => {
    socket.emit('room:removeBot', { botId });
  };

  const handleToggleReady = () => {
    socket.emit('room:toggleReady');
  };

  const handleStartGame = () => {
    socket.emit('room:startGame');
  };

  const handleLeave = () => {
    socket.emit('room:leave');
    router.push('/');
  };

  const [copied, setCopied] = useState(false);
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement('input');
      input.value = code;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-black mb-2">
          <span className="text-accent-red">Pili</span>
          <span className="text-accent-orange">Pili</span>
        </h1>
        <div className="flex items-center gap-3 justify-center">
          <span className="text-text-secondary text-sm">Code de la room :</span>
          <button
            onClick={handleCopyCode}
            className="group relative font-mono text-2xl tracking-[0.3em] text-accent-gold font-bold bg-surface px-4 py-1 rounded-lg border border-border hover:border-accent-gold/60 transition-all cursor-pointer"
            title="Copier le code"
          >
            {code}
            <span className={`absolute -right-2 -top-2 text-xs px-1.5 py-0.5 rounded-md transition-all ${
              copied
                ? 'bg-accent-green text-background opacity-100 scale-100'
                : 'bg-surface-hover text-text-muted opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100'
            }`}>
              {copied ? 'Copi\u00e9 !' : 'Copier'}
            </span>
          </button>
        </div>
      </div>

      {/* Players List */}
      <div className="w-full max-w-lg bg-surface rounded-2xl border border-border p-6 shadow-2xl mb-6">
        <h2 className="text-lg font-bold mb-4 text-text-secondary">
          Joueurs ({players.length}/{room.settings.maxPlayers})
        </h2>

        <div className="space-y-3">
          {players.map((player) => (
            <div
              key={player.id}
              className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                player.isReady || player.isBot
                  ? 'border-accent-green/40 bg-accent-green/10'
                  : 'border-border bg-background'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    player.isConnected || player.isBot
                      ? 'bg-accent-green'
                      : 'bg-text-muted'
                  }`}
                />
                <span className="font-semibold">
                  {player.name}
                  {player.id === room.hostId && (
                    <span className="ml-2 text-xs text-accent-gold">(H&ocirc;te)</span>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {player.isBot ? (
                  <>
                    <span className="text-xs text-text-muted px-2 py-1 rounded-md bg-surface-hover">
                      Bot
                    </span>
                    {isHost && (
                      <button
                        onClick={() => handleRemoveBot(player.id)}
                        className="text-xs text-accent-red hover:text-accent-orange transition-colors px-2 py-1"
                      >
                        Retirer
                      </button>
                    )}
                  </>
                ) : (
                  <span
                    className={`text-xs px-2 py-1 rounded-md ${
                      player.isReady
                        ? 'bg-accent-green/20 text-accent-green'
                        : 'bg-surface-hover text-text-muted'
                    }`}
                  >
                    {player.isReady ? 'Pr\u00eat' : 'Pas pr\u00eat'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add Bot */}
        {isHost && players.length < room.settings.maxPlayers && (
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => handleAddBot('easy')}
              className="btn-secondary text-sm flex-1"
            >
              + Bot Facile
            </button>
            <button
              onClick={() => handleAddBot('medium')}
              className="btn-secondary text-sm flex-1"
            >
              + Bot Moyen
            </button>
            <button
              onClick={() => handleAddBot('hard')}
              className="btn-secondary text-sm flex-1"
            >
              + Bot Difficile
            </button>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="w-full max-w-lg space-y-3">
        {!isHost && (
          <button
            onClick={handleToggleReady}
            className={`w-full text-lg ${
              room.players.find((p) => p.id === playerId)?.isReady
                ? 'btn-secondary'
                : 'btn-primary'
            }`}
          >
            {room.players.find((p) => p.id === playerId)?.isReady
              ? 'Annuler Pr\u00eat'
              : 'Je suis pr\u00eat !'}
          </button>
        )}

        {isHost && (
          <>
            <button
              onClick={handleToggleReady}
              className={`w-full ${
                room.players.find((p) => p.id === playerId)?.isReady
                  ? 'btn-secondary'
                  : 'btn-primary'
              }`}
            >
              {room.players.find((p) => p.id === playerId)?.isReady
                ? 'Annuler Pr\u00eat'
                : 'Je suis pr\u00eat !'}
            </button>
            <button
              onClick={handleStartGame}
              disabled={!canStart}
              className="btn-primary w-full text-lg"
            >
              Lancer la partie
            </button>
          </>
        )}

        <button
          onClick={handleLeave}
          className="btn-secondary w-full text-sm opacity-70 hover:opacity-100"
        >
          Quitter la room
        </button>
      </div>
    </div>
  );
}
