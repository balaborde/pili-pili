import type { Translations } from './fr';

export const es: Translations = {

  /* ─── Inicio ─── */
  home: {
    tagline: '¡El juego de bazas que pica!',
    footer: '2–8 jugadores · Bazas, apuestas y misiones',
    howToPlay: '¿Cómo jugar?',
    nameLabel: 'Tu apodo',
    namePlaceholder: 'Espelette',
    nameError: '¡Introduce tu nombre!',
    roomCodeError: '¡Introduce el código de sala!',
    createGame: 'Crear partida',
    joinGame: 'Unirse a partida',
    launchRoom: 'Iniciar sala',
    creating: 'Creando...',
    joining: 'Conectando...',
    join: 'Unirse',
    back: 'Volver',
    roomCodeLabel: 'Código de sala',
  },

  /* ─── Sala ─── */
  lobby: {
    room: 'Sala',
    copied: '¡Copiado!',
    copy: 'Copiar',
    players: 'Jugadores',
    host: 'Anfitrión',
    me: '(yo)',
    ready: 'Listo',
    waiting: 'Esperando...',
    remove: 'Eliminar',
    addBot: 'Añadir bot',
    loading: 'Cargando...',
    toggleReadyOn: '¡Estoy listo!',
    toggleReadyOff: 'Cancelar listo',
    startGame: 'Iniciar partida',
    startGameReady: '🌶️ ¡Iniciar partida!',
    leave: 'Salir de la sala',
    howToPlay: '¿Cómo jugar?',
    yes: 'Sí',
    no: 'No',
    settingsTitle: 'Configuración',
    piliLimit: 'Límite de pilis 🌶️',
    piliLimitSub: 'Pilis antes de eliminación',
    turnTimer: 'Temporizador',
    turnTimerSub: 'Segundos por acción',
    expertMissions: 'Misiones experto',
    expertMissionsSub: 'Misiones más complejas',
    botEasy: 'Fácil',
    botMedium: 'Medio',
    botHard: 'Experto',
    bot: 'Bot',
  },

  /* ─── Partida ─── */
  game: {
    loading: 'Cargando partida...',
    round: (n: number) => `Ronda ${n}`,
    dealing: 'Repartiendo cartas...',
    preBetting: 'Preparando...',
    myBettingTurn: '¡Es tu turno de apostar!',
    otherBetting: (name: string) => `${name} está apostando...`,
    missionActionRequired: '¡Acción de misión requerida!',
    exchangeInProgress: 'Intercambios en curso...',
    waitingOthers: 'Esperando a otros jugadores...',
    playACard: '¡Juega una carta!',
    myPlayTurn: '¡Es tu turno!',
    otherPlaying: (name: string) => `${name} está jugando...`,
    resolvingTrick: 'Resolviendo baza...',
    pilis: (n: number) => `${n} pili${n !== 1 ? 's' : ''}`,
    bet: 'Apuesta',
    tricks: 'Bazas',
    leaveTitle: '¿Salir de la partida?',
    leaveBody: 'Serás reemplazado por un bot. La partida continuará sin ti.',
    leaveCancel: 'Cancelar',
    leaveConfirm: 'Salir',
    leaveAriaLabel: 'Salir de la partida',
    meLabel: 'Tú',
  },

  /* ─── Apuestas ─── */
  betting: {
    title: 'Tu apuesta',
    subtitle: '¿Cuántas bazas vas a ganar?',
    constraintInfo: (sum: number) => `Suma actual: ${sum} —`,
    forbiddenBet: (n: number) => `La apuesta ${n} está prohibida`,
    noRestriction: 'Sin restricción',
    confirmBet: (n: number) => `Apostar ${n} baza${n !== 1 ? 's' : ''}`,
    chooseBet: 'Elige una apuesta',
  },

  /* ─── Revelación de misión ─── */
  missionReveal: {
    tapToContinue: 'Toca para continuar',
    expert: 'Experto',
    cardPerPlayer: (n: number) => `${n} carta${n > 1 ? 's' : ''} / jugador`,
  },

  /* ─── Info de misión ─── */
  missionInfo: {
    expert: 'Experto',
    cardCount: (n: number) => `${n} carta${n > 1 ? 's' : ''}`,
  },

  /* ─── Área de juego ─── */
  playArea: {
    trickCounter: (n: number, total: number) => `Baza ${n}/${total}`,
    totalTricks: (total: number) => `${total} bazas`,
    waitingLabel: 'Esperando',
    simultaneousLabel: 'Simultáneo',
  },

  /* ─── Mano del jugador ─── */
  playerHand: {
    playCard: 'Jugar esta carta',
    tapHint: 'Toca una carta para jugarla',
  },

  /* ─── Acción de misión ─── */
  missionAction: {
    jokerTitle: 'Valor del Joker',
    jokerSubtitle: 'Elige el poder de tu Joker',
    jokerWeak: 'Más débil',
    jokerStrong: 'Más fuerte',
    passTitle: (count: number, direction: string) =>
      `Elige ${count} carta${count > 1 ? 's' : ''} para dar ${direction}`,
    passProgress: (selected: number, total: number) =>
      `${selected}/${total} seleccionada${selected > 1 ? 's' : ''}`,
    passDirectionLeft: 'a la izquierda',
    passDirectionRight: 'a la derecha',
    confirm: 'Confirmar',
    victimTitle: 'Designar víctima',
    victimSubtitle: 'También recibirás sus pilis al final de la ronda',
  },

  /* ─── Resultado de baza ─── */
  trickResult: {
    winsTheTrick: (name: string) => `¡${name} gana la baza!`,
    withCard: (value: string | number) => `con la carta ${value}`,
    jokerName: '★ Joker',
  },

  /* ─── Resultados de ronda ─── */
  roundResults: {
    title: (n: number) => `Resultados — Ronda ${n}`,
    colPlayer: 'Jugador',
    colBet: 'Apuesta',
    colTricks: 'Bazas',
    colGap: 'Diferencia',
    colPilis: 'Pilis',
    continue: 'Continuar',
  },

  /* ─── Fin de partida ─── */
  gameOver: {
    title: '¡Fin de la partida!',
    winner: (name: string) => `¡${name} gana!`,
    backToLobby: 'Volver al lobby',
  },

  /* ─── Modal "Cómo jugar" ─── */
  howToPlay: {
    prev: 'Anterior',
    next: 'Siguiente',
    letsGo: '¡Vamos!',
    forbiddenBetLabel: (n: number) => `¡Apuesta ${n} prohibida!`,
    scoreBet: 'Apuesta',
    scoreTricks: 'Bazas',
    scoreGap: 'Diferencia',
    missionCardPass: 'Pase de cartas',
    missionSimultaneous: 'Juego simultáneo',
    missionBlind: 'Apuestas a ciegas',
    missionExpert: 'Misión experto',
    steps: {
      goal: {
        title: 'El objetivo',
        bullets: [
          '2 a 8 jugadores (humanos o bots)',
          'Cada error te cuesta pilis 🌶️',
          'Demasiados pilis y quedas eliminado',
          '¡El último en pie gana!',
        ],
      },
      cards: {
        title: 'Cartas y bazas',
        bullets: [
          '55 cartas numeradas del 1 al 55',
          'La carta más alta gana la baza',
          'El Joker vale 0 (la más baja) o 56 (la más alta)',
        ],
      },
      bets: {
        title: 'Apuestas',
        bullets: [
          'Apuesta cuántas bazas vas a ganar',
          'El orden de apuesta rota cada ronda',
          'El último apostador no puede hacer que el total sea igual al número de bazas',
        ],
      },
      score: {
        title: 'Puntuación',
        bullets: [
          'La diferencia entre tu apuesta y tus bazas = pilis recibidos',
          'Ejemplo: apuesta 2, ganado 4 → +2 🌶️',
          'Las misiones añaden bonificaciones o penalizaciones',
          'Límite alcanzado → eliminado de la partida',
        ],
      },
      missions: {
        title: 'Misiones',
        bullets: [
          'Cada ronda tiene una misión única que cambia las reglas',
          'Ejemplos: pase de cartas, juego simultáneo, apuestas a ciegas…',
          'Las misiones experto son opcionales y más difíciles 🌶️',
        ],
      },
    },
  },

};
