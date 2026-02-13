'use client';

/**
 * SVG icons for each mission, keyed by mission ID prefix.
 * The mission IDs can be dynamic (e.g. "passCards-2-left"), so we match on prefix.
 */

interface MissionIconProps {
  missionId: string;
  size?: number;
  className?: string;
}

function getIconForMission(id: string): (props: { size: number }) => React.ReactElement {
  // Match prefix for dynamic IDs
  if (id.startsWith('passCards')) return PassCardsIcon;
  if (id.startsWith('passAll')) return PassAllIcon;
  if (id.startsWith('forbiddenBet')) return ForbiddenBetIcon;
  if (id.startsWith('peek')) return PeekIcon;
  if (id.startsWith('penaltyNumbers')) return PenaltyNumbersIcon;

  switch (id) {
    case 'drawExtra': return DrawExtraIcon;
    case 'faceUp': return FaceUpIcon;
    case 'noCopyBet': return NoCopyBetIcon;
    case 'designatePlayer': return DesignatePlayerIcon;
    case 'highestLowest': return HighestLowestIcon;
    case 'cardExchange': return CardExchangeIcon;
    case 'successfulBetReward': return SuccessfulBetRewardIcon;
    case 'reversedValues': return ReversedValuesIcon;
    case 'simultaneousPlay': return SimultaneousPlayIcon;
    case 'firstLastTrick': return FirstLastTrickIcon;
    default: return DefaultMissionIcon;
  }
}

export function MissionIcon({ missionId, size = 24, className }: MissionIconProps) {
  const Icon = getIconForMission(missionId);
  return (
    <span className={className}>
      <Icon size={size} />
    </span>
  );
}

// ---- Icons ----

// 1. Pass Cards - arrows going left/right with cards
function PassCardsIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="7" height="10" rx="1" />
      <rect x="14" y="9" width="7" height="10" rx="1" />
      <path d="M10 10h4" />
      <path d="M12 8l2 2-2 2" />
    </svg>
  );
}

// 2. Pass All Cards - big swap arrows
function PassAllIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="6" height="8" rx="1" />
      <rect x="16" y="10" width="6" height="8" rx="1" />
      <path d="M8 9h8" />
      <path d="M14 7l2 2-2 2" />
      <path d="M16 15H8" />
      <path d="M10 17l-2-2 2-2" />
    </svg>
  );
}

// 3. Forbidden Bet - no-entry sign over a number
function ForbiddenBetIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <line x1="5.7" y1="5.7" x2="18.3" y2="18.3" />
      <text x="12" y="16" textAnchor="middle" fontSize="9" fill="currentColor" stroke="none" fontWeight="bold">0</text>
    </svg>
  );
}

// 5. Draw Extra - card with a plus sign
function DrawExtraIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

// 6. Face Up - eye/visible cards
function FaceUpIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
      <rect x="7" y="16" width="4" height="6" rx="0.5" strokeWidth="1.2" />
      <rect x="13" y="16" width="4" height="6" rx="0.5" strokeWidth="1.2" />
    </svg>
  );
}

// 7/16. Peek - eye with clock/timer
function PeekIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
      <path d="M18 2l-1.5 3" strokeWidth="1.5" />
      <path d="M21 6l-3 1" strokeWidth="1.5" />
    </svg>
  );
}

// 8. No Copy Bet - crossed-out copy
function NoCopyBetIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="6" width="12" height="14" rx="1.5" />
      <rect x="4" y="4" width="12" height="14" rx="1.5" fill="var(--bg-primary)" />
      <line x1="3" y1="3" x2="21" y2="21" strokeWidth="2" />
    </svg>
  );
}

// 9. Designate Player - pointing hand
function DesignatePlayerIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="16" cy="7" r="4" />
      <path d="M16 11c3 0 6 2 6 5v1h-5" />
      <path d="M2 17l5-5 3 3" />
      <path d="M7 12l3-6" />
    </svg>
  );
}

// 10. Highest/Lowest - up & down arrows
function HighestLowestIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 4l-4 4h3v8H3l4 4 4-4H8V8h3z" />
      <rect x="14" y="5" width="7" height="14" rx="1.5" />
      <text x="17.5" y="14" textAnchor="middle" fontSize="7" fill="currentColor" stroke="none" fontWeight="bold">1</text>
    </svg>
  );
}

// 11. Penalty Numbers - warning triangle with numbers
function PenaltyNumbersIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 20h20L12 2z" />
      <line x1="12" y1="9" x2="12" y2="14" />
      <circle cx="12" cy="17" r="0.5" fill="currentColor" />
    </svg>
  );
}

// 12. Card Exchange - two cards with swap arrows
function CardExchangeIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="8" height="11" rx="1.5" />
      <rect x="14" y="9" width="8" height="11" rx="1.5" />
      <path d="M10 8h4" />
      <path d="M12.5 6l1.5 2-1.5 2" />
      <path d="M14 16h-4" />
      <path d="M11.5 18l-1.5-2 1.5-2" />
    </svg>
  );
}

// 13. Successful Bet Reward - trophy/star
function SuccessfulBetRewardIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2h12v4a6 6 0 0 1-12 0V2z" />
      <path d="M6 4H3v2a3 3 0 0 0 3 3" />
      <path d="M18 4h3v2a3 3 0 0 1-3 3" />
      <line x1="12" y1="12" x2="12" y2="16" />
      <rect x="8" y="16" width="8" height="2" rx="1" />
      <path d="M12 6l1 2h2l-1.5 1.5.5 2L12 10.5 9.8 11.5l.5-2L8.5 8h2z" fill="currentColor" stroke="none" />
    </svg>
  );
}

// 14. Reversed Values - upside-down card / reversed arrow
function ReversedValuesIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <text x="12" y="11" textAnchor="middle" fontSize="6" fill="currentColor" stroke="none" fontWeight="bold">55</text>
      <path d="M9 14l3 3 3-3" />
      <text x="12" y="20" textAnchor="middle" fontSize="5" fill="currentColor" stroke="none" fontWeight="bold">1</text>
    </svg>
  );
}

// 15. Simultaneous Play - multiple cards playing at once
function SimultaneousPlayIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="6" width="7" height="10" rx="1" transform="rotate(-10 4.5 11)" />
      <rect x="8.5" y="5" width="7" height="10" rx="1" />
      <rect x="16" y="6" width="7" height="10" rx="1" transform="rotate(10 19.5 11)" />
      <circle cx="12" cy="20" r="1.5" fill="currentColor" />
      <path d="M8 20h8" />
    </svg>
  );
}

// 17. First/Last Trick - 1 and star at ends
function FirstLastTrickIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="8" height="14" rx="1.5" />
      <text x="6" y="14" textAnchor="middle" fontSize="8" fill="currentColor" stroke="none" fontWeight="bold">1</text>
      <rect x="14" y="5" width="8" height="14" rx="1.5" />
      <path d="M18 9l.8 1.6h1.7l-1.3 1 .5 1.7-1.4-1-1.4 1 .5-1.7-1.3-1h1.7z" fill="currentColor" stroke="none" />
    </svg>
  );
}

// Default fallback
function DefaultMissionIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <text x="12" y="16" textAnchor="middle" fontSize="10" fill="currentColor" stroke="none" fontWeight="bold">?</text>
    </svg>
  );
}
