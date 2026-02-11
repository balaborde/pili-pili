'use client';

import { motion, AnimatePresence } from 'framer-motion';
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

  const sorted = [...cards].sort((a, b) => {
    if (a.isJoker) return 1;
    if (b.isJoker) return -1;
    return a.value - b.value;
  });

  const fanSpread = Math.min(cards.length * 3, 20);
  const cardOffset = Math.min(60, 300 / Math.max(cards.length, 1));

  return (
    <div className="relative flex items-end justify-center" style={{ minHeight: '140px' }}>
      <AnimatePresence mode="popLayout">
        {sorted.map((card, index) => {
          const isAllowed = !allowedCardIds || allowedCardIds.includes(card.id);
          const centerOffset = index - (sorted.length - 1) / 2;
          const rotation = centerOffset * (fanSpread / Math.max(sorted.length - 1, 1));

          return (
            <motion.div
              key={card.id}
              layout
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25, delay: index * 0.05 }}
              style={{
                position: 'absolute',
                left: `calc(50% + ${centerOffset * cardOffset}px - 40px)`,
                transformOrigin: 'bottom center',
                zIndex: index,
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
