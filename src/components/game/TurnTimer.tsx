'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TurnTimerProps {
  deadline: number;       // Unix ms
  duration: number;       // total seconds (settings.turnTimerSeconds)
  isMyTurn: boolean;      // highlight visuel
}

export default function TurnTimer({ deadline, duration, isMyTurn }: TurnTimerProps) {
  const [remaining, setRemaining] = useState(() => Math.max(0, deadline - Date.now()));

  useEffect(() => {
    setRemaining(Math.max(0, deadline - Date.now()));
    const interval = setInterval(() => {
      const r = Math.max(0, deadline - Date.now());
      setRemaining(r);
      if (r <= 0) clearInterval(interval);
    }, 100);
    return () => clearInterval(interval);
  }, [deadline]);

  const seconds = Math.ceil(remaining / 1000);
  const fraction = remaining / (duration * 1000); // 1 → 0

  // Circle geometry
  const size = isMyTurn ? 44 : 38;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference * (1 - fraction);

  // Color based on remaining time
  let color: string;
  if (seconds > 10) {
    color = 'var(--accent-gold)';
  } else if (seconds > 5) {
    color = 'var(--accent-orange, #f4845f)';
  } else {
    color = 'var(--accent-red)';
  }

  const isUrgent = seconds <= 5 && seconds > 0;

  return (
    <motion.div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
      animate={isUrgent ? { scale: [1, 1.08, 1] } : { scale: 1 }}
      transition={isUrgent ? { duration: 0.5, repeat: Infinity, ease: 'easeInOut' } : undefined}
    >
      {/* Glow for my turn */}
      {isMyTurn && (
        <div
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: `0 0 12px ${color}40`,
          }}
        />
      )}

      <svg
        width={size}
        height={size}
        className="absolute inset-0"
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(92,51,51,0.3)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          style={{ transition: 'stroke-dashoffset 100ms linear, stroke 300ms ease' }}
        />
      </svg>

      {/* Seconds text */}
      <span
        className="relative font-black"
        style={{ color, fontSize: isMyTurn ? 14 : 12 }}
      >
        {seconds}
      </span>
    </motion.div>
  );
}
