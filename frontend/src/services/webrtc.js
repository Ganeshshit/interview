import SimplePeer from "simple-peer"
import io from 'socket.io-client'

class WebRTCService {
  constructor() {
    this.socket = null
    this.localStream = null
    this.peers = new Map()
    this.onStreamCallbacks = []
    this.onUserDisconnectedCallbacks = []
    this.onConnectionStateChangeCallbacks = []
    this.roomId = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 1000
    this.iceConfig = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        {
          urls: process.env.REACT_APP_TURN_SERVER_URL || 'turn:your-turn-server.com',
          username: process.env.REACT_APP_TURN_USERNAME || 'your-username',
          credential: process.env.REACT_APP_TURN_CREDENTIAL || 'your-credential'
        }
      ],
      iceTransportPolicy: 'all',
      iceCandidatePoolSize: 10
    }
  }

  connect(serverUrl) {
    this.socket = io(serverUrl)
    this.setupSocketListeners()
  }

  setupSocketListeners() {
    if (!this.socket) return

    this.socket.on("connect", () => {
      console.log("Socket connected")
      this.reconnectAttempts = 0
    })

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected")
      this.handleDisconnect()
    })

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error)
      this.handleConnectionError()
    })

    this.socket.on("user-joined", (userId) => {
      console.log("User joined:", userId)
      this.createPeer(userId, true)
    })

    this.socket.on("existing-users", (userIds) => {
      console.log("Existing users in room:", userIds)
      userIds.forEach((userId) => {
        this.createPeer(userId, false)
      })
    })

    this.socket.on("signal", ({ userId, signal }) => {
      console.log("Received signal from:", userId)
      this.handleSignal(userId, signal)
    })

    this.socket.on("user-disconnected", (userId) => {
      console.log("User disconnected:", userId)
      this.handleUserDisconnect(userId)
    })

    this.socket.on('user-left', this.handleUserLeft.bind(this))
    this.socket.on('new-message', this.handleNewMessage.bind(this))
  }

  handleSignal(userId, signal) {
    const peerConnection = this.peers.get(userId)
    if (peerConnection) {
      peerConnection.peer.signal(signal)
    } else {
      const peer = this.createPeer(userId, false)
      peer.signal(signal)
    }
  }

  handleUserDisconnect(userId) {
    const peerConnection = this.peers.get(userId)
    if (peerConnection) {
      peerConnection.peer.destroy()
      this.peers.delete(userId)
    }
    this.onUserDisconnectedCallbacks.forEach((callback) => callback(userId))
  }

  handleDisconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)
      setTimeout(() => this.connect(process.env.REACT_APP_SOCKET_URL || "http://localhost:3001"), this.reconnectDelay * this.reconnectAttempts)
    } else {
      console.error("Max reconnection attempts reached")
      this.disconnect()
    }
  }

  handleConnectionError() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Connection error, retrying (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)
    }
  }

  createPeer(userId, initiator) {
    console.log("Creating peer with user:", userId, "initiator:", initiator)

    const peer = new SimplePeer({
      initiator,
      stream: this.localStream || undefined,
      trickle: false,
      config: this.iceConfig
    })

    peer.on("signal", (signal) => {
      console.log("Generated signal for user:", userId)
      this.socket?.emit("signal", { userId, signal })
    })

    peer.on("stream", (stream) => {
      console.log("Received stream from user:", userId)
      this.onStreamCallbacks.forEach((callback) => callback(stream, userId))
    })

    peer.on("error", (err) => {
      console.error("Peer error:", err)
      this.handlePeerError(userId, err)
    })

    peer.on("connect", () => {
      console.log("Peer connected:", userId)
      this.onConnectionStateChangeCallbacks.forEach(callback => 
        callback(userId, "connected")
      )
    })

    peer.on("close", () => {
      console.log("Peer closed:", userId)
      this.onConnectionStateChangeCallbacks.forEach(callback => 
        callback(userId, "closed")
      )
    })

    peer.on("iceStateChange", (state) => {
      console.log(`ICE state changed for user ${userId}:`, state)
      if (state === 'failed' || state === 'disconnected') {
        this.handlePeerError(userId, new Error(`ICE connection ${state}`))
      }
    })

    this.peers.set(userId, { peer, userId })
    return peer
  }

  handlePeerError(userId, error) {
    console.error(`Peer error for user ${userId}:`, error)
    const peerConnection = this.peers.get(userId)
    if (peerConnection) {
      peerConnection.peer.destroy()
      this.peers.delete(userId)
    }
  }

  async joinRoom(roomId, userData) {
    this.roomId = roomId
    this.connect(process.env.REACT_APP_SOCKET_URL || "http://localhost:3001")

    try {
      // Register user first
      this.socket.emit('register-user', userData)
      
      // Join the room
      this.socket.emit('join-room', roomId)
      
      // Get local media stream
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })

      return this.localStream
    } catch (error) {
      console.error('Error joining room:', error)
      throw error
    }
  }

  leaveRoom() {
    if (this.roomId) {
      this.socket?.emit("leave-room", this.roomId)
      this.roomId = null
    }

    // Close all peer connections
    this.peers.forEach((peerConnection) => {
      peerConnection.peer.destroy()
    })
    this.peers.clear()

    // Stop all tracks in the local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop())
      this.localStream = null
    }
  }

  getLocalStream() {
    return this.localStream
  }

  toggleVideo(enabled) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((track) => {
        track.enabled = enabled
      })
    }
  }

  toggleAudio(enabled) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = enabled
      })
    }
  }

  onStream(callback) {
    this.onStreamCallbacks.push(callback)
  }

  onUserDisconnected(callback) {
    this.onUserDisconnectedCallbacks.push(callback)
  }

  onConnectionStateChange(callback) {
    this.onConnectionStateChangeCallbacks.push(callback)
  }

  disconnect() {
    this.leaveRoom()
    this.socket?.disconnect()
    this.socket = null
    this.reconnectAttempts = 0
  }

  handleUserLeft(userId) {
    console.log("User left:", userId)
    this.handleUserDisconnect(userId)
  }

  handleNewMessage(message) {
    console.log("New message:", message)
    // Handle new message
  }
}

export default new WebRTCService()

