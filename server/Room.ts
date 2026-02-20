import { nanoid } from 'nanoid';
import type {
  BotDifficulty,
  ClientPlayer,
  RoomSettings,
} from '../src/types/game.types';
import { DEFAULT_ROOM_SETTINGS } from '../src/types/game.types';

export interface RoomPlayer {
  id: string;
  name: string;
  isBot: boolean;
  botDifficulty?: BotDifficulty;
  isConnected: boolean;
  isReady: boolean;
  seatIndex: number;
}

export class Room {
  readonly roomCode: string;
  private players: RoomPlayer[] = [];
  private hostId: string | null = null;
  private settings: RoomSettings;
  private gameStarted = false;

  constructor(roomCode: string, settings?: Partial<RoomSettings>) {
    this.roomCode = roomCode;
    this.settings = { ...DEFAULT_ROOM_SETTINGS, ...settings };
  }

  addPlayer(name: string, isBot = false, botDifficulty?: BotDifficulty): RoomPlayer {
    const player: RoomPlayer = {
      id: nanoid(12),
      name,
      isBot,
      botDifficulty,
      isConnected: !isBot,
      isReady: isBot,
      seatIndex: this.players.length,
    };

    this.players.push(player);

    if (!this.hostId && !isBot) {
      this.hostId = player.id;
    }

    return player;
  }

  removePlayer(playerId: string): void {
    this.players = this.players.filter((p) => p.id !== playerId);

    if (this.hostId === playerId) {
      const nextHuman = this.players.find((p) => !p.isBot);
      this.hostId = nextHuman?.id ?? null;
    }
  }

  getPlayers(): RoomPlayer[] {
    return this.players;
  }

  getHostId(): string | null {
    return this.hostId;
  }

  getSettings(): RoomSettings {
    return { ...this.settings };
  }

  updateSettings(partial: Partial<RoomSettings>): void {
    this.settings = { ...this.settings, ...partial };
  }

  toggleReady(playerId: string): boolean {
    const player = this.players.find((p) => p.id === playerId);
    if (!player) return false;
    player.isReady = !player.isReady;
    return player.isReady;
  }

  setConnected(playerId: string, connected: boolean): void {
    const player = this.players.find((p) => p.id === playerId);
    if (player) player.isConnected = connected;
  }

  isGameStarted(): boolean {
    return this.gameStarted;
  }

  setGameStarted(started: boolean): void {
    this.gameStarted = started;
  }

  resetForLobby(): void {
    this.gameStarted = false;
    for (const p of this.players) {
      if (!p.isBot) p.isReady = false;
    }
  }

  canStart(): { ok: boolean; reason?: string } {
    const humans = this.players.filter((p) => !p.isBot);
    if (this.players.length < 2) {
      return { ok: false, reason: 'Il faut au moins 2 joueurs' };
    }
    const allReady = humans.every((p) => p.isReady);
    if (!allReady) {
      return { ok: false, reason: 'Tous les joueurs doivent être prêts' };
    }
    return { ok: true };
  }

  toClientPlayer(p: RoomPlayer): ClientPlayer {
    return {
      id: p.id,
      name: p.name,
      isBot: p.isBot,
      isConnected: p.isConnected,
      isReady: p.isReady,
      cardCount: 0,
      bet: null,
      tricksWon: 0,
      pilis: 0,
      seatIndex: p.seatIndex,
    };
  }
}
