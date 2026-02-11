'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface BettingPanelProps {
  maxBet: number;
  forbiddenBets: number[];
  onPlaceBet: (bet: number) => void;
  isMyTurn: boolean;
}

export function BettingPanel({
  maxBet,
  forbiddenBets,
  onPlaceBet,
  isMyTurn,
}: BettingPanelProps) {
  const [selectedBet, setSelectedBet] = useState<number | null>(null);

  if (!isMyTurn) {
    return (
      <div className="text-center py-4">
        <p className="text-text-muted animate-pulse">En attente des autres joueurs...</p>
      </div>
    );
  }

  const betOptions = Array.from({ length: maxBet + 1 }, (_, i) => i);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface rounded-xl border border-border p-4"
    >
      <h3 className="text-sm font-bold text-text-secondary mb-3 text-center">
        Combien de plis vas-tu gagner ?
      </h3>

      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {betOptions.map((bet) => {
          const isForbidden = forbiddenBets.includes(bet);
          return (
            <button
              key={bet}
              onClick={() => !isForbidden && setSelectedBet(bet)}
              disabled={isForbidden}
              className={`
                w-12 h-12 rounded-xl font-bold text-lg transition-all
                ${isForbidden
                  ? 'bg-background/50 text-text-muted cursor-not-allowed line-through opacity-40'
                  : selectedBet === bet
                    ? 'bg-accent-gold text-background scale-110 glow-gold'
                    : 'bg-background border border-border text-foreground hover:border-accent-gold hover:scale-105'
                }
              `}
            >
              {bet}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => selectedBet !== null && onPlaceBet(selectedBet)}
        disabled={selectedBet === null}
        className="btn-primary w-full"
      >
        {selectedBet !== null ? `Parier ${selectedBet}` : 'Choisis ton pari'}
      </button>
    </motion.div>
  );
}
