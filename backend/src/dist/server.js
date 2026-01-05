"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables FIRST before any other imports
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const database_1 = __importDefault(require("./config/database"));
const routes_1 = __importDefault(require("./routes"));
const errorHandler_1 = require("./middleware/errorHandler");
const errors_1 = require("./utils/errors");
const ReminderService_1 = __importDefault(require("./services/ReminderService"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Security Middleware
app.use((0, helmet_1.default)());
// CORS Configuration
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// Body Parser
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Cookie Parser
app.use((0, cookie_parser_1.default)());
// Sanitize MongoDB queries
app.use((0, express_mongo_sanitize_1.default)());
// Rate Limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', limiter);
// Health Check Endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'MoneyMata API is running',
        timestamp: new Date().toISOString()
    });
});
// API Routes
app.use('/api', routes_1.default);
// 404 Handler
app.use((req, res, next) => {
    next(new errors_1.NotFoundError(`Route ${req.originalUrl} not found`));
});
// Global Error Handler (must be last)
app.use(errorHandler_1.errorHandler);
// Start Server
const startServer = async () => {
    try {
        // Connect to Database
        await (0, database_1.default)();
        // Start reminder service
        ReminderService_1.default.start();
        // Start listening
        const server = app.listen(PORT, () => {
            console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
            console.log(`📊 Health check: http://localhost:${PORT}/health`);
            console.log(`🔗 API endpoint: http://localhost:${PORT}/api`);
        });
        // Graceful Shutdown
        const shutdown = () => {
            console.log('\n⚠️  Shutting down gracefully...');
            server.close(() => {
                console.log('✅ Server closed');
                process.exit(0);
            });
            // Force close after 10 seconds
            setTimeout(() => {
                console.error('❌ Forcing shutdown');
                process.exit(1);
            }, 10000);
        };
        process.on('SIGTERM', shutdown);
        process.on('SIGINT', shutdown);
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
exports.default = app;
//# sourceMappingURL=server.js.map