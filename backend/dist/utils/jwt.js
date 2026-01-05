"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTokenFromHeader = exports.generateTokenPair = exports.getRefreshTokenExpiration = exports.verifyAccessToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
// Generate access token (short-lived)
const generateAccessToken = (payload) => {
    const secret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRES_IN || "15m";
    if (!secret) {
        throw new Error("JWT_SECRET is not defined");
    }
    // cast to any to satisfy various `jsonwebtoken` overload typings
    return jsonwebtoken_1.default.sign(payload, secret, { expiresIn });
};
exports.generateAccessToken = generateAccessToken;
// Generate refresh token (long-lived)
const generateRefreshToken = () => {
    // Generate a random 64-byte token
    return crypto_1.default.randomBytes(64).toString("hex");
};
exports.generateRefreshToken = generateRefreshToken;
// Verify access token
const verifyAccessToken = (token) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not defined");
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        return decoded;
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            throw new Error("Token expired");
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            throw new Error("Invalid token");
        }
        throw error;
    }
};
exports.verifyAccessToken = verifyAccessToken;
// Calculate refresh token expiration date
const getRefreshTokenExpiration = () => {
    const expiresInDays = 7; // 7 days
    const expiration = new Date();
    expiration.setDate(expiration.getDate() + expiresInDays);
    return expiration;
};
exports.getRefreshTokenExpiration = getRefreshTokenExpiration;
// Generate both access and refresh tokens
const generateTokenPair = (payload) => {
    const accessToken = (0, exports.generateAccessToken)(payload);
    const refreshToken = (0, exports.generateRefreshToken)();
    return {
        accessToken,
        refreshToken,
    };
};
exports.generateTokenPair = generateTokenPair;
// Extract token from Authorization header
const extractTokenFromHeader = (authorizationHeader) => {
    if (!authorizationHeader) {
        return null;
    }
    const parts = authorizationHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
        return null;
    }
    return parts[1];
};
exports.extractTokenFromHeader = extractTokenFromHeader;
//# sourceMappingURL=jwt.js.map