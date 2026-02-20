'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { TrickCard, MissionInfo, ClientGamePlayer } from '@/types/game.types';
import CardComponent from './CardComponent';
import MissionIcon from './MissionIcon';

interface PlayAreaProps {
  currentTrick: TrickCard[];
  mission: MissionInfo;
  trickNumber: number;
  totalTricks: number;
  players: ClientGamePlayer[];
  isSimultaneous: boolean;
}

export default function PlayArea({
  currentTrick,
  mission,
  trickNumber,
  totalTricks,
  players,
  isSimultaneous,
}: PlayAreaProps) {
  const getPlayerName = (playerId: string) => {
    return players.find(p => p.id === playerId)?.name ?? '';
  };

  // Position cards around center based on player count and who played
  const getCardPosition = (index: number, total: number) => {
    const angles = {
      1: [0],
      2: [-30, 30],
      3: [-40, 0, 40],
      4: [-50, -17, 17, 50],
      5: [-56, -28, 0, 28, 56],
      6: [-60, -36, -12, 12, 36, 60],
      7: [-63, -42, -21, 0, 21, 42, 63],
      8: [-64, -48, -32, -16, 16, 32, 48, 64],
    };
    const count = Math.min(total, 8) as keyof typeof angles;
    const xOffset = (angles[count]?.[index] ?? 0) * 1.2;
    const yOffset = Math.abs(xOffset) * 0.15 - 10;
    return { x: xOffset, y: yOffset };
  };

  return (
    <div className="relative flex flex-col items-center gap-3">
      {/* Trick counter */}
      <div
        className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
        style={{
          background: 'rgba(61,31,31,0.8)',
          border: '1px solid rgba(92,51,51,0.5)',
          color: 'var(--text-secondary)',
        }}
      >
        {trickNumber > 0
          ? `Pli ${trickNumber}/${totalTricks}`
          : `${totalTricks} plis`
        }
      </div>

      {/* Play area circle */}
      <div
        className="relative w-60 h-36 sm:w-72 sm:h-40 rounded-3xl flex items-center justify-center"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(45,21,21,0.6) 0%, rgba(26,10,10,0.3) 100%)',
          border: '1px solid rgba(92,51,51,0.3)',
          boxShadow: 'inset 0 2px 20px rgba(0,0,0,0.3)',
        }}
      >
        {/* Center mission icon when no cards played */}
        {currentTrick.length === 0 && (
          <motion.div
            className="flex flex-col items-center gap-1 opacity-40"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <MissionIcon name={mission.icon} size={28} style={{ color: 'var(--text-muted)' }} />
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
              {isSimultaneous ? 'Simultané' : 'En attente'}
            </span>
          </motion.div>
        )}

        {/* Played cards */}
        <AnimatePresence>
          {currentTrick.map((tc, index) => {
            const pos = getCardPosition(index, currentTrick.length);
            return (
              <motion.div
                key={`trick-${tc.playerId}-${tc.card.id}`}
                className="absolute flex flex-col items-center"
                initial={{ opacity: 0, scale: 0.5, y: 40 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  x: pos.x,
                  y: pos.y,
                }}
                exit={{ opacity: 0, scale: 0.5, y: -30 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <div className="relative">
                  <CardComponent card={tc.card} size="sm" />
                  {tc.card.isJoker && (
                    <span
                      className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs font-black px-1 rounded-full"
                      style={{
                        background: '#c1121f',
                        color: '#fff',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
                      }}
                    >
                      {tc.card.value}
                    </span>
                  )}
                </div>
                <span
                  className="text-[11px] font-bold mt-0.5 px-1.5 py-0.5 rounded-md truncate max-w-16"
                  style={{
                    background: 'rgba(26,10,10,0.8)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {getPlayerName(tc.playerId)}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
