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
  tiny?: boolean;
  style?: React.CSSProperties;
}

export function PlayingCard({
  card,
  onClick,
  selected = false,
  disabled = false,
  faceDown = false,
  small = false,
  tiny = false,
  style,
}: PlayingCardProps) {
  const isHidden = card.value === -1 || faceDown;
  const isJoker = card.isJoker;

  const sizeClasses = tiny
    ? 'w-8 h-12 text-[10px]'
    : small
      ? 'w-16 h-24 text-xl'
      : 'w-20 h-28 sm:w-24 sm:h-32 text-2xl sm:text-3xl';

  // Color gradient based on card value (cold blue -> warm red)
  const getCardGradient = (value: number) => {
    if (isJoker) {
      return 'from-purple-600 via-purple-500 to-pink-500';
    }
    // Cold colors for low values (1-18): blues
    if (value <= 18) {
      const intensity = Math.floor((value / 18) * 3);
      const gradients = [
        'from-blue-700 via-blue-600 to-cyan-600',
        'from-blue-600 via-cyan-600 to-cyan-500',
        'from-cyan-600 via-teal-500 to-teal-400',
      ];
      return gradients[intensity] || gradients[0];
    }
    // Mid-range (19-36): greens to yellows
    if (value <= 36) {
      const intensity = Math.floor(((value - 19) / 18) * 3);
      const gradients = [
        'from-teal-500 via-green-500 to-lime-500',
        'from-lime-500 via-yellow-500 to-yellow-400',
        'from-yellow-500 via-amber-500 to-orange-400',
      ];
      return gradients[intensity] || gradients[0];
    }
    // Hot colors for high values (37-55): oranges to reds
    const intensity = Math.floor(((value - 37) / 18) * 3);
    const gradients = [
      'from-orange-500 via-orange-600 to-red-500',
      'from-red-500 via-red-600 to-rose-600',
      'from-rose-600 via-pink-600 to-fuchsia-600',
    ];
    return gradients[intensity] || gradients[2];
  };

  const getBorderColor = (value: number) => {
    if (isJoker) return 'border-purple-400';
    if (value <= 18) return 'border-cyan-400';
    if (value <= 36) return 'border-yellow-400';
    return 'border-red-400';
  };

  return (
    <motion.button
      onClick={disabled ? undefined : onClick}
      className={`
        ${sizeClasses}
        relative rounded-2xl border-3 font-black
        flex items-center justify-center
        cursor-pointer select-none
        ${isHidden
          ? 'bg-gradient-to-br from-[#4a2020] to-[#2d1515] border-border'
          : `bg-gradient-to-br ${getCardGradient(card.value)} ${getBorderColor(card.value)} shadow-lg`
        }
        ${selected ? 'ring-4 ring-accent-gold ring-offset-2 ring-offset-background' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      style={{
        ...style,
        fontFamily: '"Fredoka", "Nunito", "Quicksand", system-ui, sans-serif',
        fontWeight: 900,
        textShadow: isHidden ? 'none' : '0 2px 6px rgba(0,0,0,0.6), 0 0 12px rgba(255,255,255,0.25)',
        willChange: 'transform',
      }}
      whileHover={!disabled ? { y: -12, scale: 1.1 } : undefined}
      whileTap={!disabled ? { scale: 0.95 } : undefined}
      animate={selected ? { y: -12 } : { y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {isHidden ? (
        <div className="text-border text-3xl select-none">🌶️</div>
      ) : isJoker ? (
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[10px] text-white/90 font-black tracking-widest">JOKER</span>
          <span className="text-4xl select-none drop-shadow-lg">🃏</span>
        </div>
      ) : (
        <span className="font-black text-white drop-shadow-2xl tracking-tight" style={{ letterSpacing: '-0.05em' }}>
          {card.value}
        </span>
      )}

      {/* Shine overlay */}
      {!isHidden && !disabled && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-40 pointer-events-none" />
      )}

      {/* Subtle pattern overlay */}
      {!isHidden && (
        <div className="absolute inset-0 rounded-2xl opacity-5 pointer-events-none overflow-hidden">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 30% 40%, rgba(255,255,255,0.3) 1px, transparent 1px),
                              radial-gradient(circle at 70% 60%, rgba(255,255,255,0.3) 1px, transparent 1px)`,
            backgroundSize: '12px 12px',
          }} />
        </div>
      )}
    </motion.button>
  );
}
