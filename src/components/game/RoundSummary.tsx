'use client';

import { motion } from 'framer-motion';
import type { RoundScoringData } from '@/types/game.types';

interface RoundSummaryProps {
  scoring: RoundScoringData;
  myPlayerId: string | null;
}

export function RoundSummary({ scoring, myPlayerId }: RoundSummaryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <div className="bg-surface rounded-2xl border border-border p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-xl font-black text-center mb-4">
          R&eacute;sultats de la manche
        </h3>

        <div className="space-y-2">
          {scoring.players.map((ps) => {
            const isMe = ps.playerId === myPlayerId;
            const betSuccess = ps.bet === ps.tricksWon;

            return (
              <div
                key={ps.playerId}
                className={`flex items-center justify-between p-3 rounded-xl ${
                  isMe ? 'bg-accent-gold/10 border border-accent-gold/30' : 'bg-background'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`font-semibold text-sm ${isMe ? 'text-accent-gold' : 'text-foreground'}`}>
                    {ps.name}
                  </span>
                  {betSuccess && (
                    <span className="text-xs bg-accent-green/20 text-accent-green px-1.5 py-0.5 rounded">
                      Pari r&eacute;ussi !
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="text-center">
                    <div className="text-text-muted">Pari</div>
                    <div className="font-bold">{ps.bet}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-text-muted">Plis</div>
                    <div className="font-bold">{ps.tricksWon}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-text-muted">Pilis</div>
                    <div className={`font-bold ${ps.totalNewPilis > 0 ? 'text-accent-red' : 'text-accent-green'}`}>
                      {ps.totalNewPilis > 0 ? `+${ps.totalNewPilis}` : '0'}
                    </div>
                  </div>
                  {ps.rewardPilis > 0 && (
                    <div className="text-center">
                      <div className="text-text-muted">Bonus</div>
                      <div className="font-bold text-accent-green">-{ps.rewardPilis}</div>
                    </div>
                  )}
                  <div className="text-center border-l border-border pl-3">
                    <div className="text-text-muted">Total</div>
                    <div className="font-bold text-accent-orange">{ps.totalPilis}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-center text-text-muted text-xs mt-4">
          Prochaine manche dans quelques secondes...
        </p>
      </div>
    </motion.div>
  );
}
