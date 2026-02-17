'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { MissionInfo } from '@/types/game.types';

interface MissionInfoSheetProps {
  mission: MissionInfo;
  isOpen: boolean;
  onToggle: () => void;
}

export default function MissionInfoSheet({
  mission,
  isOpen,
  onToggle,
}: MissionInfoSheetProps) {
  return (
    <div className="w-full max-w-md mx-auto">
      <motion.button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer"
        style={{
          background: 'rgba(61,31,31,0.7)',
          border: `1px solid ${mission.difficulty === 'expert' ? 'rgba(193,18,31,0.3)' : 'rgba(92,51,51,0.4)'}`,
        }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm">{mission.icon}</span>
          <span className="text-[11px] font-bold text-text-secondary truncate">
            {mission.name}
          </span>
          {mission.difficulty === 'expert' && (
            <span
              className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded shrink-0"
              style={{
                background: 'rgba(193,18,31,0.2)',
                color: 'var(--pili-token)',
              }}
            >
              Expert
            </span>
          )}
        </div>
        <motion.span
          className="text-[10px] text-text-muted shrink-0 ml-2"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          ▾
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div
              className="mt-1 rounded-xl px-4 py-3"
              style={{
                background: 'rgba(45,21,21,0.9)',
                border: '1px solid rgba(92,51,51,0.3)',
              }}
            >
              <p className="text-xs text-text-secondary leading-relaxed">
                {mission.description}
              </p>
              <div className="flex items-center gap-3 mt-2 pt-2"
                style={{ borderTop: '1px solid rgba(92,51,51,0.3)' }}
              >
                <span className="text-[10px] text-text-muted">
                  🃏 {mission.cardsPerPlayer} carte{mission.cardsPerPlayer > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
