'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fr } from './locales/fr';
import { en } from './locales/en';
import { de } from './locales/de';
import { es } from './locales/es';
import type { Translations } from './locales/fr';

const LOCALES = { fr, en, de, es } as const;
type Locale = keyof typeof LOCALES;
const SUPPORTED = Object.keys(LOCALES) as Locale[];

interface LocaleContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: 'en',
  setLocale: () => {},
});

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  // SSR-safe default — corrected on client via useEffect
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    const stored = localStorage.getItem('pili-locale') as Locale | null;
    if (stored && SUPPORTED.includes(stored)) {
      setLocaleState(stored);
    } else {
      const detected = navigator.language.slice(0, 2) as Locale;
      setLocaleState(SUPPORTED.includes(detected) ? detected : 'en');
    }
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem('pili-locale', l);
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useI18n(): { t: Translations; locale: Locale; setLocale: (l: Locale) => void } {
  const { locale, setLocale } = useContext(LocaleContext);
  const t = useMemo(() => LOCALES[locale] as Translations, [locale]);
  return { t, locale, setLocale };
}

const LOCALE_OPTIONS: { code: Locale; flag: string; label: string }[] = [
  { code: 'fr', flag: '🇫🇷', label: 'FR' },
  { code: 'en', flag: '🇬🇧', label: 'EN' },
  { code: 'de', flag: '🇩🇪', label: 'DE' },
  { code: 'es', flag: '🇪🇸', label: 'ES' },
];

export function LocaleSwitcher() {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LOCALE_OPTIONS.find(o => o.code === locale)!;

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div
      ref={ref}
      style={{ position: 'fixed', top: '12px', left: '12px', zIndex: 30 }}
    >
      {/* Trigger button */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '5px 9px',
          borderRadius: '10px',
          fontSize: '11px',
          fontWeight: 700,
          border: '1.5px solid rgba(244,162,97,0.45)',
          background: open ? 'rgba(244,162,97,0.12)' : 'rgba(26,10,10,0.7)',
          color: 'var(--accent-gold)',
          cursor: 'pointer',
          lineHeight: 1,
          backdropFilter: 'blur(6px)',
        }}
      >
        <span>{current.label}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ display: 'flex', opacity: 0.7, marginLeft: '1px' }}
        >
          ▾
        </motion.span>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -4 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              padding: '4px',
              borderRadius: '12px',
              background: 'rgba(35,15,15,0.97)',
              border: '1.5px solid rgba(92,51,51,0.5)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              backdropFilter: 'blur(8px)',
              minWidth: '80px',
              transformOrigin: 'top left',
            }}
          >
            {LOCALE_OPTIONS.filter(o => o.code !== locale).map(({ code, flag, label }) => (
              <button
                key={code}
                onClick={() => { setLocale(code); setOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 8px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  border: 'none',
                  background: 'transparent',
                  color: 'rgba(255,255,255,0.6)',
                  cursor: 'pointer',
                  transition: 'background 0.12s, color 0.12s',
                  width: '100%',
                  textAlign: 'left',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(244,162,97,0.1)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent-gold)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.6)';
                }}
              >
                <span>{label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
