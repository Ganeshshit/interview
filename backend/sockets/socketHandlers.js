const { EventEmitter } = require('events');
const Interview = require('../models/Interview');

// Store active rooms and their participants
const rooms = new Map();

// Create a room emitter for each room
const getRoomEmitter = (roomId) => {
    if (!rooms.has(roomId)) {
        rooms.set(roomId, {
            emitter: new EventEmitter(),
            participants: new Set(),
            offers: [],
            answers: [],
            iceCandidates: []
        });
    }
    return rooms.get(roomId);
};


const setupSocket = (io) => {
    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        const { roomId, userId, role } = socket.handshake.query;
        // const { roomId, userId, role } = { "67ee63f3e392209e0633bfef","67ee66b847940ea981ae4384 "} // Extract roomId, userId, and role from query parameters
        // const roomId = "67ee63f3e392209e0633bfef"
        // const userId = "67ee66b847940ea981ae4384"
        // const role = "candidate" // Extract roomId, userId, and role from query parameters
        if (!roomId || !userId || !role) {
            console.log('Invalid connection attempt:', { roomId, userId, role });
            socket.disconnect();
            return;
        }

        const room = getRoomEmitter(roomId);
        room.participants.add(userId);
        socket.join(roomId);

        // Send connection confirmation
        socket.emit('connection-confirmed', {
            roomId,
            userId,
            role,
            timestamp: new Date()
        });

        // Handle WebRTC signaling
        socket.on('offer', async (data) => {
            try {
                const { offer } = data;
                room.offers.push(offer);
                socket.to(roomId).emit('offer', offer);
            } catch (error) {
                console.error('Error handling offer:', error);
            }
        });

        socket.on('answer', async (data) => {
            try {
                const { answer } = data;
                room.answers.push(answer);
                socket.to(roomId).emit('answer', answer);
            } catch (error) {
                console.error('Error handling answer:', error);
            }
        });

        socket.on('ice-candidate', async (data) => {
            try {
                const { candidate } = data;
                room.iceCandidates.push(candidate);
                socket.to(roomId).emit('ice-candidate', candidate);
            } catch (error) {
                console.error('Error handling ICE candidate:', error);
            }
        });

        // Handle chat messages
        socket.on('chat-message', (data) => {
            try {
                const { message } = data;
                io.to(roomId).emit('chat-message', message);
            } catch (error) {
                console.error('Error handling chat message:', error);
            }
        });

        // Handle code updates
        socket.on('code-update', (data) => {
            try {
                const { code, language } = data;
                io.to(roomId).emit('code-update', { code, language });
            } catch (error) {
                console.error('Error handling code update:', error);
            }
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
            if (room) {
                room.participants.delete(userId);
                if (room.participants.size === 0) {
                    rooms.delete(roomId);
                }
                io.to(roomId).emit('participant-left', {
                    userId,
                    timestamp: new Date()
                });
            }
        });

        // Handle errors
        socket.on('error', (error) => {
            console.error('Socket error:', error);
        });
    });
};

module.exports = setupSocket;
