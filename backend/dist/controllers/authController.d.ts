import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
/**
 * Register new user
 * POST /api/auth/register
 */
export declare const register: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Login user
 * POST /api/auth/login
 */
export declare const login: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
/**
 * Logout user
 * POST /api/auth/logout
 */
export declare const logout: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Refresh access token
 * POST /api/auth/refresh
 */
export declare const refresh: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Get current user
 * GET /api/auth/me
 */
export declare const getCurrentUser: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Verify email address
 * GET /api/auth/verify-email/:token
 */
export declare const verifyEmail: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Resend verification email
 * POST /api/auth/resend-verification
 */
export declare const resendVerification: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
/**
 * Google OAuth login/register
 * POST /api/auth/google
 */
export declare const googleAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=authController.d.ts.map