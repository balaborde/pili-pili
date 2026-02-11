import { nanoid } from 'nanoid';
import { GameEngine } from '../game/GameEngine';
import type { RoomSettings } from '../../src/types/game.types';
import { ROOM_CODE_LENGTH } from '../../src/lib/constants';

class RoomStore {
  private rooms = new Map<string, GameEngine>();
  // Map socket.id → { roomCode, playerId, sessionToken }
  private socketToPlayer = new Map<string, { roomCode: string; playerId: string; sessionToken: string }>();
  // Map sessionToken → { roomCode, playerId, socketId }
  private sessions = new Map<string, { roomCode: string; playerId: string; socketId: string }>();

  generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No ambiguous chars
    let code = '';
    for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    // Ensure unique
    if (this.rooms.has(code)) return this.generateRoomCode();
    return code;
  }

  createRoom(settings?: Partial<RoomSettings>): GameEngine {
    const code = this.generateRoomCode();
    const engine = new GameEngine(code, settings);
    this.rooms.set(code, engine);
    return engine;
  }

  getRoom(code: string): GameEngine | undefined {
    return this.rooms.get(code.toUpperCase());
  }

  deleteRoom(code: string): void {
    const room = this.rooms.get(code);
    if (room) {
      // Clean up all sessions for this room
      for (const [token, session] of this.sessions) {
        if (session.roomCode === code) {
          this.sessions.delete(token);
          this.socketToPlayer.delete(session.socketId);
        }
      }
      this.rooms.delete(code);
    }
  }

  registerSocket(
    socketId: string,
    roomCode: string,
    playerId: string
  ): string {
    const sessionToken = nanoid(20);
    this.socketToPlayer.set(socketId, { roomCode, playerId, sessionToken });
    this.sessions.set(sessionToken, { roomCode, playerId, socketId });
    return sessionToken;
  }

  getPlayerBySocket(socketId: string): { roomCode: string; playerId: string; sessionToken: string } | undefined {
    return this.socketToPlayer.get(socketId);
  }

  getSessionByToken(token: string): { roomCode: string; playerId: string; socketId: string } | undefined {
    return this.sessions.get(token);
  }

  updateSocketId(sessionToken: string, newSocketId: string): void {
    const session = this.sessions.get(sessionToken);
    if (session) {
      // Remove old socket mapping
      this.socketToPlayer.delete(session.socketId);
      // Update
      session.socketId = newSocketId;
      this.socketToPlayer.set(newSocketId, {
        roomCode: session.roomCode,
        playerId: session.playerId,
        sessionToken,
      });
    }
  }

  removeSocket(socketId: string): { roomCode: string; playerId: string } | undefined {
    const info = this.socketToPlayer.get(socketId);
    if (info) {
      this.socketToPlayer.delete(socketId);
      return { roomCode: info.roomCode, playerId: info.playerId };
    }
    return undefined;
  }

  getRoomCount(): number {
    return this.rooms.size;
  }

  // Garbage collect empty rooms
  cleanup(): void {
    for (const [code, engine] of this.rooms) {
      const hasConnectedPlayers = engine.getPlayers().some((p) => p.isConnected);
      if (!hasConnectedPlayers && engine.getPlayers().length === 0) {
        this.deleteRoom(code);
      }
    }
  }
}

// Singleton
export const roomStore = new RoomStore();
