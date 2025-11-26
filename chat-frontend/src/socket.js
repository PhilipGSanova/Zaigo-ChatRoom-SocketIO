import { io } from 'socket.io-client';

let socket;

export const connectSocket = (token) => {
  socket = io('https://zaigo-chatroom-socketio.onrender.com', {
    auth: { token },
    transports: ['websocket', 'polling'],
    withCredentials: true
  });

  socket.on('connect', () => console.log('Socket connected', socket.id));
  socket.on('connect_error', (err) => console.error('Socket connect error:', err.message));
  return socket;
};

export const getSocket = () => socket;
