'use client';

import { motion } from 'framer-motion';
import { JOKER_MIN_VALUE, JOKER_MAX_VALUE } from '@/lib/constants';

interface JokerDeclarePanelProps {
  onDeclare: (value: number) => void;
}

export function JokerDeclarePanel({ onDeclare }: JokerDeclarePanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <div className="bg-surface rounded-2xl border border-accent-gold p-6 w-full max-w-sm shadow-2xl">
        <h3 className="text-lg font-bold text-center mb-2">
          D&eacute;clarer la valeur du Joker
        </h3>
        <p className="text-xs text-text-muted text-center mb-5">
          Le Joker peut valoir 0 (la plus faible) ou 56 (la plus forte)
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => onDeclare(JOKER_MIN_VALUE)}
            className="flex-1 flex flex-col items-center gap-1.5 px-4 py-4 rounded-xl bg-background border-2 border-border hover:border-accent-gold hover:scale-105 transition-all"
          >
            <span className="text-3xl font-black text-accent-gold">{JOKER_MIN_VALUE}</span>
            <span className="text-xs text-text-secondary font-semibold">La plus faible</span>
          </button>
          <button
            onClick={() => onDeclare(JOKER_MAX_VALUE)}
            className="flex-1 flex flex-col items-center gap-1.5 px-4 py-4 rounded-xl bg-background border-2 border-border hover:border-accent-red hover:scale-105 transition-all"
          >
            <span className="text-3xl font-black text-accent-red">{JOKER_MAX_VALUE}</span>
            <span className="text-xs text-text-secondary font-semibold">La plus forte</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
