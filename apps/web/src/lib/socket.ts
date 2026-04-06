import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL + '/seats', {
      autoConnect: false,
      transports: ['websocket'],
      withCredentials: true,
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
