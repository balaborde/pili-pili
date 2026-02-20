'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Target } from 'lucide-react';
import type { Card, MissionActionRequest, ClientGamePlayer } from '@/types/game.types';
import CardComponent from './CardComponent';

interface MissionActionProps {
  action: MissionActionRequest;
  myHand: Card[];
  players: ClientGamePlayer[];
  myPlayerId: string;
  onSubmitCards: (cardIds: number[]) => void;
  onDesignateVictim: (victimId: string) => void;
  onChooseJokerValue: (value: 0 | 56) => void;
}

export default function MissionAction({
  action,
  myHand,
  players,
  myPlayerId,
  onSubmitCards,
  onDesignateVictim,
  onChooseJokerValue,
}: MissionActionProps) {
  const [selectedCardIds, setSelectedCardIds] = useState<Set<number>>(new Set());
  const [selectedVictimId, setSelectedVictimId] = useState<string | null>(null);

  if (action.type === 'CHOOSE_JOKER_VALUE') {
    return (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center px-6"
        style={{ background: 'rgba(10,5,5,0.85)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="rounded-2xl p-6 text-center max-w-xs w-full"
          style={{
            background: 'linear-gradient(145deg, rgba(61,31,31,0.98), rgba(45,21,21,0.98))',
            border: '1px solid rgba(244,162,97,0.3)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          }}
          initial={{ scale: 0.8, y: 20 }}
          animate={{ scale: 1, y: 0 }}
        >
          <h3 className="text-lg font-black text-accent-gold mb-2">Valeur du Joker</h3>
          <p className="text-xs text-text-muted mb-4">Choisissez la puissance de votre Joker</p>

          <div className="flex gap-3 justify-center">
            <motion.button
              className="flex-1 rounded-xl p-4 text-center"
              style={{
                background: 'rgba(88,129,87,0.15)',
                border: '2px solid rgba(88,129,87,0.4)',
              }}
              whileHover={{ scale: 1.05, borderColor: 'var(--accent-green)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onChooseJokerValue(0)}
            >
              <span className="text-2xl font-black text-accent-green">0</span>
              <p className="text-xs text-text-muted mt-1">Plus faible</p>
            </motion.button>

            <motion.button
              className="flex-1 rounded-xl p-4 text-center"
              style={{
                background: 'rgba(230,57,70,0.15)',
                border: '2px solid rgba(230,57,70,0.4)',
              }}
              whileHover={{ scale: 1.05, borderColor: 'var(--accent-red)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onChooseJokerValue(56)}
            >
              <span className="text-2xl font-black text-accent-red">56</span>
              <p className="text-xs text-text-muted mt-1">Plus fort</p>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  if (action.type === 'CHOOSE_CARDS_TO_PASS') {
    const toggleCard = (cardId: number) => {
      const next = new Set(selectedCardIds);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else if (next.size < action.count) {
        next.add(cardId);
      }
      setSelectedCardIds(next);
    };

    const directionLabel = action.direction === 'left' ? 'à gauche' : 'à droite';

    return (
      <motion.div
        className="w-full max-w-md mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
      >
        <div
          className="rounded-2xl p-4"
          style={{
            background: 'linear-gradient(145deg, rgba(61,31,31,0.98), rgba(45,21,21,0.98))',
            border: '1px solid rgba(244,162,97,0.3)',
            boxShadow: '0 -8px 30px rgba(0,0,0,0.5)',
          }}
        >
          <h3 className="text-sm font-black text-accent-gold text-center mb-1">
            Choisir {action.count} carte{action.count > 1 ? 's' : ''} à donner {directionLabel}
          </h3>
          <p className="text-xs text-text-muted text-center mb-3">
            {selectedCardIds.size}/{action.count} sélectionnée{selectedCardIds.size > 1 ? 's' : ''}
          </p>

          <div className="flex flex-wrap justify-center gap-2 mb-3">
            {myHand.map((card) => (
              <CardComponent
                key={card.id}
                card={card}
                size="sm"
                selected={selectedCardIds.has(card.id)}
                onClick={() => toggleCard(card.id)}
              />
            ))}
          </div>

          <motion.button
            className="btn-primary w-full text-sm"
            disabled={selectedCardIds.size !== action.count}
            onClick={() => onSubmitCards(Array.from(selectedCardIds))}
            whileHover={selectedCardIds.size === action.count ? { scale: 1.02 } : undefined}
            whileTap={selectedCardIds.size === action.count ? { scale: 0.97 } : undefined}
          >
            Confirmer
          </motion.button>
        </div>
      </motion.div>
    );
  }

  if (action.type === 'DESIGNATE_VICTIM') {
    const others = players.filter(p => p.id !== myPlayerId && !p.isEliminated);

    return (
      <motion.div
        className="w-full max-w-md mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
      >
        <div
          className="rounded-2xl p-4"
          style={{
            background: 'linear-gradient(145deg, rgba(61,31,31,0.98), rgba(45,21,21,0.98))',
            border: '1px solid rgba(193,18,31,0.3)',
            boxShadow: '0 -8px 30px rgba(0,0,0,0.5)',
          }}
        >
          <h3 className="text-sm font-black text-pili text-center mb-1 flex items-center justify-center gap-1.5">
            Désigner une victime <Target size={15} />
          </h3>
          <p className="text-xs text-text-muted text-center mb-3">
            Vous recevrez aussi ses pilis en fin de manche
          </p>

          <div className="space-y-2 mb-3">
            {others.map((player) => (
              <motion.button
                key={player.id}
                className="w-full flex items-center gap-3 p-3 rounded-xl transition-all"
                style={{
                  background: selectedVictimId === player.id
                    ? 'rgba(193,18,31,0.15)'
                    : 'rgba(26,10,10,0.4)',
                  border: selectedVictimId === player.id
                    ? '1.5px solid rgba(193,18,31,0.5)'
                    : '1.5px solid rgba(92,51,51,0.3)',
                }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedVictimId(player.id)}
              >
                <span className="text-sm flex items-center">
                  {player.isBot ? <Bot size={16} /> : player.name.charAt(0).toUpperCase()}
                </span>
                <span className="text-sm font-bold text-foreground">{player.name}</span>
                <span className="ml-auto text-xs text-text-muted">
                  {player.pilis > 0 && `🌶️ ${player.pilis}`}
                </span>
              </motion.button>
            ))}
          </div>

          <motion.button
            className="btn-primary w-full text-sm"
            disabled={!selectedVictimId}
            onClick={() => selectedVictimId && onDesignateVictim(selectedVictimId)}
            whileHover={selectedVictimId ? { scale: 1.02 } : undefined}
            whileTap={selectedVictimId ? { scale: 0.97 } : undefined}
          >
            Confirmer
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return null;
}
