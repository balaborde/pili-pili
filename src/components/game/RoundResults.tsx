'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import type { PlayerRoundResult } from '@/types/game.types';

interface RoundResultsProps {
  results: PlayerRoundResult[];
  roundNumber: number;
  onContinue: () => void;
}

export default function RoundResults({
  results,
  roundNumber,
  onContinue,
}: RoundResultsProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(10,5,5,0.9)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, rgba(61,31,31,0.98), rgba(45,21,21,0.98))',
          border: '1px solid rgba(92,51,51,0.5)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        }}
        initial={{ scale: 0.8, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 250, damping: 22 }}
      >
        {/* Header */}
        <div
          className="px-5 py-4 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(230,57,70,0.15), rgba(244,132,95,0.1))',
            borderBottom: '1px solid rgba(92,51,51,0.4)',
          }}
        >
          <h2 className="text-lg font-black text-accent-gold">
            Résultats — Manche {roundNumber}
          </h2>
        </div>

        {/* Results table */}
        <div className="px-4 py-3">
          {/* Header row */}
          <div className="flex items-center text-xs font-bold text-text-muted uppercase tracking-wider pb-2 mb-2"
            style={{ borderBottom: '1px solid rgba(92,51,51,0.3)' }}
          >
            <span className="flex-1">Joueur</span>
            <span className="w-10 text-center">Pari</span>
            <span className="w-10 text-center">Plis</span>
            <span className="w-10 text-center">Écart</span>
            <span className="w-14 text-center">Pilis</span>
          </div>

          {/* Player rows */}
          <div className="space-y-1.5">
            {results.map((r, i) => {
              const isSuccess = r.gap === 0;
              return (
                <motion.div
                  key={r.playerId}
                  className="flex items-center text-sm py-1.5 px-1 rounded-lg"
                  style={{
                    background: isSuccess
                      ? 'rgba(88,129,87,0.1)'
                      : r.gap > 0
                      ? 'rgba(230,57,70,0.05)'
                      : 'transparent',
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                >
                  <span className="flex-1 font-bold text-xs truncate pr-2">
                    {r.playerName}
                  </span>
                  <span className="w-10 text-center text-xs font-bold text-accent-gold">
                    {r.bet}
                  </span>
                  <span className="w-10 text-center text-xs font-bold text-foreground">
                    {r.tricksWon}
                  </span>
                  <span
                    className={`w-10 flex items-center justify-center text-xs font-black ${
                      isSuccess ? 'text-accent-green' : 'text-accent-red'
                    }`}
                  >
                    {isSuccess ? <Check size={13} /> : r.gap}
                  </span>
                  <div className="w-14 flex flex-col items-center gap-0.5">
                    <span className="text-xs font-bold text-foreground">
                      {r.totalPilis}
                    </span>
                    <div className="flex flex-wrap justify-center gap-0.5">
                      {r.gap > 0 && (
                        <motion.span
                          className="text-xs font-black"
                          style={{ color: 'var(--accent-red)' }}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.3 + i * 0.08, type: 'spring' }}
                        >
                          +{r.gap}
                        </motion.span>
                      )}
                      {r.missionPilis > 0 && (
                        <motion.span
                          className="text-xs font-black"
                          style={{ color: '#f4845f' }}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.35 + i * 0.08, type: 'spring' }}
                        >
                          +{r.missionPilis}
                        </motion.span>
                      )}
                      {r.pilisRemoved > 0 && (
                        <motion.span
                          className="text-xs font-black"
                          style={{ color: 'var(--accent-green)' }}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.4 + i * 0.08, type: 'spring' }}
                        >
                          -{r.pilisRemoved}
                        </motion.span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Continue button */}
        <div className="px-4 pb-4 pt-2">
          <motion.button
            className="btn-primary w-full text-sm"
            onClick={onContinue}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Continuer
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
