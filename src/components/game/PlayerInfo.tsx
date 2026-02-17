'use client';

import { motion } from 'framer-motion';
import type { ClientGamePlayer } from '@/types/game.types';

interface PlayerInfoProps {
  player: ClientGamePlayer;
  isMe: boolean;
  color: { bg: string; border: string; text: string };
  showBet: boolean;
  compact?: boolean;
}

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

export { SEAT_COLORS };

export default function PlayerInfo({
  player,
  isMe,
  color,
  showBet,
  compact = false,
}: PlayerInfoProps) {
  const isTurn = player.isCurrentTurn;

  return (
    <motion.div
      className={`relative flex flex-col items-center gap-0.5 ${compact ? 'scale-90' : ''}`}
      animate={isTurn ? { scale: [1, 1.04, 1] } : { scale: 1 }}
      transition={isTurn ? { duration: 1.5, repeat: Infinity } : undefined}
    >
      {/* Active turn glow */}
      {isTurn && (
        <motion.div
          className="absolute -inset-2 rounded-2xl -z-10"
          style={{
            background: `radial-gradient(ellipse at center, ${color.border}33, transparent 70%)`,
          }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}

      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black shrink-0 relative"
        style={{
          background: color.bg,
          border: `2.5px solid ${isTurn ? color.border : 'rgba(92,51,51,0.5)'}`,
          color: color.text,
          opacity: player.isEliminated ? 0.4 : player.isConnected ? 1 : 0.5,
          boxShadow: isTurn ? `0 0 12px ${color.border}55` : 'none',
        }}
      >
        {player.isBot ? '🤖' : player.name.charAt(0).toUpperCase()}

        {/* Eliminated X */}
        {player.isEliminated && (
          <div className="absolute inset-0 flex items-center justify-center text-lg">
            ❌
          </div>
        )}
      </div>

      {/* Name */}
      <span
        className={`text-[10px] font-bold truncate max-w-16 leading-tight ${
          isMe ? 'text-accent-gold' : 'text-foreground'
        }`}
        style={{ opacity: player.isEliminated ? 0.4 : 1 }}
      >
        {isMe ? 'Toi' : player.name.split(' ')[0]}
      </span>

      {/* Stats row */}
      <div className="flex items-center gap-1.5">
        {/* Cards in hand */}
        <span
          className="text-[9px] font-bold px-1 py-0.5 rounded"
          style={{
            background: 'rgba(61,31,31,0.8)',
            color: 'var(--text-muted)',
          }}
        >
          🃏{player.cardCount}
        </span>

        {/* Bet badge */}
        {showBet && player.bet !== null && (
          <motion.span
            className="text-[9px] font-black px-1.5 py-0.5 rounded"
            style={{
              background: 'rgba(244,162,97,0.2)',
              color: 'var(--accent-gold)',
              border: '1px solid rgba(244,162,97,0.3)',
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500 }}
          >
            🎯{player.bet}
          </motion.span>
        )}

        {/* Tricks won */}
        {player.tricksWon > 0 && (
          <span
            className="text-[9px] font-bold px-1 py-0.5 rounded"
            style={{
              background: 'rgba(88,129,87,0.2)',
              color: 'var(--accent-green)',
            }}
          >
            ✓{player.tricksWon}
          </span>
        )}
      </div>

      {/* Pili tokens */}
      {player.pilis > 0 && (
        <div className="flex gap-0.5 mt-0.5">
          {Array.from({ length: Math.min(player.pilis, 8) }).map((_, i) => (
            <motion.span
              key={i}
              className="text-[8px]"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.05, type: 'spring' }}
            >
              🌶️
            </motion.span>
          ))}
          {player.pilis > 8 && (
            <span className="text-[8px] text-pili font-bold">+{player.pilis - 8}</span>
          )}
        </div>
      )}
    </motion.div>
  );
}
