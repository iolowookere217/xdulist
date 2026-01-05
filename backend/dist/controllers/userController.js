"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.updateProfile = exports.getProfile = void 0;
const User_1 = require("../models/User");
const UserSubscription_1 = require("../models/UserSubscription");
const errors_1 = require("../utils/errors");
/**
 * Get user profile with subscription
 * GET /api/users/profile
 */
const getProfile = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const [user, subscription] = await Promise.all([
            User_1.User.findById(userId).select('-password'),
            UserSubscription_1.UserSubscription.findOne({ userId })
        ]);
        if (!user) {
            throw new errors_1.NotFoundError('User not found');
        }
        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    fullName: user.fullName,
                    avatar: user.avatar,
                    isEmailVerified: user.isEmailVerified
                },
                subscription: subscription || { tier: 'free', receiptsScannedThisMonth: 0 }
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getProfile = getProfile;
/**
 * Update user profile
 * PUT /api/users/profile
 */
const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { fullName, avatar } = req.body;
        const user = await User_1.User.findById(userId);
        if (!user) {
            throw new errors_1.NotFoundError('User not found');
        }
        if (fullName)
            user.fullName = fullName;
        if (avatar)
            user.avatar = avatar;
        await user.save();
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    fullName: user.fullName,
                    avatar: user.avatar
                }
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateProfile = updateProfile;
/**
 * Change password
 * PUT /api/users/password
 */
const changePassword = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { currentPassword, newPassword } = req.body;
        const user = await User_1.User.findById(userId);
        if (!user) {
            throw new errors_1.NotFoundError('User not found');
        }
        // Verify current password
        const isPasswordValid = await user.comparePassword(currentPassword);
        if (!isPasswordValid) {
            throw new errors_1.UnauthorizedError('Current password is incorrect');
        }
        // Update password (will be hashed by pre-save hook)
        user.password = newPassword;
        await user.save();
        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.changePassword = changePassword;
//# sourceMappingURL=userController.js.map