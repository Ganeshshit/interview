import { useState, useEffect } from 'react';
import { socket } from '../utils/websocket';

const Chat = ({ roomId }) => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        socket.emit('joinRoom', roomId);

        socket.on('message', (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        return () => {
            socket.emit('leaveRoom', roomId);
        };
    }, [roomId]);

    const sendMessage = () => {
        if (message.trim()) {
            socket.emit('sendMessage', { roomId, message });
            setMessage('');
        }
    };

    return (
        <div>
            <div>
                {messages.map((msg, idx) => (
                    <div key={idx}>{msg}</div>
                ))}
            </div>
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
            />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
};

export default Chat;
