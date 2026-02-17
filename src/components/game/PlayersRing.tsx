'use client';

import type { ClientGamePlayer } from '@/types/game.types';
import PlayerInfo, { SEAT_COLORS } from './PlayerInfo';

interface PlayersRingProps {
  players: ClientGamePlayer[];
  myPlayerId: string;
  showBets: boolean;
}

export default function PlayersRing({
  players,
  myPlayerId,
  showBets,
}: PlayersRingProps) {
  // Reorder: put self at bottom, others distributed around
  const myIndex = players.findIndex(p => p.id === myPlayerId);
  const others = [
    ...players.slice(myIndex + 1),
    ...players.slice(0, myIndex),
  ];

  return (
    <div className="w-full flex flex-col items-center gap-3">
      {/* Other players across the top */}
      <div className="flex items-start justify-center gap-3 sm:gap-5 flex-wrap px-2">
        {others.map((player) => (
          <PlayerInfo
            key={player.id}
            player={player}
            isMe={false}
            color={SEAT_COLORS[player.seatIndex % SEAT_COLORS.length]}
            showBet={showBets}
            compact={others.length > 5}
          />
        ))}
      </div>
    </div>
  );
}
