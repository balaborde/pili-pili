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
      initial={{ opacity: 0, scale: 0.8, rotateY: 180 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className={`
        bg-surface rounded-xl border-2 p-3 max-w-xs
        ${mission.isExpert
          ? 'border-accent-red glow-red'
          : 'border-accent-gold'
        }
      `}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm">&#x1F3AF;</span>
        <h4 className="font-bold text-sm text-foreground">{mission.name}</h4>
        {mission.isExpert && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-red/20 text-accent-red font-bold">
            Expert
          </span>
        )}
      </div>
      <p className="text-xs text-text-secondary leading-relaxed">
        {mission.description}
      </p>
      <div className="mt-2 text-[10px] text-text-muted">
        {mission.cardsPerPlayer} carte{mission.cardsPerPlayer > 1 ? 's' : ''} / joueur
      </div>
    </motion.div>
  );
}
