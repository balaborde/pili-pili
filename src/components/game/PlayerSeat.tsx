'use client';

import { motion } from 'framer-motion';
import type { ClientPlayer } from '@/types/game.types';
import { PlayingCard } from './PlayingCard';

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
        flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-xl transition-all
        ${isCurrentTurn ? 'bg-accent-gold/10 border border-accent-gold/40' : 'border border-transparent'}
        ${!player.isConnected && !player.isBot ? 'opacity-50' : ''}
      `}
      animate={isCurrentTurn ? { scale: 1.05 } : { scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <div className="flex items-center gap-2">
        {/* Avatar */}
        <div
          className={`
            w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0
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

        {/* Info */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1">
            <span className={`text-xs font-semibold truncate ${isMe ? 'text-accent-gold' : 'text-foreground'}`}>
              {player.name}
            </span>
            {isDealer && (
              <span className="text-[9px] bg-accent-orange/20 px-1 rounded text-accent-orange font-bold">D</span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {player.bet !== null && (
              <span className="text-[10px] text-text-secondary">
                Pari: <span className="font-bold">{player.bet}</span>
              </span>
            )}
            {player.tricksWon > 0 && (
              <span className="text-[10px] text-accent-green font-bold">
                {player.tricksWon} pli{player.tricksWon > 1 ? 's' : ''}
              </span>
            )}
            <div className="flex items-center gap-0.5">
              {Array.from({ length: player.pilis }).map((_, i) => (
                <span key={i} className="text-[9px] text-pili">&#x1F336;&#xFE0F;</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Visible hand (Face Up mission) */}
      {player.visibleHand && player.visibleHand.length > 0 && !isMe && (
        <div className="flex gap-0.5 mt-0.5">
          {player.visibleHand.map((card) => (
            <PlayingCard
              key={card.id}
              card={card}
              tiny
              disabled
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
