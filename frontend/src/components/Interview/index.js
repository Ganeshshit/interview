import { useEffect, useState } from 'react';
import { interviewService } from '../../services/api';
import WebSocketService from '../../services/websocket';

// Use in component
const Interview = () => {
    useEffect(() => {
        // Connect to WebSocket
        WebSocketService.connect(process.env.REACT_APP_WEBSOCKET_URL);

        // Setup API and WebSocket handlers
        const setupInterview = async () => {
            try {
                // Get interview details
                const { interview } = await interviewService.getInterview(interviewId);
                
                // Join interview
                await interviewService.joinInterview(interviewId, userId);

                // Setup WebSocket listeners
                WebSocketService.on('signal', handleSignal);
                WebSocketService.on('user-joined', handleUserJoined);
                WebSocketService.on('user-left', handleUserLeft);
            } catch (error) {
                console.error('Setup error:', error);
            }
        };

        setupInterview();

        return () => {
            WebSocketService.disconnect();
        };
    }, []);

    // ... rest of the component code
}; 