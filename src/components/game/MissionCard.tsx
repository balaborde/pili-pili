'use client';

import { motion } from 'framer-motion';
import type { MissionCardDef } from '@/types/game.types';

interface MissionCardProps {
  mission: MissionCardDef | null;
}

export function MissionCard({ mission }: MissionCardProps) {
  if (!mission) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`
        bg-surface rounded-lg border p-2 max-w-[180px]
        ${mission.isExpert
          ? 'border-accent-red/60'
          : 'border-accent-gold/40'
        }
      `}
    >
      <div className="flex items-center gap-1.5 mb-0.5">
        <span className="text-[10px]">&#x1F3AF;</span>
        <h4 className="font-bold text-[11px] text-foreground leading-tight truncate">{mission.name}</h4>
        {mission.isExpert && (
          <span className="text-[8px] px-1 py-px rounded bg-accent-red/20 text-accent-red font-bold shrink-0">
            E
          </span>
        )}
      </div>
      <p className="text-[9px] text-text-secondary leading-snug line-clamp-2">
        {mission.description}
      </p>
      <div className="mt-1 text-[8px] text-text-muted">
        {mission.cardsPerPlayer} carte{mission.cardsPerPlayer > 1 ? 's' : ''}/joueur
      </div>
    </motion.div>
  );
}
