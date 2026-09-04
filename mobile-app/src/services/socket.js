import io from 'socket.io-client';

// Replace with your computer's IP address
const SOCKET_URL = 'http://YOUR_COMPUTER_IP:5000';  // ← CHANGE THIS

let socket = null;

export const initializeSocket = () => {
  socket = io(SOCKET_URL, {
    transports: ['websocket'],
    autoConnect: true,
  });

  socket.on('connect', () => {
    console.log('Socket connected');
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};