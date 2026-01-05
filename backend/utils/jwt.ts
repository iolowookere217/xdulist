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

export const generateAccessToken = (payload: JWTPayload): string => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || "15m";
  if (!secret) throw new Error("JWT_SECRET is not defined");
  return jwt.sign(payload as any, secret as any, { expiresIn } as any);
};

export const generateRefreshToken = (): string => {
  return crypto.randomBytes(64).toString("hex");
};

export const verifyAccessToken = (token: string): JWTPayload => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not defined");
  try {
    const decoded = jwt.verify(token, secret) as JWTPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError)
      throw new Error("Token expired");
    if (error instanceof jwt.JsonWebTokenError)
      throw new Error("Invalid token");
    throw error;
  }
};

export const getRefreshTokenExpiration = (): Date => {
  const expiresInDays = 7;
  const expiration = new Date();
  expiration.setDate(expiration.getDate() + expiresInDays);
  return expiration;
};

export const generateTokenPair = (payload: JWTPayload): TokenPair => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken();
  return { accessToken, refreshToken };
};

export const extractTokenFromHeader = (
  authorizationHeader?: string
): string | null => {
  if (!authorizationHeader) return null;
  const parts = authorizationHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return null;
  return parts[1];
};
