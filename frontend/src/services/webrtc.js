import SimplePeer from "simple-peer"
import { io } from "socket.io-client"

class WebRTCService {
  constructor() {
    this.socket = null
    this.localStream = null
    this.peers = new Map()
    this.onStreamCallbacks = []
    this.onUserDisconnectedCallbacks = []
    this.roomId = null
  }

  initializeSocket() {
    if (this.socket) return

    const socketUrl = process.env.REACT_APP_SOCKET_URL || "http://localhost:3001"
    this.socket = io(socketUrl)
    this.setupSocketListeners()
  }

  setupSocketListeners() {
    if (!this.socket) return

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

      const peerConnection = this.peers.get(userId)

      if (peerConnection) {
        peerConnection.peer.signal(signal)
      } else {
        const peer = this.createPeer(userId, false)
        peer.signal(signal)
      }
    })

    this.socket.on("user-disconnected", (userId) => {
      console.log("User disconnected:", userId)

      const peerConnection = this.peers.get(userId)
      if (peerConnection) {
        peerConnection.peer.destroy()
        this.peers.delete(userId)
      }

      this.onUserDisconnectedCallbacks.forEach((callback) => callback(userId))
    })
  }

  createPeer(userId, initiator) {
    console.log("Creating peer with user:", userId, "initiator:", initiator)

    const peer = new SimplePeer({
      initiator,
      stream: this.localStream || undefined,
      trickle: false,
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
    })

    this.peers.set(userId, { peer, userId })
    return peer
  }

  async joinRoom(roomId) {
    this.roomId = roomId
    this.initializeSocket()

    try {
      // Request camera and microphone permissions
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })

      // Join the room
      this.socket?.emit("join-room", roomId)

      return this.localStream
    } catch (error) {
      console.error("Error joining room:", error)
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

  disconnect() {
    this.leaveRoom()
    this.socket?.disconnect()
    this.socket = null
  }
}

export default new WebRTCService()

