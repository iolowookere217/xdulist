"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.downgradeToFree = exports.upgradeToPremium = exports.updateSubscription = exports.getSubscription = void 0;
const UserSubscription_1 = require("../models/UserSubscription");
const errors_1 = require("../utils/errors");
/**
 * Get user subscription
 * GET /api/subscription
 */
const getSubscription = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const subscription = await UserSubscription_1.UserSubscription.findOne({ userId });
        if (!subscription) {
            // Create default free subscription if not exists
            const newSubscription = await UserSubscription_1.UserSubscription.create({
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
    }
    catch (error) {
        next(error);
    }
};
exports.getSubscription = getSubscription;
/**
 * Update subscription settings
 * PUT /api/subscription
 */
const updateSubscription = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { monthlyBudget, preferredCurrency, notificationSettings, customCategories } = req.body;
        const subscription = await UserSubscription_1.UserSubscription.findOne({ userId });
        if (!subscription) {
            throw new errors_1.NotFoundError('Subscription not found');
        }
        if (monthlyBudget !== undefined)
            subscription.monthlyBudget = monthlyBudget;
        if (preferredCurrency)
            subscription.preferredCurrency = preferredCurrency;
        if (notificationSettings) {
            subscription.notificationSettings = {
                ...subscription.notificationSettings,
                ...notificationSettings
            };
        }
        if (customCategories)
            subscription.customCategories = customCategories;
        await subscription.save();
        res.status(200).json({
            success: true,
            message: 'Subscription updated successfully',
            data: { subscription }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateSubscription = updateSubscription;
/**
 * Manual upgrade to premium (UI only - no payment processing)
 * POST /api/subscription/upgrade
 */
const upgradeToPremium = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const subscription = await UserSubscription_1.UserSubscription.findOne({ userId });
        if (!subscription) {
            throw new errors_1.NotFoundError('Subscription not found');
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
    }
    catch (error) {
        next(error);
    }
};
exports.upgradeToPremium = upgradeToPremium;
/**
 * Downgrade to free tier
 * POST /api/subscription/downgrade
 */
const downgradeToFree = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const subscription = await UserSubscription_1.UserSubscription.findOne({ userId });
        if (!subscription) {
            throw new errors_1.NotFoundError('Subscription not found');
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
    }
    catch (error) {
        next(error);
    }
};
exports.downgradeToFree = downgradeToFree;
//# sourceMappingURL=subscriptionController.js.map