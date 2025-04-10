require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoose = require('mongoose');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const socketIo = require('socket.io');
const { Server } = require('socket.io');
const callRoutes = require('./routes/callRoutes');
const emailRoutes = require('./routes/emailRoutes');
const setupSocket = require('./sockets/socketHandlers');
const interviewRoutes = require('./routes/interviewRoutes');
const authRoutes = require('./routes/authRoutes');
const apiRoutes = require('./routes/api');
const userRoutes = require('./routes/userRoutes');

const questionRoutes=require('./routes/questionRoutes');
const app = express();
const server = http.createServer(app);
const io = new  Server(server, {
    cors: {
        origin: ["http://localhost:5173"], // Vite frontend
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        credentials: true,
    },
});

io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Handle disconnection
    socket.on("disconnect", () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});
// ========================
// 🌐 MongoDB Connection
// ========================
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Connected to MongoDB',process.env.MONGODB_URI))
    .catch(err => console.error('MongoDB connection error:', err));

// ========================
// 🔐 Security Middleware
// ========================
app.use(helmet()); // Protect against common security vulnerabilities

// ========================
// 🌐 CORS Configuration
// ========================
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5000"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true
}));

// ========================
// ⚡ Performance Middleware
// ========================
app.use(compression()); // Compress response bodies for improved performance

// ========================
// 📝 Logging Middleware
// ========================
app.use(morgan('dev')); // Log incoming requests for debugging

// ========================
// 📏 Rate Limiting
// ========================
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // Limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);

// ========================
// 🏋️ Request Size Limits
// ========================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use((req, res, next) => {
    req.io = io;
    next();
});
// ========================
// ✅ Health Check Endpoint
// ========================
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date(),
        uptime: process.uptime()
    });
});

// ========================
// 🚀 API Routes
// ========================
app.use('/api/auth', authRoutes);
app.use('/api/call', callRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/question', questionRoutes);
app.use('/api', apiRoutes);

// ========================
// 🛠️ Error Handling Middleware
// ========================
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ========================
// 🚫 404 Handler
// ========================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.path
    });
});

// ========================
// 📡 WebSocket Setup
// ========================
try {
    setupSocket(io);
} catch (error) {
    console.error('❌ Failed to setup WebSocket server:', error);
    process.exit(1);
}

// ========================
// ⏳ Graceful Shutdown Handling
// ========================
const gracefulShutdown = () => {
    console.log('🛑 Received shutdown signal. Closing server...');
    server.close(() => {
        console.log('✅ Server closed. Exiting process...');
        process.exit(0);
    });

    // Force close after 30 seconds
    setTimeout(() => {
        console.error('❌ Could not close connections in time. Forcefully shutting down.');
        process.exit(1);
    }, 30000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    gracefulShutdown();
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// ========================
// 🌍 Start Server
// ========================
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});

module.exports = server; // Export for testing
