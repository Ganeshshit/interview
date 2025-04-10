import io from 'socket.io-client';

class WebSocketService {
    constructor() {
        this.socket = null;
        this.callbacks = new Map();
    }

    connect(url) {
        this.socket = io(url);
        this.setupListeners();
    }

    setupListeners() {
        this.socket.on('connect', () => {
            console.log('Connected to WebSocket server');
            this.trigger('connect');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from WebSocket server');
            this.trigger('disconnect');
        });

        this.socket.on('signal', (data) => {
            this.trigger('signal', data);
        });

        this.socket.on('user-joined', (data) => {
            this.trigger('user-joined', data);
        });

        this.socket.on('user-left', (data) => {
            this.trigger('user-left', data);
        });
    }

    on(event, callback) {
        if (!this.callbacks.has(event)) {
            this.callbacks.set(event, []);
        }
        this.callbacks.get(event).push(callback);
    }

    off(event, callback) {
        if (this.callbacks.has(event)) {
            const callbacks = this.callbacks.get(event);
            const index = callbacks.indexOf(callback);
            if (index !== -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    trigger(event, data) {
        if (this.callbacks.has(event)) {
            this.callbacks.get(event).forEach(callback => callback(data));
        }
    }

    emit(event, data) {
        if (this.socket) {
            this.socket.emit(event, data);
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

export default new WebSocketService(); 


