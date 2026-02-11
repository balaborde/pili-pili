'use client';

import type { ClientPlayer } from '@/types/game.types';

interface PiliTrackerProps {
  players: ClientPlayer[];
  piliLimit: number;
  myPlayerId: string | null;
}

export function PiliTracker({ players, piliLimit, myPlayerId }: PiliTrackerProps) {
  const sorted = [...players].sort((a, b) => a.pilis - b.pilis);

  return (
    <div className="bg-surface rounded-xl border border-border p-3">
      <h4 className="text-xs font-bold text-text-muted mb-2 uppercase tracking-wider">
        Score
      </h4>
      <div className="space-y-1.5">
        {sorted.map((player) => {
          const ratio = player.pilis / piliLimit;
          return (
            <div key={player.id} className="flex items-center gap-2">
              <span
                className={`text-xs font-semibold truncate w-16 ${
                  player.id === myPlayerId ? 'text-accent-gold' : 'text-foreground'
                }`}
              >
                {player.name}
              </span>
              <div className="flex-1 h-2 bg-background rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    ratio >= 0.8
                      ? 'bg-accent-red'
                      : ratio >= 0.5
                        ? 'bg-accent-orange'
                        : 'bg-accent-green'
                  }`}
                  style={{ width: `${(ratio * 100).toFixed(0)}%` }}
                />
              </div>
              <span className="text-xs text-text-muted w-8 text-right font-mono">
                {player.pilis}/{piliLimit}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
