'use client';

import { motion } from 'framer-motion';
import type { PlayerRoundResult } from '@/types/game.types';

interface GameOverModalProps {
  standings: PlayerRoundResult[];
  winnerId: string;
  onBackToLobby: () => void;
}

const PODIUM_STYLES = [
  { emoji: '🥇', color: '#f4a261', size: 'text-lg', glow: 'rgba(244,162,97,0.3)' },
  { emoji: '🥈', color: '#d4a373', size: 'text-base', glow: 'rgba(212,163,115,0.2)' },
  { emoji: '🥉', color: '#8b6f5f', size: 'text-base', glow: 'rgba(139,111,95,0.2)' },
];

export default function GameOverModal({
  standings,
  winnerId,
  onBackToLobby,
}: GameOverModalProps) {
  const winner = standings.find(s => s.playerId === winnerId);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(10,5,5,0.92)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Celebration particles */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-xl pointer-events-none"
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 40}%`,
          }}
          initial={{ opacity: 0, scale: 0, y: 20 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1.2, 0.8],
            y: [20, -30, -60],
            rotate: [0, Math.random() * 360],
          }}
          transition={{
            duration: 2,
            delay: Math.random() * 1.5,
            repeat: Infinity,
            repeatDelay: Math.random() * 2,
          }}
        >
          {['🌶️', '🔥', '✨', '🎉'][i % 4]}
        </motion.div>
      ))}

      <motion.div
        className="w-full max-w-sm rounded-2xl overflow-hidden relative"
        style={{
          background: 'linear-gradient(145deg, rgba(61,31,31,0.98), rgba(45,21,21,0.98))',
          border: '2px solid rgba(244,162,97,0.4)',
          boxShadow: '0 0 80px rgba(244,162,97,0.15), 0 20px 60px rgba(0,0,0,0.6)',
        }}
        initial={{ scale: 0.7, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
      >
        {/* Header */}
        <div className="px-5 py-5 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(244,162,97,0.12), rgba(230,57,70,0.08))',
            borderBottom: '1px solid rgba(92,51,51,0.4)',
          }}
        >
          <motion.div
            className="text-4xl mb-2"
            animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🏆
          </motion.div>
          <h2 className="text-xl font-black text-accent-gold">
            Fin de partie !
          </h2>
          {winner && (
            <p className="text-sm text-text-secondary mt-1">
              <span className="font-bold text-accent-gold">{winner.playerName}</span> remporte la victoire !
            </p>
          )}
        </div>

        {/* Standings */}
        <div className="px-4 py-3 space-y-1.5">
          {standings.map((s, i) => {
            const podium = PODIUM_STYLES[i];
            const isWinner = s.playerId === winnerId;

            return (
              <motion.div
                key={s.playerId}
                className="flex items-center gap-3 px-3 py-2 rounded-xl"
                style={{
                  background: isWinner
                    ? 'rgba(244,162,97,0.1)'
                    : 'rgba(26,10,10,0.3)',
                  border: isWinner
                    ? '1px solid rgba(244,162,97,0.25)'
                    : '1px solid transparent',
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
              >
                <span className="text-lg w-7 text-center">
                  {podium?.emoji ?? `${i + 1}.`}
                </span>
                <span
                  className={`flex-1 font-bold ${podium?.size ?? 'text-sm'} truncate`}
                  style={{ color: podium?.color ?? 'var(--text-muted)' }}
                >
                  {s.playerName}
                </span>
                <span className="flex items-center gap-0.5">
                  {Array.from({ length: Math.min(s.totalPilis, 6) }).map((_, j) => (
                    <span key={j} className="text-xs">🌶️</span>
                  ))}
                  {s.totalPilis > 6 && (
                    <span className="text-xs text-pili font-bold">+{s.totalPilis - 6}</span>
                  )}
                  {s.totalPilis === 0 && (
                    <span className="text-xs text-accent-green font-bold">0 🌶️</span>
                  )}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Back button */}
        <div className="px-4 pb-4 pt-2">
          <motion.button
            className="btn-primary w-full text-base"
            onClick={onBackToLobby}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            Retour au lobby
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
