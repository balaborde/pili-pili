import type {
  Card,
  ClientGameState,
  ClientPlayer,
  GamePhase,
  MissionCardDef,
  PlayedCard,
  PlayerScore,
  RoomSettings,
  RoomState,
  RoundScoringData,
  Trick,
  BotDifficulty,
} from './game.types';

// ============================================================
// Socket.io Event Maps
// ============================================================

export interface ClientToServerEvents {
  // Room / Lobby
  'room:create': (data: { playerName: string; settings?: Partial<RoomSettings> }) => void;
  'room:join': (data: { roomCode: string; playerName: string }) => void;
  'room:leave': () => void;
  'room:addBot': (data: { difficulty: BotDifficulty }) => void;
  'room:removeBot': (data: { botId: string }) => void;
  'room:toggleReady': () => void;
  'room:startGame': () => void;
  'room:updateSettings': (data: Partial<RoomSettings>) => void;

  // Game actions
  'game:placeBet': (data: { bet: number }) => void;
  'game:playCard': (data: { cardId: string; jokerDeclaredValue?: number }) => void;
  'game:passCards': (data: { cardIds: string[] }) => void;
  'game:exchangeCard': (data: { cardId: string; targetPlayerId: string }) => void;
  'game:designatePlayer': (data: { targetPlayerId: string }) => void;
  'game:acknowledgePeek': () => void;
  'game:ackRoundEnd': () => void;

  // Reconnection
  'player:reconnect': (data: { sessionToken: string; roomCode: string }) => void;
}

export interface ServerToClientEvents {
  // Room / Lobby
  'room:created': (data: { roomCode: string; playerId: string; sessionToken: string }) => void;
  'room:joined': (data: { roomState: RoomState; playerId: string; sessionToken: string }) => void;
  'room:playerJoined': (data: { player: ClientPlayer }) => void;
  'room:playerLeft': (data: { playerId: string }) => void;
  'room:botAdded': (data: { bot: ClientPlayer }) => void;
  'room:botRemoved': (data: { botId: string }) => void;
  'room:readyChanged': (data: { playerId: string; ready: boolean }) => void;
  'room:settingsUpdated': (data: RoomSettings) => void;
  'room:error': (data: { message: string }) => void;

  // Game State Updates
  'game:started': (data: { state: ClientGameState }) => void;
  'game:phaseChanged': (data: { phase: GamePhase; phaseData?: Record<string, unknown> }) => void;
  'game:missionRevealed': (data: { mission: MissionCardDef }) => void;
  'game:cardsDealt': (data: { hand: Card[]; totalCards: number }) => void;
  'game:betPlaced': (data: { playerId: string; bet: number }) => void;
  'game:allBetsRevealed': (data: { bets: { playerId: string; bet: number }[] }) => void;
  'game:betError': (data: { message: string }) => void;
  'game:turnChanged': (data: { currentPlayerIndex: number }) => void;
  'game:cardPlayed': (data: { playerId: string; play: PlayedCard }) => void;
  'game:playError': (data: { message: string }) => void;
  'game:trickWon': (data: { winnerId: string; trick: Trick }) => void;
  'game:cardsPassRequired': (data: { direction: 'left' | 'right'; count: number }) => void;
  'game:cardsReceived': (data: { cards: Card[] }) => void;
  'game:exchangeRequired': (data: { withPlayerId: string }) => void;
  'game:designateRequired': () => void;
  'game:peekStart': (data: { durationMs: number }) => void;
  'game:peekEnd': () => void;
  'game:handUpdate': (data: { hand: Card[] }) => void;
  'game:roundScoring': (data: RoundScoringData) => void;
  'game:roundEnd': (data: { scores: PlayerScore[] }) => void;
  'game:over': (data: { finalStandings: PlayerScore[]; eliminatedId: string }) => void;
  'game:stateSync': (data: { state: ClientGameState }) => void;

  // Visibility (mission-specific)
  'game:opponentHandsRevealed': (data: { hands: { playerId: string; cards: Card[] }[] }) => void;
  'game:indianPokerReveal': (data: { otherPlayersCards: { playerId: string; cards: Card[] }[] }) => void;

  // Player status
  'player:disconnected': (data: { playerId: string }) => void;
  'player:reconnected': (data: { playerId: string }) => void;
}
