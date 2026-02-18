import { registerMission, type Mission } from './index';
import type { Card } from '../../src/types/game.types';

const expert1: Mission = {
  id: 101,
  name: 'Valeurs inversées',
  description: 'Le 55 est le plus faible, le 1 est le plus fort !',
  difficulty: 'expert',
  icon: '🔀',
  getCardsPerPlayer: () => 6,
  invertValues: true,
};

const expert2: Mission = {
  id: 102,
  name: 'Front expert',
  description: 'Comme les cartes sur le front, mais avec plus de cartes.',
  difficulty: 'expert',
  icon: '🤯',
  getCardsPerPlayer: () => 3,
  preBetting: () => ({ foreheadCards: true }),
  getVisibility: (ctx, viewerId) => {
    const visible: Record<string, Card[]> = {};
    for (const p of ctx.players) {
      if (p.id !== viewerId) {
        visible[p.id] = [...p.hand];
      }
    }
    return visible;
  },
};

const expert3: Mission = {
  id: 103,
  name: 'Pénalité premier/dernier',
  description: 'Le gagnant du premier et du dernier pli reçoit 1 pili en plus.',
  difficulty: 'expert',
  icon: '⚠️',
  getCardsPerPlayer: () => 6,
  afterTrick: (ctx, winnerId) => {
    if (ctx.trickNumber === 1 || ctx.trickNumber === ctx.totalTricks) {
      return { extraPilis: [{ playerId: winnerId, amount: 1, reason: 'Pénalité premier/dernier pli' }] };
    }
    return {};
  },
};

const expert4: Mission = {
  id: 104,
  name: 'Paris différents',
  description: 'Vous ne pouvez pas parier la même chose que le joueur précédent.',
  difficulty: 'expert',
  icon: '🎲',
  getCardsPerPlayer: () => 6,
  getBettingConstraints: () => ({ differentFromPrevious: true }),
};

const expert5: Mission = {
  id: 105,
  name: 'Carte extrême',
  description: 'Vous devez toujours jouer votre carte la plus forte ou la plus faible.',
  difficulty: 'expert',
  icon: '📊',
  getCardsPerPlayer: () => 5,
  validatePlay: (ctx, playerId, card) => {
    const player = ctx.players.find(p => p.id === playerId);
    if (!player || player.hand.length <= 1) return { valid: true };
    const values = player.hand.map(c => c.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    if (card.value !== min && card.value !== max) {
      return { valid: false, reason: 'Vous devez jouer votre carte la plus forte ou la plus faible.' };
    }
    return { valid: true };
  },
};

function createCursedMission(id: number, cursedNumbers: number[]): Mission {
  return {
    id,
    name: `Numéros maudits (${cursedNumbers.join(', ')})`,
    description: `Les plis contenant les cartes ${cursedNumbers.join(', ')} donnent 1 pili au gagnant.`,
    difficulty: 'expert',
    icon: '☠️',
    getCardsPerPlayer: () => 5,
    afterTrick: (ctx, winnerId) => {
      const hasCursed = ctx.trickCards?.some(tc => cursedNumbers.includes(tc.card.value));
      if (hasCursed) {
        return { extraPilis: [{ playerId: winnerId, amount: 1, reason: 'Numéro maudit dans le pli' }] };
      }
      return {};
    },
  };
}

const expert6 = createCursedMission(106, [7, 13, 44]);
const expert7 = createCursedMission(107, [21, 33, 55]);
const expert8 = createCursedMission(108, [3, 17, 42]);

const expert9: Mission = {
  id: 109,
  name: 'Désignation de victime',
  description: 'Désignez un joueur. Vous recevrez aussi ses pilis en fin de manche.',
  difficulty: 'expert',
  icon: '🎯',
  getCardsPerPlayer: () => 5,
  getRequiredAction: (phase) =>
    phase === 'postBetting' ? { type: 'DESIGNATE_VICTIM', excludeSelf: true } : null,
};

[expert1, expert2, expert3, expert4, expert5, expert6, expert7, expert8, expert9].forEach(registerMission);
