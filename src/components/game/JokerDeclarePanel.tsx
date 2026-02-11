'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface JokerDeclarePanelProps {
  onDeclare: (value: number) => void;
}

export function JokerDeclarePanel({ onDeclare }: JokerDeclarePanelProps) {
  const [value, setValue] = useState(28);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <div className="bg-surface rounded-2xl border border-accent-gold p-6 w-full max-w-sm shadow-2xl">
        <h3 className="text-lg font-bold text-center mb-2">
          D&eacute;clarer la valeur du Joker
        </h3>
        <p className="text-xs text-text-muted text-center mb-4">
          Choisis une valeur entre 0 et 56
        </p>

        <div className="flex items-center justify-center gap-4 mb-4">
          <button
            onClick={() => setValue((v) => Math.max(0, v - 1))}
            className="btn-secondary w-10 h-10 flex items-center justify-center text-lg"
          >
            -
          </button>
          <input
            type="number"
            min={0}
            max={56}
            value={value}
            onChange={(e) => setValue(Math.max(0, Math.min(56, parseInt(e.target.value) || 0)))}
            className="w-20 text-center text-3xl font-black bg-background border border-border rounded-xl py-2 text-accent-gold focus:outline-none focus:border-accent-gold"
          />
          <button
            onClick={() => setValue((v) => Math.min(56, v + 1))}
            className="btn-secondary w-10 h-10 flex items-center justify-center text-lg"
          >
            +
          </button>
        </div>

        {/* Quick select */}
        <div className="flex flex-wrap gap-2 justify-center mb-4">
          {[0, 10, 20, 30, 40, 50, 56].map((v) => (
            <button
              key={v}
              onClick={() => setValue(v)}
              className={`px-3 py-1 rounded-lg text-sm font-bold transition-all ${
                value === v
                  ? 'bg-accent-gold text-background'
                  : 'bg-background border border-border text-foreground hover:border-accent-gold'
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        <button onClick={() => onDeclare(value)} className="btn-primary w-full">
          Jouer le Joker ({value})
        </button>
      </div>
    </motion.div>
  );
}
