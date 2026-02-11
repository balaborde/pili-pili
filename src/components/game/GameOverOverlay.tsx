'use client';

import { motion } from 'framer-motion';
import type { PlayerScore } from '@/types/game.types';

interface GameOverOverlayProps {
  standings: PlayerScore[];
  eliminatedId: string;
  myPlayerId: string | null;
  onPlayAgain: () => void;
  onLeave: () => void;
}

export function GameOverOverlay({
  standings,
  eliminatedId,
  myPlayerId,
  onPlayAgain,
  onLeave,
}: GameOverOverlayProps) {
  const winner = standings[0];
  const isWinner = winner.playerId === myPlayerId;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.8, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="bg-surface rounded-2xl border border-border p-8 w-full max-w-md shadow-2xl text-center"
      >
        <div className="text-5xl mb-4">
          {isWinner ? <>&#x1F3C6;</> : <>&#x1F336;&#xFE0F;</>}
        </div>

        <h2 className="text-2xl font-black mb-1">
          {isWinner ? 'Victoire !' : 'Fin de partie'}
        </h2>
        <p className="text-text-secondary mb-6">
          {winner.name} remporte la partie !
        </p>

        {/* Standings */}
        <div className="space-y-2 mb-6">
          {standings.map((ps) => {
            const isMe = ps.playerId === myPlayerId;
            const isEliminated = ps.playerId === eliminatedId;

            return (
              <div
                key={ps.playerId}
                className={`flex items-center justify-between p-3 rounded-xl ${
                  ps.rank === 1
                    ? 'bg-accent-gold/10 border border-accent-gold/30'
                    : isEliminated
                      ? 'bg-accent-red/10 border border-accent-red/30'
                      : 'bg-background'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-black text-text-muted w-6">
                    {ps.rank === 1 ? <span className="text-accent-gold">1</span> : ps.rank}
                  </span>
                  <span className={`font-semibold ${isMe ? 'text-accent-gold' : 'text-foreground'}`}>
                    {ps.name}
                  </span>
                  {isEliminated && (
                    <span className="text-xs text-accent-red">&Eacute;limin&eacute;</span>
                  )}
                </div>
                <span className="font-mono text-sm text-text-secondary">
                  {ps.pilis} pili{ps.pilis !== 1 ? 's' : ''}
                </span>
              </div>
            );
          })}
        </div>

        <div className="space-y-3">
          <button onClick={onPlayAgain} className="btn-primary w-full text-lg">
            Rejouer
          </button>
          <button onClick={onLeave} className="btn-secondary w-full">
            Quitter
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
