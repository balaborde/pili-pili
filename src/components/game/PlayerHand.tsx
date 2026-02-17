'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { Card } from '@/types/game.types';
import CardComponent from './CardComponent';

interface PlayerHandProps {
  cards: Card[];
  canPlay: boolean;
  selectedCardId: number | null;
  onSelectCard: (cardId: number | null) => void;
  onPlayCard: (cardId: number) => void;
  disabled?: boolean;
}

export default function PlayerHand({
  cards,
  canPlay,
  selectedCardId,
  onSelectCard,
  onPlayCard,
  disabled = false,
}: PlayerHandProps) {
  const count = cards.length;
  const maxSpread = Math.min(count * 38, 320);

  const handleCardClick = (cardId: number) => {
    if (!canPlay || disabled) return;

    if (selectedCardId === cardId) {
      onPlayCard(cardId);
    } else {
      onSelectCard(cardId);
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-2 pb-2">
      {/* Play button */}
      <AnimatePresence>
        {selectedCardId !== null && canPlay && (
          <motion.button
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="btn-primary text-sm px-6 py-2"
            onClick={() => onPlayCard(selectedCardId)}
          >
            Jouer cette carte
          </motion.button>
        )}
      </AnimatePresence>

      {/* Card fan */}
      <div
        className="relative flex items-end justify-center"
        style={{
          height: count > 0 ? 110 : 40,
          width: '100%',
          maxWidth: maxSpread + 80,
        }}
      >
        <AnimatePresence>
          {cards.map((card, index) => {
            const isSelected = card.id === selectedCardId;
            const centerOffset = index - (count - 1) / 2;
            const fanAngle = count > 1
              ? centerOffset * Math.min(8, 50 / count)
              : 0;
            const fanY = count > 1
              ? Math.abs(centerOffset) * Math.min(4, 20 / count)
              : 0;
            const xOffset = count > 1
              ? centerOffset * Math.min(38, 260 / count)
              : 0;

            return (
              <motion.div
                key={card.id}
                className="absolute"
                style={{
                  zIndex: isSelected ? 100 : index + 10,
                  bottom: 0,
                  left: '50%',
                }}
                initial={{ opacity: 0, y: 40, scale: 0.8 }}
                animate={{
                  opacity: 1,
                  x: xOffset - 32,
                  y: isSelected ? -20 - fanY : -fanY,
                  rotate: isSelected ? 0 : fanAngle,
                  scale: isSelected ? 1.08 : 1,
                }}
                exit={{ opacity: 0, y: -60, scale: 0.6, transition: { duration: 0.3 } }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                <CardComponent
                  card={card}
                  size="md"
                  selected={isSelected}
                  disabled={disabled || !canPlay}
                  onClick={() => handleCardClick(card.id)}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Hint */}
      {canPlay && cards.length > 0 && !selectedCardId && (
        <motion.p
          className="text-[11px] text-text-muted font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Touchez une carte pour la jouer
        </motion.p>
      )}
    </div>
  );
}
