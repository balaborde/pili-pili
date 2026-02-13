'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import type { Card } from '@/types/game.types';
import { PlayingCard } from './PlayingCard';
import { useGameStore } from '@/stores/gameStore';

interface PlayerHandProps {
  cards: Card[];
  onCardClick: (card: Card) => void;
  disabled?: boolean;
  allowedCardIds?: string[];
  hidden?: boolean;
}

export function PlayerHand({
  cards,
  onCardClick,
  disabled = false,
  allowedCardIds,
  hidden = false,
}: PlayerHandProps) {
  const selectedCardId = useGameStore((s) => s.selectedCardId);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  const sorted = [...cards].sort((a, b) => {
    if (a.isJoker) return 1;
    if (b.isJoker) return -1;
    return a.value - b.value;
  });

  const fanSpread = Math.min(cards.length * 2.5, 18);
  const cardOffset = Math.min(48, 280 / Math.max(cards.length, 1));

  return (
    <div className="relative flex items-end justify-center" style={{ height: '120px' }}>
      <AnimatePresence mode="popLayout">
        {sorted.map((card, index) => {
          const isAllowed = !allowedCardIds || allowedCardIds.includes(card.id);
          const centerOffset = index - (sorted.length - 1) / 2;
          const rotation = centerOffset * (fanSpread / Math.max(sorted.length - 1, 1));
          const isHovered = hoveredCardId === card.id;

          return (
            <motion.div
              key={card.id}
              layout
              initial={{ opacity: 0, y: 80, scale: 0.3, rotate: -20 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, y: -30, scale: 0.5 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22, delay: index * 0.08 }}
              onHoverStart={() => setHoveredCardId(card.id)}
              onHoverEnd={() => setHoveredCardId(null)}
              style={{
                position: 'absolute',
                left: `calc(50% + ${centerOffset * cardOffset}px - 40px)`,
                transformOrigin: 'bottom center',
                zIndex: isHovered ? 1000 : index,
              }}
            >
              <PlayingCard
                card={card}
                onClick={() => onCardClick(card)}
                selected={selectedCardId === card.id}
                disabled={disabled || !isAllowed}
                faceDown={hidden}
                style={{ transform: `rotate(${rotation}deg)` }}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
