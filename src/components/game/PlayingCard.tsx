'use client';

import { motion } from 'framer-motion';
import type { Card } from '@/types/game.types';

interface PlayingCardProps {
  card: Card;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  faceDown?: boolean;
  small?: boolean;
  style?: React.CSSProperties;
}

export function PlayingCard({
  card,
  onClick,
  selected = false,
  disabled = false,
  faceDown = false,
  small = false,
  style,
}: PlayingCardProps) {
  const isHidden = card.value === -1 || faceDown;
  const isJoker = card.isJoker;

  const sizeClasses = small
    ? 'w-12 h-18 text-sm'
    : 'w-16 h-24 sm:w-20 sm:h-30 text-lg sm:text-xl';

  const getCardColor = (value: number) => {
    if (isJoker) return 'text-accent-gold';
    if (value >= 40) return 'text-accent-red';
    if (value >= 25) return 'text-accent-orange';
    return 'text-foreground';
  };

  return (
    <motion.button
      onClick={disabled ? undefined : onClick}
      className={`
        ${sizeClasses}
        relative rounded-xl border-2 font-bold
        flex items-center justify-center
        transition-colors cursor-pointer select-none
        ${isHidden
          ? 'bg-gradient-to-br from-[#4a2020] to-[#2d1515] border-border'
          : 'bg-gradient-to-br from-[#4a2020] to-[#2d1515] border-border hover:border-accent-gold'
        }
        ${selected ? 'border-accent-gold glow-gold' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      style={style}
      whileHover={!disabled ? { y: -8, scale: 1.05 } : undefined}
      whileTap={!disabled ? { scale: 0.95 } : undefined}
      animate={selected ? { y: -12 } : { y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {isHidden ? (
        <div className="text-border text-2xl select-none">&#x1F336;&#xFE0F;</div>
      ) : isJoker ? (
        <div className="flex flex-col items-center">
          <span className="text-xs text-text-muted">JOKER</span>
          <span className="text-2xl select-none">&#x1F0CF;</span>
        </div>
      ) : (
        <span className={`font-black ${getCardColor(card.value)}`}>
          {card.value}
        </span>
      )}

      {/* Card shine overlay */}
      {!isHidden && !disabled && (
        <div className="absolute inset-0 rounded-xl card-shine pointer-events-none" />
      )}
    </motion.button>
  );
}
