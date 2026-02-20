'use client';

import { motion } from 'framer-motion';
import { Layers } from 'lucide-react';
import MissionIcon from './MissionIcon';
import type { MissionInfo } from '@/types/game.types';

interface MissionRevealProps {
  mission: MissionInfo;
  roundNumber: number;
  onDismiss?: () => void;
}

export default function MissionReveal({
  mission,
  roundNumber,
  onDismiss,
}: MissionRevealProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: 'rgba(10,5,5,0.85)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onDismiss}
    >
      {/* Card */}
      <motion.div
        className="relative w-72 sm:w-80 rounded-3xl overflow-hidden cursor-pointer"
        style={{
          background: mission.difficulty === 'expert'
            ? 'linear-gradient(145deg, #4a1010, #2d0808)'
            : 'linear-gradient(145deg, rgba(61,31,31,0.98), rgba(45,21,21,0.98))',
          border: mission.difficulty === 'expert'
            ? '2px solid rgba(193,18,31,0.6)'
            : '2px solid rgba(244,162,97,0.4)',
          boxShadow: mission.difficulty === 'expert'
            ? '0 0 60px rgba(193,18,31,0.3), 0 20px 60px rgba(0,0,0,0.6)'
            : '0 0 60px rgba(244,162,97,0.15), 0 20px 60px rgba(0,0,0,0.6)',
        }}
        initial={{ scale: 0.3, rotateY: 180 }}
        animate={{ scale: 1, rotateY: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: -30 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        onClick={onDismiss}
      >
        <div className="p-6 text-center">
          {/* Round number */}
          <motion.p
            className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Manche {roundNumber}
          </motion.p>

          {/* Icon */}
          <motion.div
            className="flex justify-center mb-3"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
          >
            <MissionIcon
              name={mission.icon}
              size={48}
              style={{ color: mission.difficulty === 'expert' ? 'var(--pili-token)' : 'var(--accent-gold)' }}
            />
          </motion.div>

          {/* Name */}
          <motion.h2
            className={`text-xl font-black mb-2 ${
              mission.difficulty === 'expert' ? 'text-pili' : 'text-accent-gold'
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            {mission.name}
          </motion.h2>

          {/* Difficulty badge */}
          {mission.difficulty === 'expert' && (
            <motion.span
              className="inline-block text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md mb-3"
              style={{
                background: 'rgba(193,18,31,0.2)',
                color: 'var(--pili-token)',
                border: '1px solid rgba(193,18,31,0.3)',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Expert
            </motion.span>
          )}

          {/* Description */}
          <motion.p
            className="text-sm text-text-secondary leading-relaxed mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
          >
            {mission.description}
          </motion.p>

          {/* Card count */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl"
            style={{
              background: 'rgba(244,162,97,0.1)',
              border: '1px solid rgba(244,162,97,0.2)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Layers size={20} style={{ color: 'var(--accent-gold)' }} />
            <span className="text-sm font-bold text-accent-gold">
              {mission.cardsPerPlayer} carte{mission.cardsPerPlayer > 1 ? 's' : ''} / joueur
            </span>
          </motion.div>

          {/* Tap hint */}
          <motion.p
            className="text-xs text-text-muted mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ delay: 1, duration: 2, repeat: Infinity }}
          >
            Touchez pour continuer
          </motion.p>
        </div>
      </motion.div>
    </motion.div>
  );
}
