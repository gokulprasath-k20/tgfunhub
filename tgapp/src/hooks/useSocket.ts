'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';

let globalSocket: Socket | null = null;

export function useSocket() {
  const { user } = useAuthStore();
  const [socket, setSocket] = useState<Socket | null>(globalSocket);
  const [isConnected, setIsConnected] = useState<boolean>(globalSocket?.connected || false);

  useEffect(() => {
    if (!globalSocket && user?.id) {
      globalSocket = io(window.location.origin, {
        path: '/socket.io',
        auth: { userId: user.id },
        reconnectionDelay: 1000,
        reconnection: true,
        reconnectionAttempts: 10,
        transports: ['websocket'],
        agent: false,
        upgrade: false,
        rejectUnauthorized: false,
      });

      globalSocket.on('connect', () => {
        setIsConnected(true);
      });

      globalSocket.on('disconnect', () => {
        setIsConnected(false);
      });
    }

    setSocket(globalSocket);

    return () => {
      // Keep alive while logged in
    };
  }, [user?.id]);

  return { socket, isConnected };
}
