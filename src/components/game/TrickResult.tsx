'use client';

import { motion } from 'framer-motion';
import type { TrickCard } from '@/types/game.types';

interface TrickResultProps {
  winnerId: string;
  winnerName: string;
  trick: TrickCard[];
}

export default function TrickResult({
  winnerId,
  winnerName,
  trick,
}: TrickResultProps) {
  const winningCard = trick.find(tc => tc.playerId === winnerId)?.card;

  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="rounded-2xl px-6 py-4 text-center"
        style={{
          background: 'rgba(26,10,10,0.95)',
          border: '2px solid rgba(88,129,87,0.4)',
          boxShadow: '0 0 40px rgba(88,129,87,0.2), 0 20px 60px rgba(0,0,0,0.5)',
        }}
        initial={{ scale: 0.5, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: -20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <motion.span
          className="text-3xl block mb-1"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.5 }}
        >
          🏆
        </motion.span>
        <p className="text-sm font-black text-accent-green">
          {winnerName} remporte le pli !
        </p>
        {winningCard && (
          <p className="text-xs text-text-muted mt-1">
            avec la carte {winningCard.isJoker ? '★ Joker' : winningCard.value}
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}
