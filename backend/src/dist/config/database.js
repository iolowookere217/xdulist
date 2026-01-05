"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI;
        if (!mongoURI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }
        const options = {
            maxPoolSize: 10,
            minPoolSize: 2,
            socketTimeoutMS: 45000,
            serverSelectionTimeoutMS: 5000,
            family: 4 // Use IPv4, skip trying IPv6
        };
        await mongoose_1.default.connect(mongoURI, options);
        console.log('✅ MongoDB connected successfully');
        // Handle connection events
        mongoose_1.default.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });
        mongoose_1.default.connection.on('disconnected', () => {
            console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
        });
        mongoose_1.default.connection.on('reconnected', () => {
            console.log('✅ MongoDB reconnected successfully');
        });
        // Graceful shutdown
        process.on('SIGINT', async () => {
            try {
                await mongoose_1.default.connection.close();
                console.log('MongoDB connection closed through app termination');
                process.exit(0);
            }
            catch (err) {
                console.error('Error during MongoDB disconnection:', err);
                process.exit(1);
            }
        });
    }
    catch (error) {
        console.error('❌ MongoDB connection failed:', error);
        process.exit(1);
    }
};
exports.default = connectDB;
//# sourceMappingURL=database.js.map