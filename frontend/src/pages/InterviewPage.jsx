"use client";
import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CodeEditor from "../components/CodeEditor";
import { webrtcService } from "../services/webrtc";
import { socketService } from "../services/socketService";
import { toast } from "react-hot-toast";

const InterviewPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  
  // Video refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  
  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  useEffect(() => {
    initializeInterview();
    return () => cleanup();
  }, [roomId]);

  const initializeInterview = async () => {
    try {
      setLoading(true);

      // Initialize socket connection
      socketService.connect(user.id, user.role);

      // Initialize WebRTC
      await webrtcService.initialize(roomId, user.role === 'interviewer');
      
      // Set up local video stream
      const localStream = await webrtcService.startLocalStream();
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }

      // Handle remote stream
      webrtcService.onRemoteStream = (stream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
        }
      };

      // Handle connection state changes
      webrtcService.onConnectionStateChange = (state) => {
        setIsConnected(state === 'connected');
        if (state === 'connected') {
          toast.success('Connected successfully!');
        } else if (state === 'disconnected') {
          toast.error('Connection lost');
        }
      };

      setLoading(false);
    } catch (error) {
      console.error('Failed to initialize interview:', error);
      setError('Failed to connect to interview');
      setLoading(false);
    }
  };

  const cleanup = () => {
    webrtcService.cleanup();
    socketService.disconnect();
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    // Emit code changes through data channel
    webrtcService.sendMessage({
      type: 'code',
      content: newCode,
      language
    });
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        await webrtcService.startScreenShare();
        setIsScreenSharing(true);
      } else {
        await webrtcService.stopScreenShare();
        setIsScreenSharing(false);
      }
    } catch (error) {
      console.error('Screen sharing error:', error);
      toast.error('Failed to toggle screen sharing');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="h-screen flex">
      {user.role === 'interviewer' ? (
        // Interviewer View
        <div className="flex flex-col w-full">
          <div className={`relative ${isFullScreen ? 'h-full' : 'h-2/3'}`}>
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 right-4">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-48 h-36 rounded-lg"
              />
            </div>
            <div className="absolute bottom-4 left-4 space-x-2">
              <button onClick={toggleFullScreen}>
                {isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
              </button>
              <button onClick={toggleScreenShare}>
                {isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
              </button>
            </div>
          </div>
          {!isFullScreen && (
            <div className="h-1/3 p-4">
              <CodeEditor
                value={code}
                language={language}
                readOnly={true}
                onChange={() => {}}
              />
            </div>
          )}
        </div>
      ) : (
        // Candidate View
        <div className="flex w-full">
          <div className="w-2/3 p-4">
            <CodeEditor
              value={code}
              language={language}
              onChange={handleCodeChange}
            />
            {currentQuestion && (
              <div className="mt-4 p-4 bg-gray-100 rounded">
                <h3 className="font-bold">{currentQuestion.title}</h3>
                <p>{currentQuestion.description}</p>
              </div>
            )}
          </div>
          <div className="w-1/3 p-4">
            <div className="h-1/3 mb-4">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="h-1/4">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="mt-4 space-x-2">
              <button onClick={toggleScreenShare}>
                {isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewPage;
