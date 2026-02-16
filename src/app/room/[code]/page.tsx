'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '@/hooks/useSocket';
import { usePlayerStore } from '@/stores/playerStore';
import { useRoomStore } from '@/stores/roomStore';
import type { BotDifficulty, RoomSettings } from '@/types/game.types';

/* ── Avatar colors per seat ── */
const SEAT_COLORS = [
  { bg: 'rgba(230,57,70,0.2)', border: '#e63946', text: '#e63946' },
  { bg: 'rgba(244,162,97,0.2)', border: '#f4a261', text: '#f4a261' },
  { bg: 'rgba(88,129,87,0.2)', border: '#588157', text: '#588157' },
  { bg: 'rgba(244,132,95,0.2)', border: '#f4845f', text: '#f4845f' },
  { bg: 'rgba(193,18,31,0.2)', border: '#c1121f', text: '#c1121f' },
  { bg: 'rgba(212,163,115,0.2)', border: '#d4a373', text: '#d4a373' },
  { bg: 'rgba(230,57,70,0.15)', border: '#ff6b6b', text: '#ff6b6b' },
  { bg: 'rgba(244,162,97,0.15)', border: '#ffb380', text: '#ffb380' },
];

const BOT_LABELS: Record<BotDifficulty, { label: string; emoji: string }> = {
  easy: { label: 'Facile', emoji: '🌱' },
  medium: { label: 'Moyen', emoji: '🔥' },
  hard: { label: 'Expert', emoji: '💀' },
};

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const socket = useSocket();
  const code = (params.code as string)?.toUpperCase();
  const { playerId } = usePlayerStore();
  const { room } = useRoomStore();

  const [showSettings, setShowSettings] = useState(false);
  const [copied, setCopied] = useState(false);

  // Redirect to home if no room
  useEffect(() => {
    if (!room && !playerId) {
      router.push('/');
    }
  }, [room, playerId, router]);

  if (!room) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.span
            className="text-4xl"
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            🌶️
          </motion.span>
          <p className="text-text-muted font-medium">Chargement...</p>
        </motion.div>
      </div>
    );
  }

  const isHost = playerId === room.hostId;
  const players = room.players;
  const canStart = players.length >= 2 && players.filter((p) => !p.isBot).every((p) => p.isReady);
  const meReady = room.players.find((p) => p.id === playerId)?.isReady;

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

  const handleUpdateSettings = (partial: Partial<RoomSettings>) => {
    socket.emit('room:updateSettings', partial);
  };
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
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
    <div className="min-h-dvh relative overflow-hidden flex flex-col items-center px-5 py-8">
      {/* ── Background ── */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 50% 30%, rgba(230,57,70,0.1) 0%, transparent 70%),
            radial-gradient(ellipse 40% 40% at 70% 60%, rgba(244,132,95,0.06) 0%, transparent 60%),
            var(--bg-primary)
          `,
        }}
      />
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

      {/* ── Header ── */}
      <motion.div
        className="mb-6 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1
          className="text-4xl sm:text-5xl font-black tracking-tight leading-none mb-3"
          style={{ textShadow: '0 3px 20px rgba(230,57,70,0.25)' }}
        >
          <span className="text-accent-red">Pili</span>
          <span className="text-accent-orange">Pili</span>
        </h1>

        {/* Room code */}
        <motion.button
          onClick={handleCopyCode}
          className="group relative inline-flex items-center gap-2 cursor-pointer"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <span className="text-xs text-text-muted font-medium uppercase tracking-wider">Room</span>
          <span
            className="font-bold text-3xl tracking-[0.3em] text-accent-gold px-4 py-1.5 rounded-xl relative"
            style={{
              background: 'rgba(244,162,97,0.08)',
              border: '2px solid rgba(244,162,97,0.25)',
              textShadow: '0 0 20px rgba(244,162,97,0.3)',
            }}
          >
            {code.split('').map((char, i) => (
              <motion.span
                key={i}
                className="inline-block"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08, type: 'spring', stiffness: 200 }}
              >
                {char}
              </motion.span>
            ))}
          </span>
          <AnimatePresence mode="wait">
            <motion.span
              key={copied ? 'copied' : 'copy'}
              initial={{ opacity: 0, scale: 0.8, y: -2 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                copied
                  ? 'bg-accent-green/20 text-accent-green'
                  : 'bg-surface-hover/60 text-text-muted opacity-0 group-hover:opacity-100'
              }`}
              style={{ transition: 'opacity 0.2s' }}
            >
              {copied ? 'Copié !' : 'Copier'}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </motion.div>

      {/* ── Players Panel ── */}
      <motion.div
        className="w-full max-w-md relative mb-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Panel glow */}
        <div
          className="absolute -inset-px rounded-2xl -z-10 opacity-30 blur-sm"
          style={{ background: 'linear-gradient(135deg, var(--accent-red), var(--accent-orange))' }}
        />

        <div
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, rgba(61,31,31,0.95), rgba(45,21,21,0.98))',
            boxShadow: '0 16px 50px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
            border: '1px solid rgba(92,51,51,0.5)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider">
              Joueurs
            </h2>
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-lg"
              style={{
                background: 'rgba(244,162,97,0.1)',
                color: 'var(--accent-gold)',
                border: '1px solid rgba(244,162,97,0.2)',
              }}
            >
              {players.length}/{room.settings.maxPlayers}
            </span>
          </div>

          {/* Player list */}
          <div className="space-y-2">
            <AnimatePresence>
              {players.map((player, index) => {
                const color = SEAT_COLORS[index % SEAT_COLORS.length];
                const isMe = player.id === playerId;
                const isReady = player.isReady || player.isBot;

                return (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, x: -20, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="overflow-hidden"
                  >
                    <div
                      className="flex items-center justify-between p-3 rounded-xl transition-all duration-300"
                      style={{
                        background: isReady
                          ? 'rgba(88,129,87,0.08)'
                          : 'rgba(26,10,10,0.4)',
                        border: `1px solid ${isReady ? 'rgba(88,129,87,0.25)' : 'rgba(92,51,51,0.3)'}`,
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Avatar */}
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black shrink-0"
                          style={{
                            background: color.bg,
                            border: `2px solid ${color.border}`,
                            color: color.text,
                          }}
                        >
                          {player.isBot ? '🤖' : player.name.charAt(0).toUpperCase()}
                        </div>

                        {/* Name */}
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className={`font-bold text-sm truncate ${isMe ? 'text-accent-gold' : 'text-foreground'}`}>
                              {player.name}
                            </span>
                            {player.id === room.hostId && (
                              <span
                                className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md shrink-0"
                                style={{
                                  background: 'rgba(244,162,97,0.15)',
                                  color: 'var(--accent-gold)',
                                  border: '1px solid rgba(244,162,97,0.2)',
                                }}
                              >
                                Hôte
                              </span>
                            )}
                            {isMe && (
                              <span className="text-[9px] text-text-muted font-medium shrink-0">(toi)</span>
                            )}
                          </div>
                          {player.isBot && (
                            <span className="text-[10px] text-text-muted">
                              Bot {player.name.includes('Facile') ? '🌱' : player.name.includes('Difficile') ? '💀' : '🔥'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Status / actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {player.isBot ? (
                          isHost && (
                            <motion.button
                              onClick={() => handleRemoveBot(player.id)}
                              className="text-xs text-text-muted hover:text-accent-red transition-colors px-2 py-1 rounded-lg hover:bg-accent-red/10"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Retirer
                            </motion.button>
                          )
                        ) : (
                          <span
                            className="text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all duration-300"
                            style={{
                              background: player.isReady ? 'rgba(88,129,87,0.2)' : 'rgba(139,111,95,0.1)',
                              color: player.isReady ? 'var(--accent-green)' : 'var(--text-muted)',
                              border: `1px solid ${player.isReady ? 'rgba(88,129,87,0.3)' : 'transparent'}`,
                            }}
                          >
                            {player.isReady ? 'Prêt ✓' : 'En attente...'}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Empty seats indicator */}
          {players.length < room.settings.maxPlayers && (
            <div className="mt-2 flex gap-1.5 justify-center">
              {Array.from({ length: room.settings.maxPlayers - players.length }).map((_, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full border border-dashed opacity-20"
                  style={{ borderColor: 'var(--border)' }}
                />
              ))}
            </div>
          )}

          {/* Add Bot section */}
          {isHost && players.length < room.settings.maxPlayers && (
            <motion.div
              className="mt-4 pt-4"
              style={{ borderTop: '1px solid rgba(92,51,51,0.4)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-[10px] text-text-muted font-medium uppercase tracking-wider mb-2 text-center">
                Ajouter un bot
              </p>
              <div className="flex gap-2">
                {(['easy', 'medium', 'hard'] as BotDifficulty[]).map((diff) => (
                  <motion.button
                    key={diff}
                    onClick={() => handleAddBot(diff)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all"
                    style={{
                      background: 'rgba(26,10,10,0.5)',
                      border: '1px solid rgba(92,51,51,0.4)',
                      color: 'var(--text-secondary)',
                    }}
                    whileHover={{
                      scale: 1.03,
                      borderColor: 'rgba(244,162,97,0.4)',
                      background: 'rgba(244,162,97,0.08)',
                    }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <span>{BOT_LABELS[diff].emoji}</span>
                    <span>{BOT_LABELS[diff].label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* ── Settings Panel ── */}
      <motion.div
        className="w-full max-w-md mb-5"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
      >
        <motion.button
          onClick={() => setShowSettings((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors"
          style={{
            background: 'rgba(61,31,31,0.6)',
            border: '1px solid rgba(92,51,51,0.4)',
            color: 'var(--text-secondary)',
          }}
          whileHover={{ borderColor: 'rgba(244,162,97,0.3)' }}
          whileTap={{ scale: 0.99 }}
        >
          <span>Paramètres de la partie</span>
          <motion.span
            animate={{ rotate: showSettings ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-text-muted"
          >
            ▾
          </motion.span>
        </motion.button>

        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div
                className="mt-1 rounded-xl p-4 space-y-4"
                style={{
                  background: 'rgba(45,21,21,0.8)',
                  border: '1px solid rgba(92,51,51,0.4)',
                }}
              >
                {/* Pili Limit */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-foreground">Limite de pilis 🌶️</p>
                    <p className="text-[10px] text-text-muted">Pilis avant élimination</p>
                  </div>
                  {isHost ? (
                    <div className="flex items-center gap-1.5">
                      {[4, 5, 6, 7, 8].map((n) => (
                        <motion.button
                          key={n}
                          onClick={() => handleUpdateSettings({ piliLimit: n })}
                          className="w-8 h-8 rounded-lg text-xs font-black flex items-center justify-center transition-all"
                          style={{
                            background: room.settings.piliLimit === n ? 'rgba(230,57,70,0.25)' : 'rgba(26,10,10,0.5)',
                            border: `1.5px solid ${room.settings.piliLimit === n ? 'var(--accent-red)' : 'rgba(92,51,51,0.4)'}`,
                            color: room.settings.piliLimit === n ? 'var(--accent-red)' : 'var(--text-muted)',
                          }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {n}
                        </motion.button>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm font-black text-accent-red">{room.settings.piliLimit}</span>
                  )}
                </div>

                {/* Turn Timer */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-foreground">Timer par tour</p>
                    <p className="text-[10px] text-text-muted">Secondes par action</p>
                  </div>
                  {isHost ? (
                    <div className="flex items-center gap-1.5">
                      {[15, 30, 45, 60].map((n) => (
                        <motion.button
                          key={n}
                          onClick={() => handleUpdateSettings({ turnTimerSeconds: n })}
                          className="px-2.5 h-8 rounded-lg text-xs font-black flex items-center justify-center transition-all"
                          style={{
                            background: room.settings.turnTimerSeconds === n ? 'rgba(244,162,97,0.2)' : 'rgba(26,10,10,0.5)',
                            border: `1.5px solid ${room.settings.turnTimerSeconds === n ? 'var(--accent-gold)' : 'rgba(92,51,51,0.4)'}`,
                            color: room.settings.turnTimerSeconds === n ? 'var(--accent-gold)' : 'var(--text-muted)',
                          }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {n}s
                        </motion.button>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm font-black text-accent-gold">{room.settings.turnTimerSeconds}s</span>
                  )}
                </div>

                {/* Expert Missions */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-foreground">Missions expert</p>
                    <p className="text-[10px] text-text-muted">Missions plus complexes</p>
                  </div>
                  {isHost ? (
                    <motion.button
                      onClick={() => handleUpdateSettings({ includeExpertMissions: !room.settings.includeExpertMissions })}
                      className="relative w-11 h-6 rounded-full cursor-pointer transition-colors"
                      style={{
                        background: room.settings.includeExpertMissions ? 'rgba(88,129,87,0.4)' : 'rgba(26,10,10,0.6)',
                        border: `1.5px solid ${room.settings.includeExpertMissions ? 'var(--accent-green)' : 'rgba(92,51,51,0.5)'}`,
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div
                        className="w-4 h-4 rounded-full absolute top-0.5"
                        animate={{
                          left: room.settings.includeExpertMissions ? 22 : 3,
                          background: room.settings.includeExpertMissions ? 'var(--accent-green)' : 'var(--text-muted)',
                        }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    </motion.button>
                  ) : (
                    <span className={`text-xs font-bold ${room.settings.includeExpertMissions ? 'text-accent-green' : 'text-text-muted'}`}>
                      {room.settings.includeExpertMissions ? 'Oui' : 'Non'}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Actions ── */}
      <motion.div
        className="w-full max-w-md space-y-2.5"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {/* Ready button */}
        <motion.button
          onClick={handleToggleReady}
          className={`w-full text-base ${meReady ? 'btn-secondary' : 'btn-primary'}`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          {meReady ? 'Annuler Prêt' : 'Je suis prêt !'}
        </motion.button>

        {/* Start game (host only) */}
        {isHost && (
          <motion.button
            onClick={handleStartGame}
            disabled={!canStart}
            className="btn-primary w-full text-lg relative overflow-hidden"
            whileHover={canStart ? { scale: 1.02 } : undefined}
            whileTap={canStart ? { scale: 0.97 } : undefined}
          >
            {canStart && (
              <motion.div
                className="absolute inset-0 opacity-20"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                  backgroundSize: '200% 100%',
                }}
                animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
            )}
            <span className="relative">
              {canStart ? '🌶️ Lancer la partie !' : 'Lancer la partie'}
            </span>
          </motion.button>
        )}

        {/* Leave */}
        <motion.button
          onClick={handleLeave}
          className="w-full text-sm py-2.5 text-text-muted hover:text-accent-red font-medium transition-colors cursor-pointer"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
        >
          Quitter la room
        </motion.button>
      </motion.div>
    </div>
  );
}
