import { nanoid } from 'nanoid';
import { Room } from '../Room';
import type { RoomSettings } from '../../src/types/game.types';
import { ROOM_CODE_LENGTH } from '../../src/lib/constants';

class RoomStore {
  private rooms = new Map<string, Room>();
  private socketToPlayer = new Map<string, { roomCode: string; playerId: string; sessionToken: string }>();
  private sessions = new Map<string, { roomCode: string; playerId: string; socketId: string }>();

  generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    if (this.rooms.has(code)) return this.generateRoomCode();
    return code;
  }

  createRoom(settings?: Partial<RoomSettings>): Room {
    const code = this.generateRoomCode();
    const room = new Room(code, settings);
    this.rooms.set(code, room);
    return room;
  }

  getRoom(code: string): Room | undefined {
    return this.rooms.get(code.toUpperCase());
  }

  deleteRoom(code: string): void {
    const room = this.rooms.get(code);
    if (room) {
      for (const [token, session] of this.sessions) {
        if (session.roomCode === code) {
          this.sessions.delete(token);
          this.socketToPlayer.delete(session.socketId);
        }
      }
      this.rooms.delete(code);
    }
  }

  registerSocket(socketId: string, roomCode: string, playerId: string): string {
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
      this.socketToPlayer.delete(session.socketId);
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

  cleanup(): void {
    for (const [code, room] of this.rooms) {
      if (room.getPlayers().length === 0) {
        this.deleteRoom(code);
      }
    }
  }
}

export const roomStore = new RoomStore();
