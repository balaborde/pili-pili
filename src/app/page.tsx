'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '@/hooks/useSocket';
import { usePlayerStore } from '@/stores/playerStore';
import { useRoomStore } from '@/stores/roomStore';

/* ── Floating decorative peppers ── */
const PEPPERS = [
  { x: '8%', y: '12%', size: 28, rotate: -25, delay: 0, duration: 6 },
  { x: '85%', y: '8%', size: 22, rotate: 30, delay: 1.2, duration: 7 },
  { x: '92%', y: '65%', size: 18, rotate: -45, delay: 0.6, duration: 5.5 },
  { x: '5%', y: '75%', size: 24, rotate: 15, delay: 1.8, duration: 6.5 },
  { x: '75%', y: '85%', size: 16, rotate: -60, delay: 0.3, duration: 7.5 },
  { x: '20%', y: '90%', size: 20, rotate: 40, delay: 2.1, duration: 5 },
  { x: '50%', y: '5%', size: 14, rotate: -10, delay: 1.5, duration: 8 },
];

function FloatingPepper({ x, y, size, rotate, delay, duration }: typeof PEPPERS[number]) {
  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{ left: x, top: y, fontSize: size }}
      initial={{ opacity: 0, scale: 0, rotate: rotate - 20 }}
      animate={{
        opacity: [0, 0.35, 0.25, 0.35],
        scale: 1,
        rotate: [rotate - 10, rotate + 10, rotate - 10],
        y: [0, -12, 0, 8, 0],
      }}
      transition={{
        opacity: { delay, duration: 2, times: [0, 0.3, 0.6, 1] },
        scale: { delay, duration: 0.8, type: 'spring' },
        rotate: { delay: delay + 0.8, duration, repeat: Infinity, ease: 'easeInOut' },
        y: { delay: delay + 0.8, duration: duration * 0.8, repeat: Infinity, ease: 'easeInOut' },
      }}
    >
      🌶️
    </motion.div>
  );
}

/* ── Warm ember particles ── */
function Ember({ index }: { index: number }) {
  const left = 15 + (index * 37) % 70;
  const delay = index * 0.7;
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: `${left}%`,
        bottom: '10%',
        width: 3 + (index % 3),
        height: 3 + (index % 3),
        background: `radial-gradient(circle, ${index % 2 === 0 ? '#f4845f' : '#f4a261'}, transparent)`,
      }}
      initial={{ opacity: 0, y: 0 }}
      animate={{
        opacity: [0, 0.8, 0.6, 0],
        y: [-20, -80 - index * 15, -140 - index * 20],
        x: [0, (index % 2 === 0 ? 1 : -1) * (10 + index * 3), (index % 2 === 0 ? -1 : 1) * 5],
      }}
      transition={{
        duration: 4 + index * 0.5,
        delay,
        repeat: Infinity,
        ease: 'easeOut',
      }}
    />
  );
}

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
    <main className="min-h-dvh relative overflow-hidden flex flex-col items-center justify-center px-5 py-10">
      {/* ── Layered background ── */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 50% 40%, rgba(230,57,70,0.12) 0%, transparent 70%),
            radial-gradient(ellipse 40% 35% at 30% 60%, rgba(244,132,95,0.08) 0%, transparent 60%),
            radial-gradient(ellipse 45% 40% at 70% 30%, rgba(244,162,97,0.06) 0%, transparent 60%),
            var(--bg-primary)
          `,
        }}
      />

      {/* Subtle diamond pattern overlay */}
      <div
        className="fixed inset-0 -z-10 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(45deg, var(--accent-gold) 25%, transparent 25%),
            linear-gradient(-45deg, var(--accent-gold) 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, var(--accent-gold) 75%),
            linear-gradient(-45deg, transparent 75%, var(--accent-gold) 75%)
          `,
          backgroundSize: '30px 30px',
          backgroundPosition: '0 0, 0 15px, 15px -15px, -15px 0px',
        }}
      />

      {/* Floating peppers */}
      {PEPPERS.map((p, i) => (
        <FloatingPepper key={i} {...p} />
      ))}

      {/* Ember particles */}
      {Array.from({ length: 5 }).map((_, i) => (
        <Ember key={i} index={i} />
      ))}

      {/* ── Logo Section ── */}
      <motion.div
        className="mb-10 text-center relative"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Warm glow behind logo */}
        <div
          className="absolute -inset-16 -z-10 blur-3xl opacity-30 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(244,132,95,0.5), transparent 70%)' }}
        />

        <motion.h1
          className="text-7xl sm:text-8xl font-black tracking-tight leading-none"
          style={{ textShadow: '0 4px 30px rgba(230,57,70,0.3), 0 2px 8px rgba(0,0,0,0.5)' }}
        >
          <motion.span
            className="inline-block text-accent-red"
            initial={{ opacity: 0, x: -20, rotate: -5 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            transition={{ delay: 0.2, duration: 0.6, type: 'spring', stiffness: 120 }}
          >
            Pili
          </motion.span>
          <motion.span
            className="inline-block text-accent-orange"
            initial={{ opacity: 0, x: 20, rotate: 5 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            transition={{ delay: 0.35, duration: 0.6, type: 'spring', stiffness: 120 }}
          >
            Pili
          </motion.span>
        </motion.h1>

        <motion.p
          className="text-text-secondary text-lg mt-3 font-medium tracking-wide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          Le jeu de plis qui pique&thinsp;!
        </motion.p>

        {/* Animated chili under title */}
        <motion.div
          className="mt-4 text-5xl select-none"
          initial={{ opacity: 0, scale: 0, rotate: -180 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.8, duration: 0.7, type: 'spring', stiffness: 200, damping: 15 }}
          whileHover={{ scale: 1.3, rotate: 15 }}
        >
          🌶️
        </motion.div>
      </motion.div>

      {/* ── Main Panel ── */}
      <motion.div
        className="w-full max-w-sm relative"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Panel glow */}
        <div
          className="absolute -inset-px rounded-2xl -z-10 opacity-40 blur-sm"
          style={{ background: 'var(--accent-red)' }}
        />

        <div
          className="rounded-2xl p-6 sm:p-7 relative overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, rgba(61,31,31,0.95), rgba(45,21,21,0.98))',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
            border: '1px solid rgba(92,51,51,0.6)',
          }}
        >
          {/* Inner texture */}
          <div
            className="absolute inset-0 opacity-[0.02] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 30%, rgba(244,162,97,1) 1px, transparent 1px),
                radial-gradient(circle at 80% 70%, rgba(244,162,97,1) 1px, transparent 1px)`,
              backgroundSize: '24px 24px',
            }}
          />

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="overflow-hidden"
              >
                <div
                  className="p-3 rounded-xl text-sm text-center font-medium"
                  style={{
                    background: 'rgba(230,57,70,0.15)',
                    border: '1px solid rgba(230,57,70,0.3)',
                    color: '#ff6b6b',
                  }}
                >
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Name input */}
          <div className="mb-5 relative">
            <label htmlFor="player-name" className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
              Ton pseudo
            </label>
            <div className="relative group">
              <input
                id="player-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                placeholder="Cayenne"
                maxLength={20}
                className="w-full px-4 py-3 rounded-xl bg-(--bg-primary)/80 border-2 border-(--border)/60 text-foreground placeholder:text-(--text-muted)/60 focus:outline-none focus:border-accent-gold/70 transition-all duration-300 text-base font-medium"
                style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)' }}
              />
              {/* Focus glow */}
              <div className="absolute -inset-px rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 -z-10 blur-sm bg-accent-gold/20" />
            </div>
          </div>

          {/* Mode content */}
          <AnimatePresence mode="wait">
            {mode === 'menu' && (
              <motion.div
                key="menu"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-3"
              >
                <motion.button
                  onClick={() => setMode('create')}
                  className="btn-primary w-full text-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Créer une partie
                </motion.button>
                <motion.button
                  onClick={() => setMode('join')}
                  className="btn-secondary w-full text-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Rejoindre une partie
                </motion.button>
              </motion.div>
            )}

            {mode === 'create' && (
              <motion.div
                key="create"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-3"
              >
                <motion.button
                  onClick={handleCreate}
                  disabled={loading}
                  className="btn-primary w-full text-lg"
                  whileHover={!loading ? { scale: 1.02 } : undefined}
                  whileTap={!loading ? { scale: 0.97 } : undefined}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.span
                        className="inline-block"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        🌶️
                      </motion.span>
                      Création...
                    </span>
                  ) : (
                    'Lancer la room'
                  )}
                </motion.button>
                <motion.button
                  onClick={() => { setMode('menu'); setError(''); }}
                  className="btn-secondary w-full"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Retour
                </motion.button>
              </motion.div>
            )}

            {mode === 'join' && (
              <motion.div
                key="join"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-3"
              >
                <div className="relative">
                  <label htmlFor="join-code" className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
                    Code de la room
                  </label>
                  <div className="relative group">
                    <input
                      id="join-code"
                      type="text"
                      value={joinCode}
                      onChange={(e) => {
                        setJoinCode(e.target.value.toUpperCase());
                        setError('');
                      }}
                      placeholder="ABCDE"
                      maxLength={5}
                      className="w-full px-4 py-3.5 rounded-xl bg-(--bg-primary)/80 border-2 border-(--border)/60 text-foreground placeholder:text-(--text-muted)/40 focus:outline-none focus:border-accent-gold/70 transition-all duration-300 text-center text-2xl tracking-[0.35em] font-bold uppercase"
                      style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)', fontVariantNumeric: 'tabular-nums' }}
                    />
                    <div className="absolute -inset-px rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 -z-10 blur-sm bg-accent-gold/20" />
                  </div>
                </div>
                <motion.button
                  onClick={handleJoin}
                  disabled={loading}
                  className="btn-primary w-full text-lg"
                  whileHover={!loading ? { scale: 1.02 } : undefined}
                  whileTap={!loading ? { scale: 0.97 } : undefined}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.span
                        className="inline-block"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        🌶️
                      </motion.span>
                      Connexion...
                    </span>
                  ) : (
                    'Rejoindre'
                  )}
                </motion.button>
                <motion.button
                  onClick={() => { setMode('menu'); setError(''); }}
                  className="btn-secondary w-full"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Retour
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── Footer ── */}
      <motion.p
        className="mt-8 text-text-secondary text-sm font-medium tracking-wide"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
      >
        2–8 joueurs · Plis, paris &amp; missions
      </motion.p>
    </main>
  );
}
