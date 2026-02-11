import { BaseMission } from './BaseMission';
import { StandardMission } from './StandardMission';
import { PassCardsMission } from './PassCardsMission';
import { PassAllCardsMission } from './PassAllCardsMission';
import { ForbiddenBetMission } from './ForbiddenBetMission';
import { IndianPokerMission } from './IndianPokerMission';
import { DrawExtraMission } from './DrawExtraMission';
import { FaceUpMission } from './FaceUpMission';
import { PeekMission } from './PeekMission';
import { NoCopyBetMission } from './NoCopyBetMission';
import { DesignatePlayerMission } from './DesignatePlayerMission';
import { HighestLowestMission } from './HighestLowestMission';
import { PenaltyNumbersMission } from './PenaltyNumbersMission';
import { CardExchangeMission } from './CardExchangeMission';
import { SuccessfulBetRewardMission } from './SuccessfulBetRewardMission';
import { ReversedValuesMission } from './ReversedValuesMission';
import { SimultaneousPlayMission } from './SimultaneousPlayMission';
import { FirstLastTrickMission } from './FirstLastTrickMission';

/**
 * Create the full deck of mission cards.
 * Each mission has a number of cards per player indicated.
 * Standard missions have varying card counts (2-5).
 */
export function createMissionDeck(includeExpert: boolean): BaseMission[] {
  const missions: BaseMission[] = [
    // Standard missions
    new PassCardsMission(3, 1, 'left'),
    new PassCardsMission(3, 1, 'right'),
    new PassCardsMission(4, 2, 'left'),
    new PassCardsMission(4, 2, 'right'),
    new PassAllCardsMission(2, 'left'),
    new PassAllCardsMission(2, 'right'),
    new ForbiddenBetMission(3, 0),
    new ForbiddenBetMission(4, 1),
    new IndianPokerMission(2),
    new IndianPokerMission(3),
    new DrawExtraMission(2),
    new DrawExtraMission(3),
    new FaceUpMission(3),
    new FaceUpMission(4),
    new PeekMission(3, 5),
    new PeekMission(4, 5),
    new NoCopyBetMission(3),
    new NoCopyBetMission(4),
    new DesignatePlayerMission(3),
    new DesignatePlayerMission(4),
    new HighestLowestMission(4),
    new HighestLowestMission(5),
    new PenaltyNumbersMission(3, [3, 5, 7]),
    new PenaltyNumbersMission(4, [10, 20, 30]),
    new CardExchangeMission(3),
    new CardExchangeMission(4),
    new StandardMission(2),
    new StandardMission(3),
    new StandardMission(4),
    new StandardMission(5),
  ];

  if (includeExpert) {
    missions.push(
      new SuccessfulBetRewardMission(3),
      new SuccessfulBetRewardMission(4),
      new ReversedValuesMission(3),
      new ReversedValuesMission(4),
      new SimultaneousPlayMission(3),
      new SimultaneousPlayMission(4),
      new PeekMission(3, 3),
      new PeekMission(4, 3),
      new FirstLastTrickMission(3),
      new FirstLastTrickMission(4),
    );
  }

  return missions;
}

/**
 * Fisher-Yates shuffle an array of missions in place
 */
export function shuffleMissions(missions: BaseMission[]): BaseMission[] {
  const shuffled = [...missions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export { BaseMission };
