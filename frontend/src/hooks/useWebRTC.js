import { useEffect, useRef } from 'react';
import { socket } from '../utils/websocket';

const useWebRTC = (localVideoRef, remoteVideoRef, roomId, isInterviewer) => {
    const peerConnection = useRef(null);

    useEffect(() => {
        const configuration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
            ],
        };

        peerConnection.current = new RTCPeerConnection(configuration);

        peerConnection.current.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('ice-candidate', { roomId, candidate: event.candidate });
            }
        };

        peerConnection.current.ontrack = (event) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };

        socket.on('offer', async (offer) => {
            if (!isInterviewer) {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
                const answer = await peerConnection.current.createAnswer();
                await peerConnection.current.setLocalDescription(answer);
                socket.emit('answer', { roomId, answer });
            }
        });

        socket.on('answer', async (answer) => {
            await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
        });

        socket.on('ice-candidate', async ({ candidate }) => {
            if (candidate) {
                await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
            }
        });

        const startCall = async () => {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            stream.getTracks().forEach((track) => peerConnection.current.addTrack(track, stream));

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            if (isInterviewer) {
                const offer = await peerConnection.current.createOffer();
                await peerConnection.current.setLocalDescription(offer);
                socket.emit('offer', { roomId, offer });
            }
        };

        const endCall = () => {
            peerConnection.current.close();
            socket.emit('endCall', { roomId });
        };

        return { startCall, endCall };
    }, [roomId, isInterviewer]);

    return {};
};

export default useWebRTC;
