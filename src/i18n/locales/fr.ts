export const fr = {

  /* ─── Accueil ─── */
  home: {
    tagline: 'Le jeu de plis qui pique\u00a0!',
    footer: '2–8 joueurs · Plis, paris & missions',
    howToPlay: 'Comment jouer\u00a0?',
    nameLabel: 'Ton pseudo',
    namePlaceholder: 'Espelette',
    nameError: 'Entre ton nom\u00a0!',
    roomCodeError: 'Entre le code de la room\u00a0!',
    createGame: 'Créer une partie',
    joinGame: 'Rejoindre une partie',
    launchRoom: 'Lancer la room',
    creating: 'Création...',
    joining: 'Connexion...',
    join: 'Rejoindre',
    back: 'Retour',
    roomCodeLabel: 'Code de la room',
  },

  /* ─── Lobby ─── */
  lobby: {
    room: 'Room',
    copied: 'Copié\u00a0!',
    copy: 'Copier',
    players: 'Joueurs',
    host: 'Hôte',
    me: '(toi)',
    ready: 'Prêt',
    waiting: 'En attente...',
    remove: 'Retirer',
    addBot: 'Ajouter un bot',
    loading: 'Chargement...',
    toggleReadyOn: 'Je suis prêt\u00a0!',
    toggleReadyOff: 'Annuler Prêt',
    startGame: 'Lancer la partie',
    startGameReady: '🌶️ Lancer la partie\u00a0!',
    leave: 'Quitter la room',
    howToPlay: 'Comment jouer\u00a0?',
    yes: 'Oui',
    no: 'Non',
    settingsTitle: 'Paramètres de la partie',
    piliLimit: 'Limite de pilis 🌶️',
    piliLimitSub: 'Pilis avant élimination',
    turnTimer: 'Timer par tour',
    turnTimerSub: 'Secondes par action',
    expertMissions: 'Missions expert',
    expertMissionsSub: 'Missions plus complexes',
    botEasy: 'Facile',
    botMedium: 'Moyen',
    botHard: 'Expert',
    bot: 'Bot',
  },

  /* ─── Partie ─── */
  game: {
    loading: 'Chargement de la partie...',
    round: (n: number) => `Manche ${n}`,
    dealing: 'Distribution des cartes...',
    preBetting: 'Préparation...',
    myBettingTurn: 'C\'est votre tour de parier\u00a0!',
    otherBetting: (name: string) => `${name} est en train de parier...`,
    missionActionRequired: 'Action de mission requise\u00a0!',
    exchangeInProgress: 'Échanges en cours...',
    waitingOthers: 'En attente des autres joueurs...',
    playACard: 'Jouez une carte\u00a0!',
    myPlayTurn: 'C\'est votre tour\u00a0!',
    otherPlaying: (name: string) => `${name} joue...`,
    resolvingTrick: 'Résolution du pli...',
    pilis: (n: number) => `${n} pili${n !== 1 ? 's' : ''}`,
    bet: 'Pari',
    tricks: 'Plis',
    leaveTitle: 'Quitter la partie\u00a0?',
    leaveBody: 'Vous serez remplacé par un bot. La partie continuera sans vous.',
    leaveCancel: 'Annuler',
    leaveConfirm: 'Quitter',
    leaveAriaLabel: 'Quitter la partie',
    meLabel: 'Toi',
  },

  /* ─── Paris ─── */
  betting: {
    title: 'Votre pari',
    subtitle: 'Combien de plis allez-vous remporter\u00a0?',
    constraintInfo: (sum: number) => `Somme actuelle\u00a0: ${sum} —`,
    forbiddenBet: (n: number) => `Le pari ${n} est interdit`,
    noRestriction: 'Pas de restriction',
    confirmBet: (n: number) => `Parier ${n} pli${n !== 1 ? 's' : ''}`,
    chooseBet: 'Choisissez un pari',
  },

  /* ─── Révélation de mission ─── */
  missionReveal: {
    tapToContinue: 'Touchez pour continuer',
    expert: 'Expert',
    cardPerPlayer: (n: number) => `${n} carte${n > 1 ? 's' : ''} / joueur`,
  },

  /* ─── Info mission ─── */
  missionInfo: {
    expert: 'Expert',
    cardCount: (n: number) => `${n} carte${n > 1 ? 's' : ''}`,
  },

  /* ─── Zone de jeu ─── */
  playArea: {
    trickCounter: (n: number, total: number) => `Pli ${n}/${total}`,
    totalTricks: (total: number) => `${total} plis`,
    waitingLabel: 'En attente',
    simultaneousLabel: 'Simultané',
  },

  /* ─── Main du joueur ─── */
  playerHand: {
    playCard: 'Jouer cette carte',
    tapHint: 'Touchez une carte pour la jouer',
  },

  /* ─── Actions de mission ─── */
  missionAction: {
    jokerTitle: 'Valeur du Joker',
    jokerSubtitle: 'Choisissez la puissance de votre Joker',
    jokerWeak: 'Plus faible',
    jokerStrong: 'Plus fort',
    passTitle: (count: number, direction: string) =>
      `Choisir ${count} carte${count > 1 ? 's' : ''} à donner ${direction}`,
    passProgress: (selected: number, total: number) =>
      `${selected}/${total} sélectionnée${selected > 1 ? 's' : ''}`,
    passDirectionLeft: 'à gauche',
    passDirectionRight: 'à droite',
    confirm: 'Confirmer',
    victimTitle: 'Désigner une victime',
    victimSubtitle: 'Vous recevrez aussi ses pilis en fin de manche',
  },

  /* ─── Résultat du pli ─── */
  trickResult: {
    winsTheTrick: (name: string) => `${name} remporte le pli\u00a0!`,
    withCard: (value: string | number) => `avec la carte ${value}`,
    jokerName: '★ Joker',
  },

  /* ─── Résultats de manche ─── */
  roundResults: {
    title: (n: number) => `Résultats — Manche ${n}`,
    colPlayer: 'Joueur',
    colBet: 'Pari',
    colTricks: 'Plis',
    colGap: 'Écart',
    colPilis: 'Pilis',
    continue: 'Continuer',
  },

  /* ─── Fin de partie ─── */
  gameOver: {
    title: 'Fin de partie\u00a0!',
    winner: (name: string) => `${name} remporte la victoire\u00a0!`,
    backToLobby: 'Retour au lobby',
  },

  /* ─── Modal "Comment jouer" ─── */
  howToPlay: {
    prev: 'Précédent',
    next: 'Suivant',
    letsGo: 'C\'est parti\u00a0!',
    forbiddenBetLabel: (n: number) => `Pari ${n} interdit\u00a0!`,
    scoreBet: 'Pari',
    scoreTricks: 'Plis',
    scoreGap: 'Écart',
    missionCardPass: 'Passe de cartes',
    missionSimultaneous: 'Jeu simultané',
    missionBlind: 'Paris à l\'aveugle',
    missionExpert: 'Mission expert',
    steps: {
      goal: {
        title: 'Le but du jeu',
        bullets: [
          '2 à 8 joueurs (humains ou bots)',
          'Chaque erreur vous coûte des pilis\u00a0🌶️',
          'Trop de pilis et vous êtes éliminé',
          'Le dernier debout gagne\u00a0!',
        ],
      },
      cards: {
        title: 'Les cartes & les plis',
        bullets: [
          '55 cartes numérotées de 1 à 55',
          'La carte la plus forte remporte le pli',
          'Le Joker vaut 0 (la plus faible) ou 56 (la plus forte)',
        ],
      },
      bets: {
        title: 'Les paris',
        bullets: [
          'Pariez combien de plis vous allez gagner',
          "L'ordre de pari tourne chaque manche",
          'Le dernier parieur ne peut pas faire en sorte que le total des paris soit égal au nombre de plis',
        ],
      },
      score: {
        title: 'Le score',
        bullets: [
          "L'écart entre votre pari et vos plis = pilis reçus",
          'Exemple\u00a0: pari 2, gagné 4 → +2\u00a0🌶️',
          'Les missions ajoutent des bonus ou malus',
          'Limite atteinte → éliminé de la partie',
        ],
      },
      missions: {
        title: 'Les missions',
        bullets: [
          'Chaque manche a une mission unique qui change les règles',
          "Exemples\u00a0: passe de cartes, jeu simultané, paris à l'aveugle\u2026",
          'Les missions expert sont optionnelles et plus corsées\u00a0🌶️',
        ],
      },
    },
  },

};

export type Translations = typeof fr;
