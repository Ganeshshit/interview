import React, { useEffect, useRef, useState } from 'react';
import webRTCService from '../services/webRTCService';

const InterviewerView = ({ roomId }) => {
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        initializeCall();
        return () => webRTCService.cleanup();
    }, []);

    const initializeCall = async () => {
        try {
            // Initialize as interviewer
            const localStream = await webRTCService.initialize(roomId, true);
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = localStream;
            }

            // Setup peer connection
            const peer = webRTCService.setupPeerConnection(true);

            // Handle peer events
            peer.on('signal', data => {
                webRTCService.socket.emit('signal', {
                    signal: data,
                    roomId
                });
            });

            peer.on('stream', stream => {
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = stream;
                    setIsConnected(true);
                }
            });

            // Handle signaling
            webRTCService.socket.on('signal', ({ signal }) => {
                peer.signal(signal);
            });

        } catch (error) {
            setError('Failed to initialize call');
            console.error(error);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="relative">
                {/* Remote Video (Candidate) */}
                <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-[600px] bg-gray-900 rounded-lg"
                />
                
                {/* Local Video (Interviewer) */}
                <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute bottom-4 right-4 w-48 h-36 bg-gray-800 rounded-lg"
                />
            </div>

            {error && (
                <div className="bg-red-100 text-red-700 p-3 rounded">
                    {error}
                </div>
            )}

            <div className="flex justify-center gap-4">
                <button
                    className="px-4 py-2 bg-red-500 text-white rounded"
                    onClick={() => webRTCService.cleanup()}
                >
                    End Call
                </button>
            </div>
        </div>
    );
};

export default InterviewerView; 