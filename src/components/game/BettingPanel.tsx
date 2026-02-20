'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface BettingPanelProps {
  totalTricks: number;
  forbiddenBetValues: number[];
  bettingConstraint: {
    sumSoFar: number;
    forbiddenBet: number | null;
  } | null;
  isMyTurn: boolean;
  onPlaceBet: (bet: number) => void;
}

export default function BettingPanel({
  totalTricks,
  forbiddenBetValues,
  bettingConstraint,
  isMyTurn,
  onPlaceBet,
}: BettingPanelProps) {
  const [selectedBet, setSelectedBet] = useState<number | null>(null);

  if (!isMyTurn) return null;

  const allForbidden = new Set(forbiddenBetValues);
  if (bettingConstraint?.forbiddenBet !== null && bettingConstraint?.forbiddenBet !== undefined) {
    allForbidden.add(bettingConstraint.forbiddenBet);
  }

  const handleConfirm = () => {
    if (selectedBet !== null) {
      onPlaceBet(selectedBet);
      setSelectedBet(null);
    }
  };

  return (
    <motion.div
      className="w-full max-w-md mx-auto"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <div
        className="rounded-2xl p-4 relative overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, rgba(61,31,31,0.98), rgba(45,21,21,0.98))',
          border: '1px solid rgba(244,162,97,0.3)',
          boxShadow: '0 -8px 30px rgba(0,0,0,0.5), 0 0 30px rgba(244,162,97,0.08)',
        }}
      >
        {/* Header */}
        <div className="text-center mb-3">
          <h3 className="text-sm font-black text-accent-gold uppercase tracking-wider">
            Votre pari
          </h3>
          <p className="text-[10px] text-text-muted mt-0.5">
            Combien de plis allez-vous remporter ?
          </p>
        </div>

        {/* Constraint warning */}
        {bettingConstraint && (
          <motion.div
            className="text-center mb-3 px-3 py-1.5 rounded-lg"
            style={{
              background: 'rgba(230,57,70,0.1)',
              border: '1px solid rgba(230,57,70,0.2)',
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <p className="text-[10px] text-accent-red font-bold flex items-center justify-center gap-1">
              <AlertTriangle size={11} />
              Somme actuelle : {bettingConstraint.sumSoFar} —
              {bettingConstraint.forbiddenBet !== null
                ? ` Le pari ${bettingConstraint.forbiddenBet} est interdit`
                : ' Pas de restriction'}
            </p>
          </motion.div>
        )}

        {/* Bet buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-3">
          {Array.from({ length: totalTricks + 1 }, (_, i) => i).map((bet) => {
            const isForbidden = allForbidden.has(bet);
            const isSelected = selectedBet === bet;

            return (
              <motion.button
                key={bet}
                disabled={isForbidden}
                onClick={() => setSelectedBet(bet)}
                className="w-11 h-11 rounded-xl text-sm font-black flex items-center justify-center transition-all"
                style={{
                  background: isSelected
                    ? '#c8182a'
                    : isForbidden
                    ? 'rgba(26,10,10,0.3)'
                    : 'rgba(26,10,10,0.6)',
                  border: isSelected
                    ? '2px solid var(--accent-gold)'
                    : isForbidden
                    ? '1.5px solid rgba(92,51,51,0.2)'
                    : '1.5px solid rgba(92,51,51,0.5)',
                  color: isSelected
                    ? 'var(--text-primary)'
                    : isForbidden
                    ? 'rgba(139,111,95,0.3)'
                    : 'var(--text-secondary)',
                  cursor: isForbidden ? 'not-allowed' : 'pointer',
                  textDecoration: isForbidden ? 'line-through' : 'none',
                }}
                whileHover={!isForbidden ? { scale: 1.1 } : undefined}
                whileTap={!isForbidden ? { scale: 0.95 } : undefined}
              >
                {bet}
              </motion.button>
            );
          })}
        </div>

        {/* Confirm */}
        <motion.button
          className="btn-primary w-full text-base"
          disabled={selectedBet === null}
          onClick={handleConfirm}
          whileHover={selectedBet !== null ? { scale: 1.02 } : undefined}
          whileTap={selectedBet !== null ? { scale: 0.97 } : undefined}
        >
          {selectedBet !== null
            ? `Parier ${selectedBet} pli${selectedBet !== 1 ? 's' : ''}`
            : 'Choisissez un pari'}
        </motion.button>
      </div>
    </motion.div>
  );
}
