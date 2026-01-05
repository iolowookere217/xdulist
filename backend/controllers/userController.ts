import { Response, NextFunction } from "express";
import { User } from "../models/User";
import { UserSubscription } from "../models/UserSubscription";
import { AuthRequest } from "../types";
import { NotFoundError, UnauthorizedError } from "../utils/errors";

export const getProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;

    const [user, subscription] = await Promise.all([
      User.findById(userId).select("-password"),
      UserSubscription.findOne({ userId }),
    ]);

    if (!user) throw new NotFoundError("User not found");

    res
      .status(200)
      .json({
        success: true,
        data: {
          user: {
            id: user._id,
            email: user.email,
            fullName: user.fullName,
            avatar: user.avatar,
            isEmailVerified: user.isEmailVerified,
          },
          subscription: subscription || {
            tier: "free",
            receiptsScannedThisMonth: 0,
          },
        },
      });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const { fullName, avatar } = req.body;

    const user = await User.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    if (fullName) user.fullName = fullName;
    if (avatar) user.avatar = avatar;

    await user.save();

    res
      .status(200)
      .json({
        success: true,
        message: "Profile updated successfully",
        data: {
          user: {
            id: user._id,
            email: user.email,
            fullName: user.fullName,
            avatar: user.avatar,
          },
        },
      });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.userId;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid)
      throw new UnauthorizedError("Current password is incorrect");

    user.password = newPassword;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    next(error);
  }
};
