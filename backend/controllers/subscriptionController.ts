import { Response, NextFunction } from "express";
import { UserSubscription } from "../models/UserSubscription";
import { AuthRequest } from "../types";
import { NotFoundError } from "../utils/errors";

export const getSubscription = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;

    const subscription = await UserSubscription.findOne({ userId });

    if (!subscription) {
      const newSubscription = await UserSubscription.create({
        userId,
        tier: "free",
        receiptsScannedThisMonth: 0,
        monthResetDate: new Date(
          new Date().getFullYear(),
          new Date().getMonth() + 1,
          1
        ),
      });

      return res
        .status(200)
        .json({ success: true, data: { subscription: newSubscription } });
    }

    res.status(200).json({ success: true, data: { subscription } });
  } catch (error) {
    next(error);
  }
};

export const updateSubscription = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const {
      monthlyBudget,
      preferredCurrency,
      notificationSettings,
      customCategories,
    } = req.body;

    const subscription = await UserSubscription.findOne({ userId });
    if (!subscription) throw new NotFoundError("Subscription not found");

    if (monthlyBudget !== undefined) subscription.monthlyBudget = monthlyBudget;
    if (preferredCurrency) subscription.preferredCurrency = preferredCurrency;
    if (notificationSettings)
      subscription.notificationSettings = {
        ...subscription.notificationSettings,
        ...notificationSettings,
      };
    if (customCategories) subscription.customCategories = customCategories;

    await subscription.save();

    res
      .status(200)
      .json({
        success: true,
        message: "Subscription updated successfully",
        data: { subscription },
      });
  } catch (error) {
    next(error);
  }
};

export const upgradeToPremium = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const subscription = await UserSubscription.findOne({ userId });
    if (!subscription) throw new NotFoundError("Subscription not found");

    if (subscription.tier === "premium") {
      return res
        .status(200)
        .json({ success: true, message: "Already on premium tier" });
    }

    subscription.tier = "premium";
    subscription.subscriptionEndsAt = null;
    await subscription.save();

    res
      .status(200)
      .json({
        success: true,
        message: "Successfully upgraded to Premium!",
        data: { subscription },
      });
  } catch (error) {
    next(error);
  }
};

export const downgradeToFree = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const subscription = await UserSubscription.findOne({ userId });
    if (!subscription) throw new NotFoundError("Subscription not found");

    if (subscription.tier === "free") {
      return res
        .status(200)
        .json({ success: true, message: "Already on free tier" });
    }

    subscription.tier = "free";
    subscription.subscriptionEndsAt = null;
    await subscription.save();

    res
      .status(200)
      .json({
        success: true,
        message: "Downgraded to free tier",
        data: { subscription },
      });
  } catch (error) {
    next(error);
  }
};
