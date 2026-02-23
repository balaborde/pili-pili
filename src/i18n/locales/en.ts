import type { Translations } from './fr';

export const en: Translations = {

  /* ─── Home ─── */
  home: {
    tagline: 'The card game that stings!',
    footer: '2–8 players · Tricks, bets & missions',
    howToPlay: 'How to play?',
    nameLabel: 'Your nickname',
    namePlaceholder: 'Espelette',
    nameError: 'Enter your name!',
    roomCodeError: 'Enter the room code!',
    createGame: 'Create a game',
    joinGame: 'Join a game',
    launchRoom: 'Launch room',
    creating: 'Creating...',
    joining: 'Connecting...',
    join: 'Join',
    back: 'Back',
    roomCodeLabel: 'Room code',
  },

  /* ─── Lobby ─── */
  lobby: {
    room: 'Room',
    copied: 'Copied!',
    copy: 'Copy',
    players: 'Players',
    host: 'Host',
    me: '(you)',
    ready: 'Ready',
    waiting: 'Waiting...',
    remove: 'Remove',
    addBot: 'Add a bot',
    loading: 'Loading...',
    toggleReadyOn: "I'm ready!",
    toggleReadyOff: 'Cancel Ready',
    startGame: 'Start game',
    startGameReady: '🌶️ Start the game!',
    leave: 'Leave room',
    howToPlay: 'How to play?',
    yes: 'Yes',
    no: 'No',
    settingsTitle: 'Game settings',
    piliLimit: 'Pili limit 🌶️',
    piliLimitSub: 'Pilis before elimination',
    turnTimer: 'Turn timer',
    turnTimerSub: 'Seconds per action',
    expertMissions: 'Expert missions',
    expertMissionsSub: 'More complex missions',
    botEasy: 'Easy',
    botMedium: 'Medium',
    botHard: 'Expert',
    bot: 'Bot',
  },

  /* ─── Game ─── */
  game: {
    loading: 'Loading game...',
    round: (n: number) => `Round ${n}`,
    dealing: 'Dealing cards...',
    preBetting: 'Preparing...',
    myBettingTurn: "It's your turn to bet!",
    otherBetting: (name: string) => `${name} is betting...`,
    missionActionRequired: 'Mission action required!',
    exchangeInProgress: 'Exchanges in progress...',
    waitingOthers: 'Waiting for other players...',
    playACard: 'Play a card!',
    myPlayTurn: "It's your turn!",
    otherPlaying: (name: string) => `${name} is playing...`,
    resolvingTrick: 'Resolving trick...',
    pilis: (n: number) => `${n} pili${n !== 1 ? 's' : ''}`,
    bet: 'Bet',
    tricks: 'Tricks',
    leaveTitle: 'Leave game?',
    leaveBody: 'You will be replaced by a bot. The game will continue without you.',
    leaveCancel: 'Cancel',
    leaveConfirm: 'Leave',
    leaveAriaLabel: 'Leave game',
    meLabel: 'You',
  },

  /* ─── Betting ─── */
  betting: {
    title: 'Your bet',
    subtitle: 'How many tricks will you win?',
    constraintInfo: (sum: number) => `Current sum: ${sum} —`,
    forbiddenBet: (n: number) => `Bet ${n} is forbidden`,
    noRestriction: 'No restriction',
    confirmBet: (n: number) => `Bet ${n} trick${n !== 1 ? 's' : ''}`,
    chooseBet: 'Choose a bet',
  },

  /* ─── Mission reveal ─── */
  missionReveal: {
    tapToContinue: 'Tap to continue',
    expert: 'Expert',
    cardPerPlayer: (n: number) => `${n} card${n > 1 ? 's' : ''} / player`,
  },

  /* ─── Mission info ─── */
  missionInfo: {
    expert: 'Expert',
    cardCount: (n: number) => `${n} card${n > 1 ? 's' : ''}`,
  },

  /* ─── Play area ─── */
  playArea: {
    trickCounter: (n: number, total: number) => `Trick ${n}/${total}`,
    totalTricks: (total: number) => `${total} tricks`,
    waitingLabel: 'Waiting',
    simultaneousLabel: 'Simultaneous',
  },

  /* ─── Player hand ─── */
  playerHand: {
    playCard: 'Play this card',
    tapHint: 'Tap a card to play it',
  },

  /* ─── Mission action ─── */
  missionAction: {
    jokerTitle: 'Joker Value',
    jokerSubtitle: 'Choose the power of your Joker',
    jokerWeak: 'Weakest',
    jokerStrong: 'Strongest',
    passTitle: (count: number, direction: string) =>
      `Choose ${count} card${count > 1 ? 's' : ''} to give ${direction}`,
    passProgress: (selected: number, total: number) =>
      `${selected}/${total} selected`,
    passDirectionLeft: 'to the left',
    passDirectionRight: 'to the right',
    confirm: 'Confirm',
    victimTitle: 'Designate a victim',
    victimSubtitle: 'You will also receive their pilis at the end of the round',
  },

  /* ─── Trick result ─── */
  trickResult: {
    winsTheTrick: (name: string) => `${name} wins the trick!`,
    withCard: (value: string | number) => `with card ${value}`,
    jokerName: '★ Joker',
  },

  /* ─── Round results ─── */
  roundResults: {
    title: (n: number) => `Results — Round ${n}`,
    colPlayer: 'Player',
    colBet: 'Bet',
    colTricks: 'Tricks',
    colGap: 'Gap',
    colPilis: 'Pilis',
    continue: 'Continue',
  },

  /* ─── Game over ─── */
  gameOver: {
    title: 'Game over!',
    winner: (name: string) => `${name} wins!`,
    backToLobby: 'Back to lobby',
  },

  /* ─── How to play modal ─── */
  howToPlay: {
    prev: 'Previous',
    next: 'Next',
    letsGo: "Let's go!",
    forbiddenBetLabel: (n: number) => `Bet ${n} forbidden!`,
    scoreBet: 'Bet',
    scoreTricks: 'Tricks',
    scoreGap: 'Gap',
    missionCardPass: 'Card passing',
    missionSimultaneous: 'Simultaneous play',
    missionBlind: 'Blind bets',
    missionExpert: 'Expert mission',
    steps: {
      goal: {
        title: 'The goal',
        bullets: [
          '2 to 8 players (human or bots)',
          'Each mistake costs you pilis 🌶️',
          "Too many pilis and you're eliminated",
          'Last one standing wins!',
        ],
      },
      cards: {
        title: 'Cards & tricks',
        bullets: [
          '55 numbered cards from 1 to 55',
          'The highest card wins the trick',
          'The Joker is worth 0 (lowest) or 56 (highest)',
        ],
      },
      bets: {
        title: 'Bets',
        bullets: [
          "Bet how many tricks you'll win",
          'Betting order rotates each round',
          "The last bettor can't make the total equal to the number of tricks",
        ],
      },
      score: {
        title: 'Score',
        bullets: [
          'The gap between your bet and your tricks = pilis received',
          'Example: bet 2, won 4 → +2 🌶️',
          'Missions add bonuses or penalties',
          'Limit reached → eliminated from the game',
        ],
      },
      missions: {
        title: 'Missions',
        bullets: [
          'Each round has a unique mission that changes the rules',
          'Examples: card passing, simultaneous play, blind bets…',
          'Expert missions are optional and trickier 🌶️',
        ],
      },
    },
  },

};
