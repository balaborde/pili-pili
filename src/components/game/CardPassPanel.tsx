'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Card } from '@/types/game.types';
import { PlayingCard } from './PlayingCard';

interface CardPassPanelProps {
  hand: Card[];
  count: number;
  direction: 'left' | 'right';
  onPass: (cardIds: string[]) => void;
}

export function CardPassPanel({ hand, count, direction, onPass }: CardPassPanelProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleCard = (cardId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else if (next.size < count) {
        next.add(cardId);
      }
      return next;
    });
  };

  const passAll = count >= hand.length;
  const actualCount = passAll ? hand.length : count;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface rounded-xl border border-accent-orange p-3 max-w-sm mx-auto w-full"
    >
      <h3 className="text-xs font-bold text-accent-orange mb-2 text-center">
        {passAll
          ? `Donne toutes tes cartes ${direction === 'left' ? '\u00e0 gauche' : '\u00e0 droite'}`
          : `Choisis ${count} carte${count > 1 ? 's' : ''} \u00e0 passer ${direction === 'left' ? '\u00e0 gauche' : '\u00e0 droite'}`}
      </h3>

      <div className="flex flex-wrap justify-center gap-1.5 mb-3">
        {hand.map((card) => (
          <PlayingCard
            key={card.id}
            card={card}
            onClick={() => !passAll && toggleCard(card.id)}
            selected={passAll || selectedIds.has(card.id)}
            disabled={passAll}
            small
          />
        ))}
      </div>

      <button
        onClick={() => {
          if (passAll) {
            onPass(hand.map((c) => c.id));
          } else {
            onPass(Array.from(selectedIds));
          }
        }}
        disabled={!passAll && selectedIds.size !== actualCount}
        className="btn-primary w-full text-sm py-2"
      >
        {passAll ? 'Passer toutes les cartes' : `Passer ${selectedIds.size}/${actualCount} carte(s)`}
      </button>
    </motion.div>
  );
}
