import { Response, NextFunction } from 'express';
import { UserSubscription } from '../models/UserSubscription';
import { AuthRequest } from '../types';
import { NotFoundError } from '../utils/errors';

/**
 * Get user subscription
 * GET /api/subscription
 */
export const getSubscription = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    const subscription = await UserSubscription.findOne({ userId });

    if (!subscription) {
      // Create default free subscription if not exists
      const newSubscription = await UserSubscription.create({
        userId,
        tier: 'free',
        receiptsScannedThisMonth: 0,
        monthResetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
      });

      return res.status(200).json({
        success: true,
        data: { subscription: newSubscription }
      });
    }

    res.status(200).json({
      success: true,
      data: { subscription }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update subscription settings
 * PUT /api/subscription
 */
export const updateSubscription = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { monthlyBudget, preferredCurrency, notificationSettings, customCategories } = req.body;

    const subscription = await UserSubscription.findOne({ userId });
    if (!subscription) {
      throw new NotFoundError('Subscription not found');
    }

    if (monthlyBudget !== undefined) subscription.monthlyBudget = monthlyBudget;
    if (preferredCurrency) subscription.preferredCurrency = preferredCurrency;
    if (notificationSettings) {
      subscription.notificationSettings = {
        ...subscription.notificationSettings,
        ...notificationSettings
      };
    }
    if (customCategories) subscription.customCategories = customCategories;

    await subscription.save();

    res.status(200).json({
      success: true,
      message: 'Subscription updated successfully',
      data: { subscription }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Manual upgrade to premium (UI only - no payment processing)
 * POST /api/subscription/upgrade
 */
export const upgradeToPremium = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    const subscription = await UserSubscription.findOne({ userId });
    if (!subscription) {
      throw new NotFoundError('Subscription not found');
    }

    if (subscription.tier === 'premium') {
      return res.status(200).json({
        success: true,
        message: 'Already on premium tier'
      });
    }

    // Upgrade to premium (manual - no payment)
    subscription.tier = 'premium';
    subscription.subscriptionEndsAt = null; // Never expires for manual upgrades
    await subscription.save();

    res.status(200).json({
      success: true,
      message: 'Successfully upgraded to Premium!',
      data: { subscription }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Downgrade to free tier
 * POST /api/subscription/downgrade
 */
export const downgradeToFree = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    const subscription = await UserSubscription.findOne({ userId });
    if (!subscription) {
      throw new NotFoundError('Subscription not found');
    }

    if (subscription.tier === 'free') {
      return res.status(200).json({
        success: true,
        message: 'Already on free tier'
      });
    }

    subscription.tier = 'free';
    subscription.subscriptionEndsAt = null;
    await subscription.save();

    res.status(200).json({
      success: true,
      message: 'Downgraded to free tier',
      data: { subscription }
    });
  } catch (error) {
    next(error);
  }
};
