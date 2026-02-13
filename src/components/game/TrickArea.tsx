'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { Trick, ClientPlayer } from '@/types/game.types';
import { PlayingCard } from './PlayingCard';

interface TrickAreaProps {
  trick: Trick | null;
  players: ClientPlayer[];
  winnerId?: string | null;
}

export function TrickArea({ trick, players, winnerId }: TrickAreaProps) {
  if (!trick || trick.plays.length === 0) {
    return (
      <div className="w-64 h-40 sm:w-80 sm:h-48 rounded-2xl border-2 border-dashed border-border/30 flex items-center justify-center">
        <span className="text-text-muted/50 text-sm">Zone de jeu</span>
      </div>
    );
  }

  return (
    <div className="relative w-64 h-40 sm:w-80 sm:h-48">
      <AnimatePresence>
        {trick.plays.map((play, index) => {
          const player = players.find((p) => p.id === play.playerId);
          const isWinner = winnerId === play.playerId;
          const angle = (index / players.length) * 360 - 90;
          const radius = 48;
          const x = Math.cos((angle * Math.PI) / 180) * radius;
          const y = Math.sin((angle * Math.PI) / 180) * radius;

          return (
            <motion.div
              key={`${play.playerId}-${play.card.id}`}
              className="absolute"
              style={{
                left: `calc(50% + ${x}px - 32px)`,
                top: `calc(50% + ${y}px - 44px)`,
                zIndex: index,
              }}
              initial={{ opacity: 0, scale: 0.3, y: 60 }}
              animate={{
                opacity: 1,
                scale: isWinner ? 1.15 : 1,
                y: 0,
              }}
              exit={{ opacity: 0, scale: 0.3, y: -40 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            >
              <div className={`relative ${isWinner ? 'glow-gold' : ''} rounded-xl`}>
                <PlayingCard card={play.card} small />
                {play.jokerDeclaredValue !== undefined && (
                  <div className="absolute -top-1.5 -right-1.5 bg-accent-gold text-background text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {play.jokerDeclaredValue}
                  </div>
                )}
              </div>
              <p className="text-center text-[9px] text-text-muted mt-0.5 truncate max-w-12">
                {player?.name}
              </p>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
