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
      <div className="text-center py-2">
        <p className="text-text-muted text-sm animate-pulse">En attente des autres joueurs...</p>
      </div>
    );
  }

  const betOptions = Array.from({ length: maxBet + 1 }, (_, i) => i);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface rounded-xl border border-border p-3 max-w-sm mx-auto w-full"
    >
      <h3 className="text-xs font-bold text-text-secondary mb-2 text-center">
        Combien de plis vas-tu gagner ?
      </h3>

      <div className="flex flex-wrap justify-center gap-1.5 mb-3">
        {betOptions.map((bet) => {
          const isForbidden = forbiddenBets.includes(bet);
          return (
            <button
              key={bet}
              onClick={() => !isForbidden && setSelectedBet(bet)}
              disabled={isForbidden}
              className={`
                w-10 h-10 rounded-lg font-bold text-sm transition-all
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
        className="btn-primary w-full text-sm py-2"
      >
        {selectedBet !== null ? `Parier ${selectedBet}` : 'Choisis ton pari'}
      </button>
    </motion.div>
  );
}
