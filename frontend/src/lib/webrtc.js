import { sendSignal } from './signaling';

const peerConnection = new RTCPeerConnection({
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        {
            urls: 'turn:your-turn-server.com',
            username: 'user',
            credential: 'password',
        },
    ],
});

// Handle local stream
export const startStream = async (localVideoRef) => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideoRef.current.srcObject = stream;
    stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));
};

// Handle offer creation
export const createOffer = async () => {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    sendSignal({ type: 'offer', offer });
};

// Handle received offer
export const handleOffer = async (offer) => {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    sendSignal({ type: 'answer', answer });
};

// Handle ICE candidates
peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
        sendSignal({ type: 'candidate', candidate: event.candidate });
    }
};

peerConnection.ontrack = (event) => {
    const remoteVideo = document.getElementById('remoteVideo');
    remoteVideo.srcObject = event.streams[0];
};
