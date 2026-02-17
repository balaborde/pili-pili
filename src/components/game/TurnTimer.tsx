'use client';

import { motion } from 'framer-motion';

interface TurnTimerProps {
  secondsRemaining: number;
  totalSeconds: number;
}

export default function TurnTimer({
  secondsRemaining,
  totalSeconds,
}: TurnTimerProps) {
  const progress = secondsRemaining / totalSeconds;
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const color = progress > 0.5
    ? 'var(--accent-green)'
    : progress > 0.2
    ? 'var(--accent-gold)'
    : 'var(--accent-red)';

  return (
    <div className="relative w-11 h-11 flex items-center justify-center">
      <svg
        className="absolute inset-0 -rotate-90"
        width={44}
        height={44}
        viewBox="0 0 44 44"
      >
        {/* Background circle */}
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke="rgba(92,51,51,0.3)"
          strokeWidth="3"
        />
        {/* Progress circle */}
        <motion.circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transition={{ duration: 0.5 }}
        />
      </svg>
      <span
        className="text-xs font-black relative"
        style={{ color }}
      >
        {secondsRemaining}
      </span>
    </div>
  );
}
