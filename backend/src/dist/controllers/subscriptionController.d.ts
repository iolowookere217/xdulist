import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
/**
 * Get user subscription
 * GET /api/subscription
 */
export declare const getSubscription: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
/**
 * Update subscription settings
 * PUT /api/subscription
 */
export declare const updateSubscription: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Manual upgrade to premium (UI only - no payment processing)
 * POST /api/subscription/upgrade
 */
export declare const upgradeToPremium: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
/**
 * Downgrade to free tier
 * POST /api/subscription/downgrade
 */
export declare const downgradeToFree: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=subscriptionController.d.ts.map