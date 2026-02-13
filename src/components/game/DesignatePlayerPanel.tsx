'use client';

import { motion } from 'framer-motion';
import type { ClientPlayer } from '@/types/game.types';

interface DesignatePlayerPanelProps {
  players: ClientPlayer[];
  myPlayerId: string | null;
  onDesignate: (targetPlayerId: string) => void;
}

export function DesignatePlayerPanel({ players, myPlayerId, onDesignate }: DesignatePlayerPanelProps) {
  const others = players.filter((p) => p.id !== myPlayerId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface rounded-xl border border-accent-orange p-3 max-w-sm mx-auto w-full"
    >
      <h3 className="text-xs font-bold text-accent-orange mb-2 text-center">
        D\u00e9signe un joueur
      </h3>
      <p className="text-[10px] text-text-muted text-center mb-3">
        Tu recevras ses P\u00edlis en plus des tiens en fin de manche
      </p>

      <div className="flex flex-wrap justify-center gap-2">
        {others.map((player) => (
          <button
            key={player.id}
            onClick={() => onDesignate(player.id)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background border border-border hover:border-accent-gold hover:scale-105 transition-all"
          >
            <div className={`
              w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold
              ${player.isBot
                ? 'bg-surface-hover border border-border text-text-muted'
                : 'bg-accent-red/20 border border-accent-red/40 text-accent-red'
              }
            `}>
              {player.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs font-semibold text-foreground">{player.name}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
