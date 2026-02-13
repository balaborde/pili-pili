'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Card, ClientPlayer } from '@/types/game.types';
import { PlayingCard } from './PlayingCard';

interface CardExchangePanelProps {
  hand: Card[];
  players: ClientPlayer[];
  myPlayerId: string | null;
  /** Winner mode: pick card + target. Target mode: pick card only. */
  mode: 'winner' | 'target';
  onExchange: (cardId: string, targetPlayerId?: string) => void;
}

export function CardExchangePanel({ hand, players, myPlayerId, mode, onExchange }: CardExchangePanelProps) {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const others = players.filter((p) => p.id !== myPlayerId);

  const isWinner = mode === 'winner';
  const canSubmit = isWinner ? (selectedCardId && selectedPlayerId) : selectedCardId;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface rounded-xl border border-accent-orange p-3 max-w-sm mx-auto w-full"
    >
      <h3 className="text-xs font-bold text-accent-orange mb-2 text-center">
        {isWinner ? '\u00c9change une carte' : 'Choisis ta carte \u00e0 donner'}
      </h3>
      <p className="text-[10px] text-text-muted text-center mb-2">
        {isWinner
          ? 'Choisis une carte \u00e0 donner et un joueur avec qui \u00e9changer'
          : 'Le gagnant du pli veut \u00e9changer avec toi'}
      </p>

      {/* Card selection */}
      <div className="flex flex-wrap justify-center gap-1.5 mb-3">
        {hand.map((card) => (
          <PlayingCard
            key={card.id}
            card={card}
            onClick={() => setSelectedCardId(card.id)}
            selected={selectedCardId === card.id}
            small
          />
        ))}
      </div>

      {/* Player selection (winner mode only) */}
      {isWinner && (
        <div className="flex flex-wrap justify-center gap-2 mb-3">
          {others.map((player) => (
            <button
              key={player.id}
              onClick={() => setSelectedPlayerId(player.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all text-xs ${
                selectedPlayerId === player.id
                  ? 'border-accent-gold bg-accent-gold/10 text-accent-gold'
                  : 'border-border bg-background text-foreground hover:border-accent-gold/40'
              }`}
            >
              <span className="font-semibold">{player.name}</span>
            </button>
          ))}
        </div>
      )}

      <button
        onClick={() => {
          if (!selectedCardId) return;
          if (isWinner && selectedPlayerId) {
            onExchange(selectedCardId, selectedPlayerId);
          } else if (!isWinner) {
            onExchange(selectedCardId);
          }
        }}
        disabled={!canSubmit}
        className="btn-primary w-full text-sm py-2"
      >
        {canSubmit
          ? (isWinner ? '\u00c9changer' : 'Donner cette carte')
          : (isWinner ? 'Choisis carte + joueur' : 'Choisis une carte')
        }
      </button>
    </motion.div>
  );
}
