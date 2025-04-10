# Interview Platform with WebRTC

A real-time interview platform with video calling, code collaboration, and chat features.

## Features

- Real-time video calling using WebRTC
- Code collaboration
- Real-time chat
- Interview scheduling and management
- Question management
- Feedback system

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A TURN server (for WebRTC connectivity)

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd interview-platform
```

2. Install dependencies:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables:

Create a `.env` file in the frontend directory:
```env
REACT_APP_SOCKET_URL=http://localhost:3001
REACT_APP_TURN_SERVER_URL=your-turn-server-url
REACT_APP_TURN_USERNAME=your-turn-username
REACT_APP_TURN_CREDENTIAL=your-turn-credential
REACT_APP_API_URL=http://localhost:8000/api
```

Create a `.env` file in the backend directory:
```env
PORT=3001
TURN_SERVER_URL=your-turn-server-url
TURN_USERNAME=your-turn-username
TURN_CREDENTIAL=your-turn-credential
```

4. Set up a TURN server:
   - Install and configure a TURN server (e.g., Coturn)
   - Update the TURN server credentials in your environment variables

5. Start the development servers:

```bash
# Start backend server
cd backend
npm run dev

# Start frontend server
cd frontend
npm start
```

## WebRTC Configuration

The application uses WebRTC for video calling with the following configuration:

- STUN servers for NAT traversal
- TURN server for relay when direct connection is not possible
- ICE transport policy set to 'all' for maximum connectivity
- ICE candidate pool size of 10 for better connection establishment

## Browser Support

The application is tested and works on:
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Troubleshooting

1. Video/Audio Issues:
   - Ensure camera and microphone permissions are granted
   - Check if the devices are properly connected
   - Try refreshing the page

2. Connection Issues:
   - Verify TURN server configuration
   - Check network connectivity
   - Ensure ports are open and accessible

3. WebRTC Issues:
   - Check browser console for ICE connection errors
   - Verify STUN/TURN server availability
   - Ensure proper signaling server connection

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 