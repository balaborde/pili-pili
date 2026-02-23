'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Target, Layers, Flag, Flame, Sparkles,
  ChevronLeft, ChevronRight,
  Skull, AlertTriangle, Trophy, TrendingUp,
  RefreshCw, Zap, EyeOff,
} from 'lucide-react';
import { useI18n } from '@/i18n';

/* ── Illustrations ── */

function GoalIllustration() {
  const total = 6;
  const filled = 4;
  return (
    <div className="flex items-center justify-center gap-1.5 py-2">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{
            background: i < filled
              ? 'rgba(230,57,70,0.25)'
              : i === total - 1
                ? 'rgba(193,18,31,0.15)'
                : 'rgba(92,51,51,0.2)',
            border: `2px solid ${i < filled ? 'var(--accent-red)' : i === total - 1 ? 'var(--pili-token)' : 'rgba(92,51,51,0.4)'}`,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15 + i * 0.08, type: 'spring', stiffness: 300, damping: 20 }}
        >
          {i < filled
            ? <span className="text-sm">🌶️</span>
            : i === total - 1
              ? <Skull size={14} style={{ color: 'var(--pili-token)' }} />
              : null}
        </motion.div>
      ))}
    </div>
  );
}

function CardsIllustration() {
  const cards = [
    { value: '7', color: '#588157' },
    { value: '32', color: '#f4a261' },
    { value: '48', color: '#e63946' },
    { value: '★', color: '#c1121f' },
  ];
  return (
    <div className="flex items-end justify-center gap-2 py-2">
      {cards.map((card, i) => (
        <motion.div
          key={card.value}
          className="relative flex items-center justify-center rounded-lg font-black"
          style={{
            width: 44,
            height: 62,
            background: 'linear-gradient(145deg, #fefae0, #f5e6c8)',
            border: `2px solid ${i === cards.length - 1 ? 'var(--accent-gold)' : 'rgba(212,163,115,0.4)'}`,
            boxShadow: i === cards.length - 1
              ? '0 0 12px rgba(244,162,97,0.3), 0 4px 8px rgba(0,0,0,0.3)'
              : '0 4px 8px rgba(0,0,0,0.3)',
            color: card.color,
            fontSize: card.value === '★' ? 20 : 16,
          }}
          initial={{ opacity: 0, y: 20, rotate: -15 + i * 8 }}
          animate={{ opacity: 1, y: 0, rotate: -6 + i * 4 }}
          transition={{ delay: 0.15 + i * 0.1, type: 'spring', stiffness: 250, damping: 18 }}
        >
          {card.value}
        </motion.div>
      ))}
    </div>
  );
}

function BetsIllustration() {
  const { t } = useI18n();
  const bets = [0, 1, 2, 3];
  const selected = 2;
  const forbidden = 3;
  return (
    <div className="flex flex-col items-center gap-2 py-2">
      <div className="flex items-center gap-2">
        {bets.map((b, i) => (
          <motion.div
            key={b}
            className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-base"
            style={{
              background: b === selected
                ? '#c8182a'
                : b === forbidden
                  ? 'rgba(26,10,10,0.3)'
                  : 'rgba(26,10,10,0.6)',
              border: b === selected
                ? '2px solid var(--accent-gold)'
                : '1.5px solid rgba(92,51,51,0.5)',
              color: b === forbidden
                ? 'rgba(139,111,95,0.4)'
                : b === selected
                  ? '#fefae0'
                  : 'var(--text-secondary)',
              textDecoration: b === forbidden ? 'line-through' : 'none',
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15 + i * 0.08, type: 'spring', stiffness: 300, damping: 20 }}
          >
            {b}
          </motion.div>
        ))}
      </div>
      <motion.span
        className="flex items-center gap-1 text-xs font-bold"
        style={{ color: 'var(--accent-red)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <AlertTriangle size={12} />
        {t.howToPlay.forbiddenBetLabel(forbidden)}
      </motion.span>
    </div>
  );
}

function ScoreIllustration() {
  const { t } = useI18n();
  const items = [
    { Icon: Flag, label: t.howToPlay.scoreBet, value: '2', color: 'var(--accent-gold)' },
    { Icon: Trophy, label: t.howToPlay.scoreTricks, value: '4', color: 'var(--accent-green)' },
    { Icon: TrendingUp, label: t.howToPlay.scoreGap, value: '2', color: 'var(--accent-red)' },
  ];
  return (
    <div className="flex flex-col items-center gap-2 py-2">
      <div className="flex items-center gap-3">
        {items.map((item, i) => (
          <motion.div
            key={item.label}
            className="flex flex-col items-center gap-0.5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.1 }}
          >
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.label}</span>
            <div className="flex items-center gap-1 text-lg font-black" style={{ color: item.color }}>
              <item.Icon size={16} />
              {item.value}
            </div>
          </motion.div>
        ))}
      </div>
      <motion.div
        className="flex items-center gap-1 text-sm font-bold"
        style={{ color: 'var(--accent-red)' }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.55, type: 'spring', stiffness: 300 }}
      >
        → +2 🌶️
      </motion.div>
    </div>
  );
}

function MissionsIllustration() {
  const { t } = useI18n();
  const missions = [
    { Icon: RefreshCw, label: t.howToPlay.missionCardPass, expert: false },
    { Icon: Zap, label: t.howToPlay.missionSimultaneous, expert: false },
    { Icon: EyeOff, label: t.howToPlay.missionBlind, expert: false },
    { Icon: Skull, label: t.howToPlay.missionExpert, expert: true },
  ];
  return (
    <div className="grid grid-cols-2 gap-2 py-2">
      {missions.map((m, i) => (
        <motion.div
          key={m.label}
          className="flex items-start gap-1.5 rounded-lg px-2.5 py-2 text-xs font-bold leading-tight"
          style={{
            background: m.expert ? 'rgba(193,18,31,0.15)' : 'rgba(244,162,97,0.1)',
            border: `1px solid ${m.expert ? 'rgba(193,18,31,0.3)' : 'rgba(244,162,97,0.2)'}`,
            color: m.expert ? 'var(--pili-token)' : 'var(--accent-gold)',
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 + i * 0.1, type: 'spring', stiffness: 250, damping: 18 }}
        >
          <m.Icon size={13} className="shrink-0 mt-0.5" />
          <span>{m.label}</span>
        </motion.div>
      ))}
    </div>
  );
}

const ILLUSTRATIONS = [
  GoalIllustration,
  CardsIllustration,
  BetsIllustration,
  ScoreIllustration,
  MissionsIllustration,
];

/* ── Slide variants ── */

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

/* ── Main component ── */

export default function HowToPlayModal({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(0);

  const steps = useMemo(() => [
    { key: 'goal', title: t.howToPlay.steps.goal.title, accent: 'var(--accent-gold)', icon: Target, bullets: t.howToPlay.steps.goal.bullets },
    { key: 'cards', title: t.howToPlay.steps.cards.title, accent: 'var(--accent-green)', icon: Layers, bullets: t.howToPlay.steps.cards.bullets },
    { key: 'bets', title: t.howToPlay.steps.bets.title, accent: 'var(--accent-orange)', icon: Flag, bullets: t.howToPlay.steps.bets.bullets },
    { key: 'score', title: t.howToPlay.steps.score.title, accent: 'var(--accent-red)', icon: Flame, bullets: t.howToPlay.steps.score.bullets },
    { key: 'missions', title: t.howToPlay.steps.missions.title, accent: 'var(--pili-token)', icon: Sparkles, bullets: t.howToPlay.steps.missions.bullets },
  ], [t.howToPlay]);

  const goTo = useCallback((index: number) => {
    setDirection(index > step ? 1 : -1);
    setStep(index);
  }, [step]);

  const next = useCallback(() => {
    if (step < steps.length - 1) {
      setDirection(1);
      setStep(s => s + 1);
    } else {
      onClose();
    }
  }, [step, onClose, steps.length]);

  const prev = useCallback(() => {
    if (step > 0) {
      setDirection(-1);
      setStep(s => s - 1);
    }
  }, [step]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, next, prev]);

  const current = steps[step];
  const Icon = current.icon;
  const Illustration = ILLUSTRATIONS[step];
  const isLast = step === steps.length - 1;

  return (
    <>
      {/* Overlay */}
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(10,5,5,0.88)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      >
        {/* Card */}
        <motion.div
          className="relative w-[22rem] sm:w-[26rem] max-h-[90dvh] overflow-y-auto rounded-3xl"
          style={{
            background: 'linear-gradient(145deg, rgba(61,31,31,0.98), rgba(45,21,21,0.98))',
            border: '1px solid rgba(92,51,51,0.6)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(244,162,97,0.08)',
          }}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{
              background: 'rgba(92,51,51,0.5)',
              color: 'var(--text-muted)',
            }}
          >
            <X size={16} />
          </button>

          {/* Header */}
          <div className="px-6 pt-6 pb-3 flex items-center gap-3">
            <motion.div
              key={`icon-${step}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18 }}
            >
              <Icon size={28} style={{ color: current.accent }} />
            </motion.div>
            <motion.h2
              key={`title-${step}`}
              className="text-xl font-black"
              style={{ color: current.accent }}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
            >
              {current.title}
            </motion.h2>
          </div>

          {/* Content */}
          <div className="px-6 pb-2 min-h-[220px]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                {/* Illustration */}
                <div className="mb-4">
                  <Illustration />
                </div>

                {/* Bullets */}
                <ul className="space-y-2">
                  {current.bullets.map((text, i) => (
                    <motion.li
                      key={i}
                      className="flex items-start gap-2 text-sm leading-relaxed"
                      style={{ color: 'var(--text-secondary)' }}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.06 }}
                    >
                      <span
                        className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: current.accent }}
                      />
                      {text}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="px-6 pb-6 pt-3 flex flex-col gap-4">
            {/* Dots */}
            <div className="flex items-center justify-center gap-2">
              {steps.map((s, i) => (
                <button
                  key={s.key}
                  onClick={() => goTo(i)}
                  className="transition-all duration-300"
                  style={{
                    width: i === step ? 10 : 7,
                    height: i === step ? 10 : 7,
                    borderRadius: '50%',
                    background: i === step ? steps[step].accent : 'rgba(92,51,51,0.5)',
                    border: i === step ? `2px solid ${steps[step].accent}` : '2px solid transparent',
                  }}
                />
              ))}
            </div>

            {/* Prev / Next buttons */}
            <div className="flex items-center gap-3">
              {step > 0 ? (
                <motion.button
                  onClick={prev}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-sm transition-colors"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <ChevronLeft size={16} />
                  {t.howToPlay.prev}
                </motion.button>
              ) : (
                <div className="flex-1" />
              )}

              <motion.button
                onClick={next}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-sm ${isLast ? 'btn-primary' : ''}`}
                style={!isLast ? {
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                } : undefined}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                {isLast ? t.howToPlay.letsGo : (
                  <>
                    {t.howToPlay.next}
                    <ChevronRight size={16} />
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
