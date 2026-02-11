'use client';

import { motion } from 'framer-motion';
import type { ClientPlayer } from '@/types/game.types';

interface PlayerSeatProps {
  player: ClientPlayer;
  isCurrentTurn: boolean;
  isDealer: boolean;
  isMe: boolean;
}

export function PlayerSeat({ player, isCurrentTurn, isDealer, isMe }: PlayerSeatProps) {
  return (
    <motion.div
      className={`
        flex flex-col items-center gap-1 p-2 rounded-xl transition-all min-w-[80px]
        ${isCurrentTurn ? 'bg-accent-gold/10 border border-accent-gold/40' : 'border border-transparent'}
        ${!player.isConnected && !player.isBot ? 'opacity-50' : ''}
      `}
      animate={isCurrentTurn ? { scale: 1.05 } : { scale: 1 }}
    >
      {/* Avatar */}
      <div
        className={`
          w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
          ${isMe
            ? 'bg-accent-gold/20 border-2 border-accent-gold text-accent-gold'
            : player.isBot
              ? 'bg-surface-hover border-2 border-border text-text-muted'
              : 'bg-accent-red/20 border-2 border-accent-red/40 text-accent-red'
          }
        `}
      >
        {player.name.charAt(0).toUpperCase()}
      </div>

      {/* Name */}
      <span className={`text-xs font-semibold truncate max-w-[80px] ${isMe ? 'text-accent-gold' : 'text-foreground'}`}>
        {player.name}
      </span>

      {/* Info row */}
      <div className="flex items-center gap-1">
        {/* Bet */}
        {player.bet !== null && (
          <span className="text-xs bg-surface-hover px-1.5 py-0.5 rounded text-text-secondary">
            {player.bet}
          </span>
        )}

        {/* Tricks won */}
        {player.tricksWon > 0 && (
          <span className="text-xs bg-accent-green/20 px-1.5 py-0.5 rounded text-accent-green">
            {player.tricksWon}
          </span>
        )}

        {/* Dealer badge */}
        {isDealer && (
          <span className="text-xs bg-accent-orange/20 px-1.5 py-0.5 rounded text-accent-orange">
            D
          </span>
        )}
      </div>

      {/* Pilis */}
      <div className="flex items-center gap-0.5">
        {Array.from({ length: player.pilis }).map((_, i) => (
          <span key={i} className="text-xs text-pili">&#x1F336;&#xFE0F;</span>
        ))}
        {player.pilis === 0 && <span className="text-xs text-text-muted">0</span>}
      </div>

      {/* Cards count */}
      <span className="text-[10px] text-text-muted">
        {player.cardCount} carte{player.cardCount !== 1 ? 's' : ''}
      </span>
    </motion.div>
  );
}
