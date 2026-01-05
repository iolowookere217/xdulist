import mongoose, { Document, Types } from 'mongoose';
export type SubscriptionTier = 'free' | 'premium';
export interface NotificationSettings {
    spendingAlerts: boolean;
    weeklySummary: boolean;
    budgetWarnings: boolean;
}
export interface IUserSubscription extends Document {
    userId: Types.ObjectId;
    tier: SubscriptionTier;
    receiptsScannedThisMonth: number;
    monthResetDate: Date;
    monthlyBudget?: number;
    preferredCurrency: string;
    notificationSettings: NotificationSettings;
    customCategories: string[];
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    subscriptionEndsAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const UserSubscription: mongoose.Model<IUserSubscription, {}, {}, {}, mongoose.Document<unknown, {}, IUserSubscription, {}, {}> & IUserSubscription & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=UserSubscription.d.ts.map