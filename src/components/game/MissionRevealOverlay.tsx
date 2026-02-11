'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MissionCardDef } from '@/types/game.types';

interface MissionRevealOverlayProps {
  mission: MissionCardDef;
  onComplete: () => void;
}

export function MissionRevealOverlay({ mission, onComplete }: MissionRevealOverlayProps) {
  const [phase, setPhase] = useState<'enter' | 'display' | 'exit'>('enter');

  useEffect(() => {
    const enterTimer = setTimeout(() => setPhase('display'), 400);
    const exitTimer = setTimeout(() => setPhase('exit'), 2800);
    const completeTimer = setTimeout(() => onComplete(), 3400);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: phase === 'exit' ? 0 : 1 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm pointer-events-none"
    >
      <motion.div
        initial={{ scale: 0, rotate: -180, opacity: 0 }}
        animate={
          phase === 'exit'
            ? { scale: 0.3, rotate: 0, opacity: 0, x: '-40vw', y: '-40vh' }
            : { scale: 1, rotate: 0, opacity: 1, x: 0, y: 0 }
        }
        transition={
          phase === 'exit'
            ? { duration: 0.6, ease: [0.4, 0, 0.2, 1] }
            : { type: 'spring', stiffness: 200, damping: 18, duration: 0.6 }
        }
        className={`
          rounded-2xl border-3 p-8 max-w-sm w-full mx-4 shadow-2xl
          ${mission.isExpert
            ? 'border-accent-red bg-gradient-to-br from-[#3d1520] to-[#2d1515] glow-red'
            : 'border-accent-gold bg-gradient-to-br from-[#3d2a15] to-[#2d1515] glow-gold'
          }
        `}
      >
        {/* Mission number badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 400 }}
          className={`
            w-12 h-12 rounded-full flex items-center justify-center text-xl font-black mx-auto mb-4
            ${mission.isExpert
              ? 'bg-accent-red/30 text-accent-red border-2 border-accent-red/50'
              : 'bg-accent-gold/30 text-accent-gold border-2 border-accent-gold/50'
            }
          `}
        >
          {mission.id}
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-2xl font-black text-center text-foreground mb-3"
        >
          {mission.name}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-sm text-text-secondary text-center leading-relaxed mb-4"
        >
          {mission.description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-center gap-3"
        >
          <span className="text-xs text-text-muted">
            {mission.cardsPerPlayer} carte{mission.cardsPerPlayer > 1 ? 's' : ''} / joueur
          </span>
          {mission.isExpert && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-accent-red/20 text-accent-red font-bold border border-accent-red/30">
              Expert
            </span>
          )}
        </motion.div>

        {/* Decorative shimmer */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{ delay: 0.8, duration: 1.2, ease: 'easeInOut' }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
