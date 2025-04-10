import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000'; // Replace with your backend URL

export const socket = io(SOCKET_URL, {
    transports: ['websocket'],
    reconnectionAttempts: 5, // Try to reconnect up to 5 times
    reconnectionDelay: 1000, // 1 second between each attempt
});

socket.on('connect', () => {
    console.log('Connected to WebSocket server');
});

socket.on('disconnect', () => {
    console.log('Disconnected from WebSocket server');
});

socket.on('connect_error', (err) => {
    console.error('Connection error:', err);
});
