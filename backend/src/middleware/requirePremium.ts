import { Response, NextFunction } from 'express';
import { ForbiddenError } from '../utils/errors';
import { AuthRequest } from '../types';

export const requirePremium = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new ForbiddenError('Authentication required');
  }

  if (req.user.tier !== 'premium') {
    throw new ForbiddenError('This feature requires a premium subscription. Upgrade to unlock!');
  }

  next();
};
