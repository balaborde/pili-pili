'use client';

import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from '@/types/socket.types';

type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let globalSocket: AppSocket | null = null;

export function getSocket(): AppSocket {
  if (!globalSocket) {
    globalSocket = io({
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
  }
  return globalSocket;
}

export function useSocket(): AppSocket {
  const socket = getSocket();

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
  }, [socket]);

  return socket;
}
