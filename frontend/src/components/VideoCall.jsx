import { useEffect, useRef } from 'react';
import useWebRTC from '../hooks/useWebRTC';

const VideoCall = ({ roomId, isInterviewer }) => {
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    const { startCall, endCall } = useWebRTC(localVideoRef, remoteVideoRef, roomId, isInterviewer);

    useEffect(() => {
        startCall();

        return () => endCall();
    }, []);

    return (
        <div>
            <video ref={localVideoRef} autoPlay muted style={{ width: '200px', border: '1px solid #ccc' }} />
            <video ref={remoteVideoRef} autoPlay style={{ width: isInterviewer ? '100%' : '200px', border: '1px solid #ccc' }} />
        </div>
    );
};

export default VideoCall;
