import React, { useRef, useEffect, useState } from "react";
import SimplePeer from "simple-peer";
import CodeEditor from "../components/CodeEditor";
import { codingQuestions } from "../data/codingQuestions";

const CandidateInterviewPage = () => {
  // Video refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const screenShareRef = useRef(null);

  // State management
  const [peer, setPeer] = useState(null);
  const [stream, setStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [code, setCode] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [error, setError] = useState(null);

  // WebSocket reference
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize WebSocket connection
    socketRef.current = new WebSocket('ws://localhost:5000');
    setupWebSocket();
    setupMediaDevices();
    
    // Set initial question
    setCurrentQuestion(codingQuestions[0]);

    return () => {
      cleanupResources();
    };
  }, []);

  const setupWebSocket = () => {
    socketRef.current.onopen = () => {
      setConnectionStatus("connected");
      console.log("Connected to signaling server");
    };

    socketRef.current.onmessage = handleWebSocketMessage;
    socketRef.current.onerror = handleWebSocketError;
    socketRef.current.onclose = handleWebSocketClose;
  };

  const setupMediaDevices = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setStream(mediaStream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream;
      }
      initializePeerConnection(mediaStream);
    } catch (err) {
      setError("Failed to access camera/microphone. Please check permissions.");
      console.error("Media device error:", err);
    }
  };

  const initializePeerConnection = (mediaStream) => {
    const newPeer = new SimplePeer({
      initiator: false,
      trickle: false,
      stream: mediaStream
    });

    newPeer.on("signal", handlePeerSignal);
    newPeer.on("stream", handlePeerStream);
    newPeer.on("error", handlePeerError);
    newPeer.on("connect", () => setConnectionStatus("connected"));
    newPeer.on("close", () => setConnectionStatus("disconnected"));

    setPeer(newPeer);
  };

  const startScreenShare = async () => {
    try {
      const screenCaptureStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: "always",
          displaySurface: "monitor"
        },
        audio: false
      });

      setScreenStream(screenCaptureStream);
      setIsScreenSharing(true);

      // Send screen share stream to interviewer
      if (peer) {
        peer.addStream(screenCaptureStream);
      }

      // Handle stream end
      screenCaptureStream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };
    } catch (err) {
      setError("Failed to start screen sharing. Please try again.");
      console.error("Screen share error:", err);
    }
  };

  const stopScreenShare = () => {
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      if (peer) {
        peer.removeStream(screenStream);
      }
      setScreenStream(null);
      setIsScreenSharing(false);
    }
  };

  // WebSocket handlers
  const handleWebSocketMessage = (event) => {
    const data = JSON.parse(event.data);
    switch (data.type) {
      case "question":
        setCurrentQuestion(data.question);
        setCode(data.question.starterCode || "");
        break;
      case "signal":
        if (peer) peer.signal(data.signal);
        break;
      default:
        console.log("Received unknown message type:", data.type);
    }
  };

  const handleWebSocketError = (error) => {
    setError("Connection error. Please refresh the page.");
    console.error("WebSocket error:", error);
  };

  const handleWebSocketClose = () => {
    setConnectionStatus("disconnected");
    console.log("Disconnected from signaling server");
  };

  // Peer connection handlers
  const handlePeerSignal = (data) => {
    socketRef.current.send(JSON.stringify({
      type: "signal",
      signal: data
    }));
  };

  const handlePeerStream = (remoteStream) => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  };

  const handlePeerError = (error) => {
    setError("Video call error. Please refresh the page.");
    console.error("Peer connection error:", error);
  };

  const cleanupResources = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
    }
    if (peer) {
      peer.destroy();
    }
    if (socketRef.current) {
      socketRef.current.close();
    }
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* Header with status */}
      <header className="bg-white shadow-sm p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Technical Interview</h1>
          <div className="flex items-center gap-4">
            <span className={`px-3 py-1 rounded-full text-sm ${
              connectionStatus === "connected" 
                ? "bg-green-100 text-green-800" 
                : "bg-red-100 text-red-800"
            }`}>
              {connectionStatus === "connected" ? "Connected" : "Disconnected"}
            </span>
            <button
              onClick={isScreenSharing ? stopScreenShare : startScreenShare}
              className={`px-4 py-2 rounded-lg ${
                isScreenSharing 
                  ? "bg-red-500 hover:bg-red-600" 
                  : "bg-blue-500 hover:bg-blue-600"
              } text-white`}
            >
              {isScreenSharing ? "Stop Sharing" : "Share Screen"}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex gap-4 p-4">
        {/* Code editor section */}
        <div className="flex-1 bg-white rounded-lg shadow-lg overflow-hidden">
          {currentQuestion && (
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold">{currentQuestion.title}</h2>
              <p className="mt-2 text-gray-600">{currentQuestion.description}</p>
              {currentQuestion.examples && (
                <div className="mt-4 bg-gray-50 p-4 rounded">
                  <h3 className="font-medium">Example:</h3>
                  {currentQuestion.examples.map((example, index) => (
                    <div key={index} className="mt-2">
                      <p>Input: {example.input}</p>
                      <p>Output: {example.output}</p>
                      {example.explanation && (
                        <p className="text-gray-600">{example.explanation}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <CodeEditor
            value={code}
            onChange={setCode}
            language="javascript"
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              readOnly: false,
              lineNumbers: "on",
              wordWrap: "on"
            }}
          />
        </div>

        {/* Video section */}
        <div className="w-80 flex flex-col gap-4">
          {/* Interviewer's video */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <video
              ref={remoteVideoRef}
              className="w-full h-48 object-cover bg-gray-900"
              autoPlay
              playsInline
            />
          </div>

          {/* Local video (small) */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <video
              ref={localVideoRef}
              className="w-full h-32 object-cover bg-gray-900"
              autoPlay
              playsInline
              muted
            />
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          {error}
        </div>
      )}
    </div>
  );
};

export default CandidateInterviewPage; 