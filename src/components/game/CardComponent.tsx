'use client';

import { motion } from 'framer-motion';
import type { Card } from '@/types/game.types';

interface CardComponentProps {
  card: Card;
  size?: 'sm' | 'md' | 'lg';
  faceDown?: boolean;
  disabled?: boolean;
  selected?: boolean;
  dimmed?: boolean;
  onClick?: () => void;
}

const SIZE_MAP = {
  sm: { w: 48, h: 68, text: 'text-sm', icon: 'text-xs' },
  md: { w: 64, h: 90, text: 'text-xl', icon: 'text-sm' },
  lg: { w: 80, h: 112, text: 'text-2xl', icon: 'text-base' },
};

function getCardColor(value: number): string {
  if (value <= 15) return '#588157';
  if (value <= 35) return '#f4a261';
  if (value <= 55) return '#e63946';
  return '#c1121f';
}

export default function CardComponent({
  card,
  size = 'md',
  faceDown = false,
  disabled = false,
  selected = false,
  dimmed = false,
  onClick,
}: CardComponentProps) {
  const s = SIZE_MAP[size];

  if (faceDown) {
    return (
      <motion.div
        className="rounded-xl relative overflow-hidden shrink-0 select-none"
        style={{
          width: s.w,
          height: s.h,
          background: 'linear-gradient(145deg, #8b2020, #5c1515)',
          border: '2px solid rgba(193,18,31,0.5)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
        whileHover={onClick ? { y: -2 } : undefined}
      >
        {/* Back pattern */}
        <div
          className="absolute inset-1 rounded-lg opacity-20"
          style={{
            backgroundImage: `
              radial-gradient(circle at 30% 30%, rgba(244,162,97,0.4) 0%, transparent 40%),
              radial-gradient(circle at 70% 70%, rgba(230,57,70,0.4) 0%, transparent 40%)
            `,
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-30 text-lg">
          🌶️
        </div>
      </motion.div>
    );
  }

  const color = card.isJoker ? '#c1121f' : getCardColor(card.value);
  const displayValue = card.isJoker ? '★' : card.value;

  return (
    <motion.button
      className="rounded-xl relative overflow-hidden shrink-0 select-none"
      style={{
        width: s.w,
        height: s.h,
        background: 'linear-gradient(145deg, #fefae0, #f5e6c8)',
        border: `2px solid ${selected ? 'var(--accent-gold)' : 'rgba(212,163,115,0.4)'}`,
        boxShadow: selected
          ? '0 0 20px rgba(244,162,97,0.4), 0 8px 20px rgba(0,0,0,0.3)'
          : '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.5)',
        cursor: disabled ? 'not-allowed' : onClick ? 'pointer' : 'default',
        opacity: dimmed ? 0.4 : disabled ? 0.5 : 1,
        filter: disabled ? 'grayscale(0.5)' : 'none',
      }}
      onClick={disabled ? undefined : onClick}
      whileHover={!disabled && onClick ? { y: -6, scale: 1.04 } : undefined}
      whileTap={!disabled && onClick ? { scale: 0.96 } : undefined}
      layout
      layoutId={`card-${card.id}`}
      disabled={disabled}
    >
      {/* Corner values */}
      <span
        className={`absolute top-1 left-1.5 font-black ${s.icon} leading-none`}
        style={{ color }}
      >
        {displayValue}
      </span>

      {/* Center value */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={`font-black ${s.text} leading-none`}
          style={{
            color,
            textShadow: `0 1px 3px rgba(0,0,0,0.1)`,
          }}
        >
          {displayValue}
        </span>
      </div>

      {/* Joker decoration */}
      {card.isJoker && (
        <div className="absolute bottom-1 right-1.5 text-xs opacity-70">
          🌶️
        </div>
      )}

      {/* Bottom corner (inverted) */}
      <span
        className={`absolute bottom-1 right-1.5 font-black ${s.icon} leading-none rotate-180`}
        style={{ color }}
      >
        {displayValue}
      </span>

      {/* Selection glow overlay */}
      {selected && (
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            background: 'rgba(244,162,97,0.15)',
          }}
          animate={{ opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </motion.button>
  );
}
