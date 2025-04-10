import { io } from 'socket.io-client';

class WebRTCService {
    constructor() {
        this.socket = null;
        this.peerConnection = null;
        this.localStream = null;
        this.remoteStream = null;
        this.isInitiator = false;
        this.roomId = null;
        this.onStreamCallback = null;
        this.onRemoteStreamCallback = null;
    }

    async initialize(roomId, isInterviewer) {
        this.roomId = roomId;
        this.isInitiator = isInterviewer;

        // Connect to signaling server
        this.socket = io(import.meta.env.VITE_SOCKET_URL);
        this.setupSocketListeners();

        // Create peer connection
        await this.createPeerConnection();

        // Get user media
        await this.setupLocalStream();

        // Join room
        this.socket.emit('join-room', {
            roomId: this.roomId,
            isInterviewer: this.isInitiator
        });
    }

    setupSocketListeners() {
        // Handle user joined event
        this.socket.on('user-joined', async ({ userId, isInitiator }) => {
            console.log('User joined:', userId);
            if (this.isInitiator) {
                await this.createAndSendOffer();
            }
        });

        // Handle WebRTC signaling
        this.socket.on('offer', async (data) => {
            console.log('Received offer');
            await this.handleOffer(data.offer);
        });

        this.socket.on('answer', async (data) => {
            console.log('Received answer');
            await this.handleAnswer(data.answer);
        });

        this.socket.on('ice-candidate', async (data) => {
            console.log('Received ICE candidate');
            await this.handleIceCandidate(data.candidate);
        });

        // Handle disconnection
        this.socket.on('user-left', () => {
            console.log('User left');
            this.handleUserLeft();
        });
    }

    async createPeerConnection() {
        const configuration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        };

        this.peerConnection = new RTCPeerConnection(configuration);

        // Handle ICE candidates
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.socket.emit('ice-candidate', {
                    roomId: this.roomId,
                    candidate: event.candidate
                });
            }
        };

        // Handle connection state changes
        this.peerConnection.onconnectionstatechange = () => {
            console.log('Connection state:', this.peerConnection.connectionState);
        };

        // Handle receiving remote stream
        this.peerConnection.ontrack = (event) => {
            this.remoteStream = event.streams[0];
            if (this.onRemoteStreamCallback) {
                this.onRemoteStreamCallback(this.remoteStream);
            }
        };

        // Create data channel for code sharing
        if (this.isInitiator) {
            this.dataChannel = this.peerConnection.createDataChannel('code');
            this.setupDataChannel(this.dataChannel);
        } else {
            this.peerConnection.ondatachannel = (event) => {
                this.dataChannel = event.channel;
                this.setupDataChannel(this.dataChannel);
            };
        }
    }

    setupDataChannel(channel) {
        channel.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'code') {
                // Handle code updates
                if (this.onCodeUpdateCallback) {
                    this.onCodeUpdateCallback(data.code);
                }
            }
        };

        channel.onopen = () => {
            console.log('Data channel opened');
        };

        channel.onclose = () => {
            console.log('Data channel closed');
        };
    }

    async setupLocalStream() {
        try {
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            // Add tracks to peer connection
            this.localStream.getTracks().forEach(track => {
                this.peerConnection.addTrack(track, this.localStream);
            });

            if (this.onStreamCallback) {
                this.onStreamCallback(this.localStream);
            }
        } catch (error) {
            console.error('Error accessing media devices:', error);
            throw error;
        }
    }

    async createAndSendOffer() {
        try {
            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);

            this.socket.emit('offer', {
                roomId: this.roomId,
                offer: offer
            });
        } catch (error) {
            console.error('Error creating offer:', error);
            throw error;
        }
    }

    async handleOffer(offer) {
        try {
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await this.peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(answer);

            this.socket.emit('answer', {
                roomId: this.roomId,
                answer: answer
            });
        } catch (error) {
            console.error('Error handling offer:', error);
            throw error;
        }
    }

    async handleAnswer(answer) {
        try {
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (error) {
            console.error('Error handling answer:', error);
            throw error;
        }
    }

    async handleIceCandidate(candidate) {
        try {
            await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
            console.error('Error handling ICE candidate:', error);
            throw error;
        }
    }

    handleUserLeft() {
        if (this.remoteStream) {
            this.remoteStream.getTracks().forEach(track => track.stop());
        }
        if (this.peerConnection) {
            this.peerConnection.close();
        }
        this.remoteStream = null;
        this.peerConnection = null;
    }

    // Send code updates to peer
    sendCode(code) {
        if (this.dataChannel && this.dataChannel.readyState === 'open') {
            this.dataChannel.send(JSON.stringify({
                type: 'code',
                code: code
            }));
        }
    }

    // Event listeners
    onStream(callback) {
        this.onStreamCallback = callback;
    }

    onRemoteStream(callback) {
        this.onRemoteStreamCallback = callback;
    }

    onCodeUpdate(callback) {
        this.onCodeUpdateCallback = callback;
    }

    // Cleanup
    cleanup() {
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
        }
        if (this.remoteStream) {
            this.remoteStream.getTracks().forEach(track => track.stop());
        }
        if (this.peerConnection) {
            this.peerConnection.close();
        }
        if (this.socket) {
            this.socket.disconnect();
        }
    }
}

export default new WebRTCService(); 


