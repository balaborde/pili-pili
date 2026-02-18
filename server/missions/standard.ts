import { registerMission, type Mission } from './index';

const mission1: Mission = {
  id: 1,
  name: 'Échange horaire',
  description: 'Après les paris, donnez 2 cartes au joueur à votre gauche.',
  difficulty: 'standard',
  icon: '🔄',
  getCardsPerPlayer: () => 6,
  getRequiredAction: (phase) =>
    phase === 'postBetting' ? { type: 'CHOOSE_CARDS_TO_PASS', count: 2, direction: 'left' } : null,
};

const mission2: Mission = {
  id: 2,
  name: 'Échange antihoraire',
  description: 'Après les paris, donnez 2 cartes au joueur à votre droite.',
  difficulty: 'standard',
  icon: '🔃',
  getCardsPerPlayer: () => 6,
  getRequiredAction: (phase) =>
    phase === 'postBetting' ? { type: 'CHOOSE_CARDS_TO_PASS', count: 2, direction: 'right' } : null,
};

const mission3: Mission = {
  id: 3,
  name: 'Rotation complète',
  description: 'Après les paris, donnez toutes vos cartes au joueur suivant.',
  difficulty: 'standard',
  icon: '🌀',
  getCardsPerPlayer: () => 3,
  postBetting: () => ({ passEntireHand: true }),
};

const mission4: Mission = {
  id: 4,
  name: 'Jeu simultané',
  description: 'Tous les joueurs jouent leur carte en même temps !',
  difficulty: 'standard',
  icon: '⚡',
  getCardsPerPlayer: () => 6,
  isSimultaneous: true,
};

const mission5: Mission = {
  id: 5,
  name: 'Paris interdit : 1',
  description: 'Impossible de parier 1.',
  difficulty: 'standard',
  icon: '🚫',
  getCardsPerPlayer: () => 5,
  getBettingConstraints: () => ({ forbiddenValues: [1] }),
};

const mission6: Mission = {
  id: 6,
  name: 'Paris interdit : 0',
  description: 'Impossible de parier 0.',
  difficulty: 'standard',
  icon: '🚫',
  getCardsPerPlayer: () => 4,
  getBettingConstraints: () => ({ forbiddenValues: [0] }),
};

const mission7: Mission = {
  id: 7,
  name: 'Pioche bonus',
  description: 'Après les paris, chaque joueur pioche 1 carte supplémentaire.',
  difficulty: 'standard',
  icon: '🎴',
  getCardsPerPlayer: () => 2,
  postBetting: () => ({ extraDraws: 1 }),
};

const mission8: Mission = {
  id: 8,
  name: 'Cartes sur le front',
  description: 'Placez votre carte sur le front : les autres la voient, pas vous !',
  difficulty: 'standard',
  icon: '🤦',
  getCardsPerPlayer: () => 1,
  preBetting: () => ({ foreheadCards: true }),
  getVisibility: (ctx, viewerId) => {
    const visible: Record<string, import('../../src/types/game.types').Card[]> = {};
    for (const p of ctx.players) {
      if (p.id !== viewerId) {
        visible[p.id] = [...p.hand];
      }
    }
    return visible;
  },
};

const mission9: Mission = {
  id: 9,
  name: 'Cartes visibles',
  description: 'Après les paris, toutes les cartes sont jouées face visible.',
  difficulty: 'standard',
  icon: '👁️',
  getCardsPerPlayer: () => 4,
  postBetting: () => ({ revealAllHands: true }),
};

const mission10: Mission = {
  id: 10,
  name: 'Paris aveugle',
  description: 'Pariez avant de voir vos cartes !',
  difficulty: 'standard',
  icon: '🙈',
  getCardsPerPlayer: () => 3,
  preBetting: () => ({ blindBetting: true, dealAfterBetting: true }),
};

const mission11: Mission = {
  id: 11,
  name: 'Bonus réussite',
  description: 'Si votre pari est exact, retirez autant de pilis que la valeur de votre pari.',
  difficulty: 'standard',
  icon: '🎯',
  getCardsPerPlayer: () => 6,
  afterRound: (ctx) => {
    const removals = ctx.players
      .filter(p => p.bet !== null && p.bet === p.tricksWon && p.bet > 0)
      .map(p => ({ playerId: p.id, amount: p.bet! }));
    return { bonusRemovals: removals };
  },
};

[mission1, mission2, mission3, mission4, mission5, mission6,
 mission7, mission8, mission9, mission10, mission11].forEach(registerMission);
