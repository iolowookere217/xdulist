"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleAuth = exports.resendVerification = exports.verifyEmail = exports.getCurrentUser = exports.refresh = exports.logout = exports.login = exports.register = void 0;
const User_1 = require("../models/User");
const UserSubscription_1 = require("../models/UserSubscription");
const RefreshToken_1 = require("../models/RefreshToken");
const EmailVerification_1 = require("../models/EmailVerification");
const jwt_1 = require("../utils/jwt");
const errors_1 = require("../utils/errors");
const emailService_1 = __importDefault(require("../services/emailService"));
const crypto_1 = __importDefault(require("crypto"));
/**
 * Register new user
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
    try {
        const { email, password, fullName } = req.body;
        // Check if user exists
        const existingUser = await User_1.User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            throw new errors_1.ConflictError('Email already registered');
        }
        // Create user (password will be hashed by pre-save hook)
        const user = await User_1.User.create({
            email: email.toLowerCase(),
            password,
            fullName,
            isEmailVerified: false
        });
        // Create free tier subscription for new user
        await UserSubscription_1.UserSubscription.create({
            userId: user._id,
            tier: 'free',
            receiptsScannedThisMonth: 0,
            monthResetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
        });
        // Generate verification token
        const verificationToken = crypto_1.default.randomBytes(32).toString('hex');
        const hashedToken = crypto_1.default.createHash('sha256').update(verificationToken).digest('hex');
        // Store verification token (expires in 1 hour)
        await EmailVerification_1.EmailVerification.create({
            userId: user._id,
            token: hashedToken,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
        });
        // Send verification email
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}`;
        await emailService_1.default.sendVerificationEmail(user.email, user.fullName, verificationLink);
        res.status(201).json({
            success: true,
            message: 'Registration successful! Please check your email to verify your account.',
            data: {
                email: user.email,
                requiresVerification: true
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // Find user
        const user = await User_1.User.findOne({ email: email.toLowerCase() });
        if (!user) {
            throw new errors_1.UnauthorizedError('Invalid email or password');
        }
        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            throw new errors_1.UnauthorizedError('Invalid email or password');
        }
        // Check if email is verified
        if (!user.isEmailVerified) {
            return res.status(403).json({
                success: false,
                message: 'Please verify your email before logging in. Check your inbox for the verification link.',
                data: {
                    email: user.email,
                    requiresVerification: true
                }
            });
        }
        // Get user subscription
        const subscription = await UserSubscription_1.UserSubscription.findOne({ userId: user._id });
        const tier = subscription?.tier || 'free';
        // Generate tokens
        const { accessToken, refreshToken } = await (0, jwt_1.generateTokenPair)({
            userId: user._id.toString(),
            email: user.email,
            tier
        });
        // Store refresh token
        const hashedRefreshToken = RefreshToken_1.RefreshToken.hashToken(refreshToken);
        await RefreshToken_1.RefreshToken.create({
            userId: user._id,
            token: hashedRefreshToken,
            expiresAt: (0, jwt_1.getRefreshTokenExpiration)()
        });
        // Set refresh token in HTTP-only cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    fullName: user.fullName,
                    avatar: user.avatar,
                    tier
                },
                accessToken
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
/**
 * Logout user
 * POST /api/auth/logout
 */
const logout = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            // Delete refresh token from database
            const hashedToken = RefreshToken_1.RefreshToken.hashToken(refreshToken);
            await RefreshToken_1.RefreshToken.deleteOne({ token: hashedToken });
        }
        // Clear cookie
        res.clearCookie('refreshToken');
        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.logout = logout;
/**
 * Refresh access token
 * POST /api/auth/refresh
 */
const refresh = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            throw new errors_1.UnauthorizedError('Refresh token not provided');
        }
        // Hash and find token
        const hashedToken = RefreshToken_1.RefreshToken.hashToken(refreshToken);
        const tokenDoc = await RefreshToken_1.RefreshToken.findOne({ token: hashedToken });
        if (!tokenDoc || !tokenDoc.isValid()) {
            throw new errors_1.UnauthorizedError('Invalid or expired refresh token');
        }
        // Get user and subscription
        const user = await User_1.User.findById(tokenDoc.userId);
        if (!user) {
            throw new errors_1.UnauthorizedError('User not found');
        }
        const subscription = await UserSubscription_1.UserSubscription.findOne({ userId: user._id });
        const tier = subscription?.tier || 'free';
        // Generate new token pair
        const { accessToken, refreshToken: newRefreshToken } = await (0, jwt_1.generateTokenPair)({
            userId: user._id.toString(),
            email: user.email,
            tier
        });
        // Delete old refresh token
        await RefreshToken_1.RefreshToken.deleteOne({ _id: tokenDoc._id });
        // Store new refresh token
        const hashedNewToken = RefreshToken_1.RefreshToken.hashToken(newRefreshToken);
        await RefreshToken_1.RefreshToken.create({
            userId: user._id,
            token: hashedNewToken,
            expiresAt: (0, jwt_1.getRefreshTokenExpiration)()
        });
        // Set new refresh token cookie
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.status(200).json({
            success: true,
            message: 'Token refreshed successfully',
            data: { accessToken }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.refresh = refresh;
/**
 * Get current user
 * GET /api/auth/me
 */
const getCurrentUser = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errors_1.UnauthorizedError('Not authenticated');
        }
        const user = await User_1.User.findById(req.user.userId).select('-password');
        if (!user) {
            throw new errors_1.UnauthorizedError('User not found');
        }
        const subscription = await UserSubscription_1.UserSubscription.findOne({ userId: user._id });
        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    fullName: user.fullName,
                    avatar: user.avatar,
                    isEmailVerified: user.isEmailVerified,
                    tier: subscription?.tier || 'free'
                }
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCurrentUser = getCurrentUser;
/**
 * Verify email address
 * GET /api/auth/verify-email/:token
 */
const verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.params;
        if (!token) {
            throw new errors_1.ValidationError('Verification token is required');
        }
        // Hash the token to match stored version
        const hashedToken = crypto_1.default.createHash('sha256').update(token).digest('hex');
        // Find verification record
        const verification = await EmailVerification_1.EmailVerification.findOne({ token: hashedToken });
        if (!verification || !verification.isValid()) {
            throw new errors_1.UnauthorizedError('Invalid or expired verification token');
        }
        // Update user's email verification status
        const user = await User_1.User.findById(verification.userId);
        if (!user) {
            throw new errors_1.UnauthorizedError('User not found');
        }
        user.isEmailVerified = true;
        await user.save();
        // Delete verification token
        await EmailVerification_1.EmailVerification.deleteOne({ _id: verification._id });
        // Send welcome email
        await emailService_1.default.sendWelcomeEmail(user.email, user.fullName);
        // Get user subscription
        const subscription = await UserSubscription_1.UserSubscription.findOne({ userId: user._id });
        const tier = subscription?.tier || 'free';
        // Generate tokens to automatically log in user
        const { accessToken, refreshToken } = await (0, jwt_1.generateTokenPair)({
            userId: user._id.toString(),
            email: user.email,
            tier
        });
        // Store refresh token
        const hashedRefreshToken = RefreshToken_1.RefreshToken.hashToken(refreshToken);
        await RefreshToken_1.RefreshToken.create({
            userId: user._id,
            token: hashedRefreshToken,
            expiresAt: (0, jwt_1.getRefreshTokenExpiration)()
        });
        // Set refresh token in HTTP-only cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.status(200).json({
            success: true,
            message: 'Email verified successfully! You are now logged in.',
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    fullName: user.fullName,
                    avatar: user.avatar,
                    isEmailVerified: true,
                    tier
                },
                accessToken
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.verifyEmail = verifyEmail;
/**
 * Resend verification email
 * POST /api/auth/resend-verification
 */
const resendVerification = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            throw new errors_1.ValidationError('Email is required');
        }
        // Find user
        const user = await User_1.User.findOne({ email: email.toLowerCase() });
        if (!user) {
            throw new errors_1.UnauthorizedError('User not found');
        }
        // Check if already verified
        if (user.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email is already verified'
            });
        }
        // Delete any existing verification tokens for this user
        await EmailVerification_1.EmailVerification.deleteMany({ userId: user._id });
        // Generate new verification token
        const verificationToken = crypto_1.default.randomBytes(32).toString('hex');
        const hashedToken = crypto_1.default.createHash('sha256').update(verificationToken).digest('hex');
        // Store new verification token
        await EmailVerification_1.EmailVerification.create({
            userId: user._id,
            token: hashedToken,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
        });
        // Send verification email
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}`;
        await emailService_1.default.sendVerificationEmail(user.email, user.fullName, verificationLink);
        res.status(200).json({
            success: true,
            message: 'Verification email sent! Please check your inbox.',
            data: {
                email: user.email
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.resendVerification = resendVerification;
/**
 * Google OAuth login/register
 * POST /api/auth/google
 */
const googleAuth = async (req, res, next) => {
    try {
        const { googleId, email, fullName, avatar } = req.body;
        if (!googleId || !email) {
            throw new errors_1.ValidationError('Google ID and email are required');
        }
        // Find or create user
        let user = await User_1.User.findOne({ $or: [{ googleId }, { email: email.toLowerCase() }] });
        if (!user) {
            // Create new user
            user = await User_1.User.create({
                email: email.toLowerCase(),
                fullName: fullName || email.split('@')[0],
                googleId,
                avatar,
                isEmailVerified: true, // Google emails are verified
                password: Math.random().toString(36) // Random password (not used for OAuth users)
            });
            // Create subscription
            await UserSubscription_1.UserSubscription.create({
                userId: user._id,
                tier: 'free',
                receiptsScannedThisMonth: 0,
                monthResetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
            });
            // Send welcome email to new Google users
            await emailService_1.default.sendWelcomeEmail(user.email, user.fullName);
        }
        else if (!user.googleId) {
            // Link Google account to existing user
            user.googleId = googleId;
            user.isEmailVerified = true;
            if (avatar && !user.avatar) {
                user.avatar = avatar;
            }
            await user.save();
        }
        // Get subscription
        const subscription = await UserSubscription_1.UserSubscription.findOne({ userId: user._id });
        const tier = subscription?.tier || 'free';
        // Generate tokens
        const { accessToken, refreshToken } = await (0, jwt_1.generateTokenPair)({
            userId: user._id.toString(),
            email: user.email,
            tier
        });
        // Store refresh token
        const hashedRefreshToken = RefreshToken_1.RefreshToken.hashToken(refreshToken);
        await RefreshToken_1.RefreshToken.create({
            userId: user._id,
            token: hashedRefreshToken,
            expiresAt: (0, jwt_1.getRefreshTokenExpiration)()
        });
        // Set refresh token cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.status(200).json({
            success: true,
            message: 'Google authentication successful',
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    fullName: user.fullName,
                    avatar: user.avatar,
                    tier
                },
                accessToken
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.googleAuth = googleAuth;
//# sourceMappingURL=authController.js.map