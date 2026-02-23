import type { Translations } from './fr';

export const de: Translations = {

  /* ─── Startseite ─── */
  home: {
    tagline: 'Das Stichspiel, das brennt!',
    footer: '2–8 Spieler · Stiche, Wetten & Missionen',
    howToPlay: 'Spielanleitung?',
    nameLabel: 'Dein Spitzname',
    namePlaceholder: 'Espelette',
    nameError: 'Gib deinen Namen ein!',
    roomCodeError: 'Gib den Raumcode ein!',
    createGame: 'Spiel erstellen',
    joinGame: 'Spiel beitreten',
    launchRoom: 'Raum starten',
    creating: 'Erstelle...',
    joining: 'Verbinde...',
    join: 'Beitreten',
    back: 'Zurück',
    roomCodeLabel: 'Raumcode',
  },

  /* ─── Lobby ─── */
  lobby: {
    room: 'Raum',
    copied: 'Kopiert!',
    copy: 'Kopieren',
    players: 'Spieler',
    host: 'Gastgeber',
    me: '(ich)',
    ready: 'Bereit',
    waiting: 'Warte...',
    remove: 'Entfernen',
    addBot: 'Bot hinzufügen',
    loading: 'Laden...',
    toggleReadyOn: 'Ich bin bereit!',
    toggleReadyOff: 'Nicht bereit',
    startGame: 'Spiel starten',
    startGameReady: '🌶️ Spiel starten!',
    leave: 'Raum verlassen',
    howToPlay: 'Spielanleitung?',
    yes: 'Ja',
    no: 'Nein',
    settingsTitle: 'Spieleinstellungen',
    piliLimit: 'Pili-Limit 🌶️',
    piliLimitSub: 'Pilis vor Ausscheidung',
    turnTimer: 'Zugtimer',
    turnTimerSub: 'Sekunden pro Aktion',
    expertMissions: 'Expertenmissionen',
    expertMissionsSub: 'Komplexere Missionen',
    botEasy: 'Leicht',
    botMedium: 'Mittel',
    botHard: 'Experte',
    bot: 'Bot',
  },

  /* ─── Spiel ─── */
  game: {
    loading: 'Spiel wird geladen...',
    round: (n: number) => `Runde ${n}`,
    dealing: 'Karten werden ausgeteilt...',
    preBetting: 'Vorbereitung...',
    myBettingTurn: 'Du bist mit Wetten dran!',
    otherBetting: (name: string) => `${name} wettet...`,
    missionActionRequired: 'Missionsaktion erforderlich!',
    exchangeInProgress: 'Tausch läuft...',
    waitingOthers: 'Warte auf andere Spieler...',
    playACard: 'Spiel eine Karte!',
    myPlayTurn: 'Du bist dran!',
    otherPlaying: (name: string) => `${name} spielt...`,
    resolvingTrick: 'Stich wird ausgewertet...',
    pilis: (n: number) => `${n} Pili${n !== 1 ? 's' : ''}`,
    bet: 'Wette',
    tricks: 'Stiche',
    leaveTitle: 'Spiel verlassen?',
    leaveBody: 'Du wirst durch einen Bot ersetzt. Das Spiel läuft ohne dich weiter.',
    leaveCancel: 'Abbrechen',
    leaveConfirm: 'Verlassen',
    leaveAriaLabel: 'Spiel verlassen',
    meLabel: 'Du',
  },

  /* ─── Wetten ─── */
  betting: {
    title: 'Deine Wette',
    subtitle: 'Wie viele Stiche wirst du gewinnen?',
    constraintInfo: (sum: number) => `Aktuelle Summe: ${sum} —`,
    forbiddenBet: (n: number) => `Wette ${n} ist verboten`,
    noRestriction: 'Keine Einschränkung',
    confirmBet: (n: number) => `${n} Stich${n !== 1 ? 'e' : ''} wetten`,
    chooseBet: 'Wette wählen',
  },

  /* ─── Missionsoffenbarung ─── */
  missionReveal: {
    tapToContinue: 'Zum Fortfahren tippen',
    expert: 'Experte',
    cardPerPlayer: (n: number) => `${n} Karte${n > 1 ? 'n' : ''} / Spieler`,
  },

  /* ─── Missionsinfo ─── */
  missionInfo: {
    expert: 'Experte',
    cardCount: (n: number) => `${n} Karte${n > 1 ? 'n' : ''}`,
  },

  /* ─── Spielfeld ─── */
  playArea: {
    trickCounter: (n: number, total: number) => `Stich ${n}/${total}`,
    totalTricks: (total: number) => `${total} Stiche`,
    waitingLabel: 'Warte',
    simultaneousLabel: 'Simultan',
  },

  /* ─── Spielerhand ─── */
  playerHand: {
    playCard: 'Diese Karte spielen',
    tapHint: 'Tippe auf eine Karte, um sie zu spielen',
  },

  /* ─── Missionsaktion ─── */
  missionAction: {
    jokerTitle: 'Joker-Wert',
    jokerSubtitle: 'Wähle die Stärke deines Jokers',
    jokerWeak: 'Schwächste',
    jokerStrong: 'Stärkste',
    passTitle: (count: number, direction: string) =>
      `${count} Karte${count > 1 ? 'n' : ''} zum Weitergeben wählen ${direction}`,
    passProgress: (selected: number, total: number) =>
      `${selected}/${total} ausgewählt`,
    passDirectionLeft: 'nach links',
    passDirectionRight: 'nach rechts',
    confirm: 'Bestätigen',
    victimTitle: 'Opfer bestimmen',
    victimSubtitle: 'Du erhältst auch seine Pilis am Ende der Runde',
  },

  /* ─── Stichergebnis ─── */
  trickResult: {
    winsTheTrick: (name: string) => `${name} gewinnt den Stich!`,
    withCard: (value: string | number) => `mit Karte ${value}`,
    jokerName: '★ Joker',
  },

  /* ─── Rundenergebnisse ─── */
  roundResults: {
    title: (n: number) => `Ergebnisse — Runde ${n}`,
    colPlayer: 'Spieler',
    colBet: 'Wette',
    colTricks: 'Stiche',
    colGap: 'Differenz',
    colPilis: 'Pilis',
    continue: 'Weiter',
  },

  /* ─── Spielende ─── */
  gameOver: {
    title: 'Spielende!',
    winner: (name: string) => `${name} gewinnt!`,
    backToLobby: 'Zurück zur Lobby',
  },

  /* ─── Spielanleitung ─── */
  howToPlay: {
    prev: 'Vorherige',
    next: 'Weiter',
    letsGo: "Los geht's!",
    forbiddenBetLabel: (n: number) => `Wette ${n} verboten!`,
    scoreBet: 'Wette',
    scoreTricks: 'Stiche',
    scoreGap: 'Differenz',
    missionCardPass: 'Kartenweitergabe',
    missionSimultaneous: 'Simultanspiel',
    missionBlind: 'Blindwetten',
    missionExpert: 'Expertenmission',
    steps: {
      goal: {
        title: 'Das Ziel',
        bullets: [
          '2 bis 8 Spieler (Mensch oder Bot)',
          'Jeder Fehler kostet dich Pilis 🌶️',
          'Zu viele Pilis und du scheidest aus',
          'Der Letzte gewinnt!',
        ],
      },
      cards: {
        title: 'Karten & Stiche',
        bullets: [
          '55 nummerierte Karten von 1 bis 55',
          'Die höchste Karte gewinnt den Stich',
          'Der Joker ist 0 (niedrigste) oder 56 (höchste) wert',
        ],
      },
      bets: {
        title: 'Wetten',
        bullets: [
          'Wette, wie viele Stiche du gewinnen wirst',
          'Die Wettreihenfolge rotiert jede Runde',
          'Der letzte Wettende darf die Summe nicht gleich der Sticheanzahl machen',
        ],
      },
      score: {
        title: 'Punkte',
        bullets: [
          'Differenz zwischen Wette und Stichen = erhaltene Pilis',
          'Beispiel: Wette 2, gewonnen 4 → +2 🌶️',
          'Missionen fügen Boni oder Malus hinzu',
          'Limit erreicht → aus dem Spiel ausgeschieden',
        ],
      },
      missions: {
        title: 'Missionen',
        bullets: [
          'Jede Runde hat eine einzigartige Mission, die die Regeln ändert',
          'Beispiele: Kartenweitergabe, Simultanspiel, Blindwetten…',
          'Expertenmissionen sind optional und schwieriger 🌶️',
        ],
      },
    },
  },

};
