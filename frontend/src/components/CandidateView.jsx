import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import webRTCService from "../services/webRTCService";

const CandidateView = () => {
  const { roomId } = useParams();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const joinInterview = async () => {
      try {
        const localStream = await webRTCService.initialize(roomId, false);
        if (mounted && localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }

        // Handle stream changes
        webRTCService.onStreamChange = (stream) => {
          if (mounted && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = stream;
            setIsConnected(true);
            setConnectionStatus("connected");
          }
        };

        // Handle connection state changes
        webRTCService.onConnectionStateChange = (state) => {
          if (mounted) {
            setConnectionStatus(state);
          }
        };

        // Handle interviewer disconnection
        webRTCService.onParticipantDisconnected = () => {
          if (mounted) {
            setIsConnected(false);
            setConnectionStatus("disconnected");
            setError("Interviewer disconnected");
          }
        };
      } catch (error) {
        if (mounted) {
          setError(error.message);
          setConnectionStatus("error");
        }
      }
    };

    joinInterview();

    return () => {
      mounted = false;
      webRTCService.cleanup();
    };
  }, [roomId]);

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        await webRTCService.startScreenShare();
        setIsScreenSharing(true);
      } else {
        await webRTCService.stopScreenShare();
        setIsScreenSharing(false);
      }
    } catch (error) {
      setError("Failed to toggle screen sharing");
    }
  };

  return (
    <div className="candidate-view">
      <div className="status-bar">
        <div className={`connection-status ${connectionStatus}`}>
          {connectionStatus === "connecting" && "Connecting to interview..."}
          {connectionStatus === "connected" && "Connected"}
          {connectionStatus === "disconnected" && "Disconnected"}
          {connectionStatus === "error" && "Connection Error"}
        </div>
      </div>

      <div className="video-grid">
        <div className="video-container remote">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="remote-video"
          />
          <div className="label">Interviewer</div>
        </div>

        <div className="video-container local">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="local-video"
          />
          <div className="label">You</div>
        </div>
      </div>

      <div className="controls">
        <button
          onClick={toggleScreenShare}
          className={`screen-share-btn ${isScreenSharing ? "active" : ""}`}
        >
          {isScreenSharing ? "Stop Sharing" : "Share Screen"}
        </button>
      </div>

      {error && <div className="error-message">Error: {error}</div>}
    </div>
  );
};

export default CandidateView;
