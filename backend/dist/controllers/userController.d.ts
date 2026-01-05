import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
/**
 * Get user profile with subscription
 * GET /api/users/profile
 */
export declare const getProfile: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Update user profile
 * PUT /api/users/profile
 */
export declare const updateProfile: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Change password
 * PUT /api/users/password
 */
export declare const changePassword: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=userController.d.ts.map