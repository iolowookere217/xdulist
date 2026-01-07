import { Request, Response, NextFunction } from "express";
import { User } from "../models/User";
import { UserSubscription } from "../models/UserSubscription";
import { RefreshToken } from "../models/RefreshToken";
import { EmailVerification } from "../models/EmailVerification";
import {
  generateTokenPair,
  verifyAccessToken,
  getRefreshTokenExpiration,
} from "../utils/jwt";
import {
  UnauthorizedError,
  ValidationError,
  ConflictError,
} from "../utils/errors";
import { AuthRequest } from "../types";
import emailService from "../services/emailService";
import crypto from "crypto";

/**
 * Register new user
 * POST /api/auth/register
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, fullName } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ConflictError("Email already registered");
    }

    // Create user (password will be hashed by pre-save hook)
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      fullName,
      isEmailVerified: false,
    });

    // Create free tier subscription for new user
    await UserSubscription.create({
      userId: user._id,
      tier: "free",
      receiptsScannedThisMonth: 0,
      monthResetDate: new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        1
      ),
    });

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    // Store verification token (expires in 1 hour)
    await EmailVerification.create({
      userId: user._id,
      token: hashedToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    // Send verification email
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}`;
    // Send verification email asynchronously; don't block registration on SMTP issues
    emailService
      .sendVerificationEmail(user.email, user.fullName, verificationLink)
      .catch((err) => console.error("Failed to send verification email:", err));

    res.status(201).json({
      success: true,
      message:
        "Registration successful! Please check your email to verify your account.",
      data: {
        email: user.email,
        requiresVerification: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user
 * GET /api/auth/me
 */
export const getCurrentUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new UnauthorizedError("Not authenticated");

    const user = await User.findById(userId).select("email fullName avatar");
    if (!user) throw new UnauthorizedError("User not found");

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Google auth (stub)
 * POST /api/auth/google
 */
export const googleAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Placeholder: full Google OAuth flow not implemented here.
    res
      .status(501)
      .json({ success: false, message: "Google auth not implemented" });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify email link
 * GET /api/auth/verify-email/:token
 */
export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.params;
    if (!token) throw new ValidationError("Verification token is required");

    const hashed = crypto.createHash("sha256").update(token).digest("hex");
    const verification = await EmailVerification.findOne({ token: hashed });
    if (!verification || !verification.isValid()) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired token" });
    }

    await User.findByIdAndUpdate(verification.userId, {
      isEmailVerified: true,
    });
    await EmailVerification.deleteMany({ userId: verification.userId });

    // Send welcome email asynchronously
    const user = await User.findById(verification.userId);
    if (user)
      emailService.sendWelcomeEmail(user.email, user.fullName).catch(() => {});

    res
      .status(200)
      .json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    next(error);
  }
};

/**
 * Resend verification email
 * POST /api/auth/resend-verification
 */
export const resendVerification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;
    if (!email) throw new ValidationError("Email is required");

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) throw new ValidationError("User not found");
    if (user.isEmailVerified)
      return res
        .status(400)
        .json({ success: false, message: "Email already verified" });

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    await EmailVerification.findOneAndUpdate(
      { userId: user._id },
      { token: hashedToken, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
      { upsert: true, new: true }
    );

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}`;
    // Send verification email asynchronously; don't fail the request if SMTP times out
    emailService
      .sendVerificationEmail(user.email, user.fullName, verificationLink)
      .catch((err) => console.error("Failed to send verification email:", err));

    res.status(200).json({ success: true, message: "Verification email sent" });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message:
          "Please verify your email before logging in. Check your inbox for the verification link.",
        data: {
          email: user.email,
          requiresVerification: true,
        },
      });
    }

    // Get user subscription
    const subscription = await UserSubscription.findOne({ userId: user._id });
    const tier = subscription?.tier || "free";

    // Generate tokens
    const { accessToken, refreshToken } = await generateTokenPair({
      userId: user._id.toString(),
      email: user.email,
      tier,
    });

    // Store refresh token
    const hashedRefreshToken = RefreshToken.hashToken(refreshToken);
    await RefreshToken.create({
      userId: user._id,
      token: hashedRefreshToken,
      expiresAt: getRefreshTokenExpiration(),
    });

    // Set refresh token in HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          avatar: user.avatar,
          tier,
        },
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      // Delete refresh token from database
      const hashedToken = RefreshToken.hashToken(refreshToken);
      await RefreshToken.deleteOne({ token: hashedToken });
    }

    // Clear cookie
    res.clearCookie("refreshToken");

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedError("Refresh token not provided");
    }

    // Hash and find token
    const hashedToken = RefreshToken.hashToken(refreshToken);
    const tokenDoc = await RefreshToken.findOne({ token: hashedToken });

    if (!tokenDoc || !tokenDoc.isValid()) {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }
    // (implementation omitted for brevity in this copy; original file continues)
  } catch (error) {
    next(error);
  }
};
