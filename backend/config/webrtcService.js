const { Server } = require('socket.io');

class WebRTCService {
    constructor(server) {
        this.io = new Server(server, {
            cors: {
                origin: "http://localhost:5173",
                methods: ["GET", "POST"]
            }
        });

        this.rooms = new Map();
        this.setupSocketHandlers();
    }

    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            const userId = socket.handshake.auth.userId;
            
            socket.on('join-interview', ({ roomId, role }) => {
                socket.join(roomId);
                
                if (!this.rooms.has(roomId)) {
                    this.rooms.set(roomId, new Set());
                }
                this.rooms.get(roomId).add({ socketId: socket.id, userId, role });

                // Notify others in the room
                socket.to(roomId).emit('user-joined', { userId, role });
            }); 

            socket.on('offer', ({ roomId, offer }) => {
                socket.to(roomId).emit('offer', { offer, from: userId });
            });

            socket.on('answer', ({ roomId, answer }) => {
                socket.to(roomId).emit('answer', { answer, from: userId });
            });

            socket.on('ice-candidate', ({ roomId, candidate }) => {
                socket.to(roomId).emit('ice-candidate', { candidate, from: userId });
            });

            socket.on('chat-message', ({ roomId, message }) => {
                this.io.to(roomId).emit('chat-message', {
                    ...message,
                    from: userId
                });
            });

            socket.on('code-update', ({ roomId, code, language }) => {
                socket.to(roomId).emit('code-update', { code, language });
            });

            socket.on('disconnect', () => {
                // Remove user from all rooms they were in
                this.rooms.forEach((participants, roomId) => {
                    const wasInRoom = Array.from(participants).some(p => p.socketId === socket.id);
                    if (wasInRoom) {
                        participants.delete(Array.from(participants).find(p => p.socketId === socket.id));
                        this.io.to(roomId).emit('user-left', { userId });
                    }
                });
            });
        });
    }

    getRoomParticipants(roomId) {
        return Array.from(this.rooms.get(roomId) || []);
    }
}

module.exports = WebRTCService; 