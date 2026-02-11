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
      <div className="w-64 h-40 sm:w-80 sm:h-48 rounded-2xl border-2 border-dashed border-border/50 flex items-center justify-center">
        <span className="text-text-muted text-sm">Zone de jeu</span>
      </div>
    );
  }

  return (
    <div className="relative w-64 h-40 sm:w-80 sm:h-48">
      <AnimatePresence>
        {trick.plays.map((play, index) => {
          const player = players.find((p) => p.id === play.playerId);
          const isWinner = winnerId === play.playerId;
          const angle = (index / players.length) * 360;
          const radius = 40;
          const x = Math.cos((angle * Math.PI) / 180) * radius;
          const y = Math.sin((angle * Math.PI) / 180) * radius;

          return (
            <motion.div
              key={`${play.playerId}-${play.card.id}`}
              className="absolute"
              style={{
                left: `calc(50% + ${x}px - 32px)`,
                top: `calc(50% + ${y}px - 48px)`,
                zIndex: index,
              }}
              initial={{ opacity: 0, scale: 0.5, y: 60 }}
              animate={{
                opacity: 1,
                scale: isWinner ? 1.1 : 1,
                y: 0,
              }}
              exit={{ opacity: 0, scale: 0.5, y: -30 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <div className={`relative ${isWinner ? 'glow-gold' : ''} rounded-xl`}>
                <PlayingCard card={play.card} small />
                {play.jokerDeclaredValue !== undefined && (
                  <div className="absolute -top-2 -right-2 bg-accent-gold text-background text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {play.jokerDeclaredValue}
                  </div>
                )}
              </div>
              <p className="text-center text-xs text-text-muted mt-1 truncate max-w-16">
                {player?.name}
              </p>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
