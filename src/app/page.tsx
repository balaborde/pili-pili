'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';
import { usePlayerStore } from '@/stores/playerStore';
import { useRoomStore } from '@/stores/roomStore';

export default function HomePage() {
  const router = useRouter();
  const socket = useSocket();
  const { playerName, setPlayerName, setPlayer } = usePlayerStore();
  const { setRoom } = useRoomStore();

  const [name, setName] = useState(playerName || '');
  const [joinCode, setJoinCode] = useState('');
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = () => {
    if (!name.trim()) {
      setError('Entre ton nom !');
      return;
    }
    setLoading(true);
    setPlayerName(name.trim());

    socket.emit('room:create', { playerName: name.trim() });

    socket.once('room:created', ({ roomCode, playerId, sessionToken }) => {
      setPlayer(playerId, sessionToken, roomCode);
      setRoom({
        code: roomCode,
        hostId: playerId,
        players: [{
          id: playerId,
          name: name.trim(),
          isBot: false,
          isConnected: true,
          isReady: false,
          cardCount: 0,
          bet: null,
          tricksWon: 0,
          pilis: 0,
          seatIndex: 0,
        }],
        settings: {
          maxPlayers: 8,
          includeExpertMissions: false,
          turnTimerSeconds: 30,
          botDifficulty: 'medium',
          piliLimit: 6,
        },
        isGameStarted: false,
      });
      router.push(`/room/${roomCode}`);
    });

    socket.once('room:error', ({ message }) => {
      setError(message);
      setLoading(false);
    });
  };

  const handleJoin = () => {
    if (!name.trim()) {
      setError('Entre ton nom !');
      return;
    }
    if (!joinCode.trim()) {
      setError('Entre le code de la room !');
      return;
    }
    setLoading(true);
    setPlayerName(name.trim());

    socket.emit('room:join', { roomCode: joinCode.trim().toUpperCase(), playerName: name.trim() });

    socket.once('room:joined', ({ roomState, playerId, sessionToken }) => {
      setPlayer(playerId, sessionToken, roomState.code);
      setRoom(roomState);
      router.push(`/room/${roomState.code}`);
    });

    socket.once('room:error', ({ message }) => {
      setError(message);
      setLoading(false);
    });
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="mb-12 text-center">
        <h1 className="text-6xl font-black tracking-tight mb-2">
          <span className="text-[var(--accent-red)]">Pili</span>
          <span className="text-[var(--accent-orange)]">Pili</span>
        </h1>
        <p className="text-[var(--text-secondary)] text-lg">
          Le jeu de plis qui pique !
        </p>
        <div className="mt-4 text-4xl select-none">&#x1F336;&#xFE0F;</div>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-8 shadow-2xl">
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-[var(--accent-red)]/20 border border-[var(--accent-red)]/40 text-[var(--accent-red)] text-sm text-center">
            {error}
          </div>
        )}

        {/* Name input */}
        <div className="mb-6">
          <label className="block text-sm text-[var(--text-secondary)] mb-2">
            Ton pseudo
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            placeholder="Cayenne"
            maxLength={20}
            className="w-full px-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
          />
        </div>

        {mode === 'menu' && (
          <div className="space-y-3">
            <button
              onClick={() => setMode('create')}
              className="btn-primary w-full text-lg"
            >
              Cr&eacute;er une partie
            </button>
            <button
              onClick={() => setMode('join')}
              className="btn-secondary w-full text-lg"
            >
              Rejoindre une partie
            </button>
          </div>
        )}

        {mode === 'create' && (
          <div className="space-y-4">
            <button
              onClick={handleCreate}
              disabled={loading}
              className="btn-primary w-full text-lg"
            >
              {loading ? 'Cr\u00e9ation...' : 'Lancer la room'}
            </button>
            <button
              onClick={() => { setMode('menu'); setError(''); }}
              className="btn-secondary w-full"
            >
              Retour
            </button>
          </div>
        )}

        {mode === 'join' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-2">
                Code de la room
              </label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => {
                  setJoinCode(e.target.value.toUpperCase());
                  setError('');
                }}
                placeholder="ABCDE"
                maxLength={5}
                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-gold)] transition-colors text-center text-2xl tracking-[0.3em] font-mono uppercase"
              />
            </div>
            <button
              onClick={handleJoin}
              disabled={loading}
              className="btn-primary w-full text-lg"
            >
              {loading ? 'Connexion...' : 'Rejoindre'}
            </button>
            <button
              onClick={() => { setMode('menu'); setError(''); }}
              className="btn-secondary w-full"
            >
              Retour
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <p className="mt-8 text-[var(--text-muted)] text-sm">
        2-8 joueurs &middot; Plis, paris et missions
      </p>
    </div>
  );
}
