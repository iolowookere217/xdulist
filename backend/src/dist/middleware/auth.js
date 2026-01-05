"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const errors_1 = require("../utils/errors");
const User_1 = require("../models/User");
// Authentication middleware
const authenticate = async (req, res, next) => {
    try {
        // Extract token from Authorization header
        const token = (0, jwt_1.extractTokenFromHeader)(req.headers.authorization);
        if (!token) {
            throw new errors_1.UnauthorizedError('No token provided');
        }
        // Verify token
        const payload = (0, jwt_1.verifyAccessToken)(token);
        // Check if user still exists
        const user = await User_1.User.findById(payload.userId);
        if (!user) {
            throw new errors_1.UnauthorizedError('User no longer exists');
        }
        // Attach user info to request
        req.user = {
            userId: payload.userId,
            email: payload.email,
            tier: payload.tier
        };
        next();
    }
    catch (error) {
        if (error instanceof errors_1.UnauthorizedError) {
            next(error);
        }
        else if (error instanceof Error) {
            if (error.message === 'Token expired') {
                next(new errors_1.UnauthorizedError('Token expired'));
            }
            else if (error.message === 'Invalid token') {
                next(new errors_1.UnauthorizedError('Invalid token'));
            }
            else {
                next(new errors_1.UnauthorizedError('Authentication failed'));
            }
        }
        else {
            next(new errors_1.UnauthorizedError('Authentication failed'));
        }
    }
};
exports.authenticate = authenticate;
// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
    try {
        const token = (0, jwt_1.extractTokenFromHeader)(req.headers.authorization);
        if (token) {
            const payload = (0, jwt_1.verifyAccessToken)(token);
            const user = await User_1.User.findById(payload.userId);
            if (user) {
                req.user = {
                    userId: payload.userId,
                    email: payload.email,
                    tier: payload.tier
                };
            }
        }
        next();
    }
    catch (error) {
        // Don't fail, just continue without user
        next();
    }
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.js.map