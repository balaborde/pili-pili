import type {
  ClientPlayer,
  RoomSettings,
  RoomState,
  BotDifficulty,
  ClientGameState,
  GamePhase,
  TrickCard,
  PlayerRoundResult,
  MissionActionPayload,
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

  // Game
  'game:placeBet': (data: { bet: number }) => void;
  'game:playCard': (data: { cardId: number }) => void;
  'game:missionAction': (data: { action: MissionActionPayload }) => void;
  'game:chooseJokerValue': (data: { value: 0 | 56 }) => void;
  'game:acknowledgePhase': () => void;
  'game:leave': () => void;
  'game:returnToLobby': () => void;
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
  'room:gameStarted': () => void;
  'room:hostChanged': (data: { newHostId: string }) => void;

  // Game
  'game:stateUpdate': (data: { gameState: ClientGameState }) => void;
  'game:phaseChange': (data: { phase: GamePhase; gameState: ClientGameState }) => void;
  'game:trickResult': (data: { winnerId: string; winnerName: string; trick: TrickCard[] }) => void;
  'game:roundResults': (data: { results: PlayerRoundResult[] }) => void;
  'game:gameOver': (data: { standings: PlayerRoundResult[]; winnerId: string }) => void;
  'game:error': (data: { message: string }) => void;
  'game:notification': (data: { message: string; type: 'info' | 'warning' | 'success' }) => void;
  'game:playerReplacedByBot': (data: { playerId: string; botId: string; botName: string }) => void;
  'room:returnedToLobby': (data: { roomState: RoomState }) => void;
}
