import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, extractTokenFromHeader, JWTPayload } from '../utils/jwt';
import { UnauthorizedError } from '../utils/errors';
import { User } from '../models/User';
import { UserSubscription } from '../models/UserSubscription';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        tier: 'free' | 'premium';
      };
    }
  }
}

// Authentication middleware
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    // Verify token
    const payload: JWTPayload = verifyAccessToken(token);

    // Check if user still exists
    const user = await User.findById(payload.userId);
    if (!user) {
      throw new UnauthorizedError('User no longer exists');
    }

    // Attach user info to request
    req.user = {
      userId: payload.userId,
      email: payload.email,
      tier: payload.tier
    };

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else if (error instanceof Error) {
      if (error.message === 'Token expired') {
        next(new UnauthorizedError('Token expired'));
      } else if (error.message === 'Invalid token') {
        next(new UnauthorizedError('Invalid token'));
      } else {
        next(new UnauthorizedError('Authentication failed'));
      }
    } else {
      next(new UnauthorizedError('Authentication failed'));
    }
  }
};

// Optional authentication (doesn't fail if no token)
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (token) {
      const payload: JWTPayload = verifyAccessToken(token);
      const user = await User.findById(payload.userId);

      if (user) {
        req.user = {
          userId: payload.userId,
          email: payload.email,
          tier: payload.tier
        };
      }
    }

    next();
  } catch (error) {
    // Don't fail, just continue without user
    next();
  }
};
