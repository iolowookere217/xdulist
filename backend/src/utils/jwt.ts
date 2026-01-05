import jwt, { Secret } from "jsonwebtoken";
import crypto from "crypto";
import { Types } from "mongoose";

export interface JWTPayload {
  userId: string;
  email: string;
  tier: "free" | "premium";
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// Generate access token (short-lived)
export const generateAccessToken = (payload: JWTPayload): string => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || "15m";

  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  // cast to any to satisfy various `jsonwebtoken` overload typings
  return jwt.sign(payload as any, secret as any, { expiresIn } as any);
};

// Generate refresh token (long-lived)
export const generateRefreshToken = (): string => {
  // Generate a random 64-byte token
  return crypto.randomBytes(64).toString("hex");
};

// Verify access token
export const verifyAccessToken = (token: string): JWTPayload => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  try {
    const decoded = jwt.verify(token, secret) as JWTPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Token expired");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid token");
    }
    throw error;
  }
};

// Calculate refresh token expiration date
export const getRefreshTokenExpiration = (): Date => {
  const expiresInDays = 7; // 7 days
  const expiration = new Date();
  expiration.setDate(expiration.getDate() + expiresInDays);
  return expiration;
};

// Generate both access and refresh tokens
export const generateTokenPair = (payload: JWTPayload): TokenPair => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken();

  return {
    accessToken,
    refreshToken,
  };
};

// Extract token from Authorization header
export const extractTokenFromHeader = (
  authorizationHeader?: string
): string | null => {
  if (!authorizationHeader) {
    return null;
  }

  const parts = authorizationHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1];
};
