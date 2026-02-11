'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ClientPlayer } from '@/types/game.types';

interface PiliTrackerProps {
  players: ClientPlayer[];
  piliLimit: number;
  myPlayerId: string | null;
}

export function PiliTracker({ players, piliLimit, myPlayerId }: PiliTrackerProps) {
  const [open, setOpen] = useState(false);
  const sorted = [...players].sort((a, b) => a.pilis - b.pilis);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 bg-surface rounded-lg border border-border px-2 py-1.5 hover:border-accent-gold/40 transition-colors"
      >
        <span className="text-[10px] font-bold text-text-muted uppercase">Score</span>
        <div className="flex items-center gap-1">
          {sorted.slice(0, 3).map((p) => (
            <span
              key={p.id}
              className={`text-[10px] font-mono font-bold ${
                p.id === myPlayerId ? 'text-accent-gold' : 'text-text-secondary'
              }`}
            >
              {p.pilis}
            </span>
          ))}
        </div>
        <span className="text-[9px] text-text-muted">{open ? '\u25B2' : '\u25BC'}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-1 z-30 bg-surface rounded-lg border border-border p-2.5 shadow-xl min-w-[180px]"
          >
            <div className="space-y-1.5">
              {sorted.map((player) => {
                const ratio = player.pilis / piliLimit;
                return (
                  <div key={player.id} className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-semibold truncate w-14 ${
                        player.id === myPlayerId ? 'text-accent-gold' : 'text-foreground'
                      }`}
                    >
                      {player.name}
                    </span>
                    <div className="flex-1 h-1.5 bg-background rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${
                          ratio >= 0.8
                            ? 'bg-accent-red'
                            : ratio >= 0.5
                              ? 'bg-accent-orange'
                              : 'bg-accent-green'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${(ratio * 100).toFixed(0)}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                      />
                    </div>
                    <span className="text-[10px] text-text-muted w-7 text-right font-mono">
                      {player.pilis}/{piliLimit}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
