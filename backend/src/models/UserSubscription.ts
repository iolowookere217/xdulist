import mongoose, { Document, Schema, Types } from 'mongoose';

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

const userSubscriptionSchema = new Schema<IUserSubscription>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    tier: {
      type: String,
      enum: {
        values: ['free', 'premium'],
        message: '{VALUE} is not a valid tier'
      },
      default: 'free',
      required: true
    },
    receiptsScannedThisMonth: {
      type: Number,
      default: 0,
      min: [0, 'Receipt count cannot be negative']
    },
    monthResetDate: {
      type: Date,
      default: () => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth() + 1, 1);
      }
    },
    monthlyBudget: {
      type: Number,
      min: [0, 'Budget must be positive']
    },
    preferredCurrency: {
      type: String,
      default: 'USD',
      enum: ['NGN', 'USD', 'GBP']
    },
    notificationSettings: {
      spendingAlerts: {
        type: Boolean,
        default: true
      },
      weeklySummary: {
        type: Boolean,
        default: true
      },
      budgetWarnings: {
        type: Boolean,
        default: true
      }
    },
    customCategories: {
      type: [String],
      default: [],
      validate: {
        validator: function (categories: string[]) {
          return categories.length <= 20;
        },
        message: 'Cannot have more than 20 custom categories'
      }
    },
    stripeCustomerId: {
      type: String,
      sparse: true
    },
    stripeSubscriptionId: {
      type: String,
      sparse: true
    },
    subscriptionEndsAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Indexes
userSubscriptionSchema.index({ userId: 1 }, { unique: true });
userSubscriptionSchema.index({ monthResetDate: 1 });
userSubscriptionSchema.index({ tier: 1 });

// Virtual to check if subscription is active
userSubscriptionSchema.virtual('isActive').get(function () {
  if (this.tier === 'free') return true;
  if (!this.subscriptionEndsAt) return true;
  return this.subscriptionEndsAt > new Date();
});

export const UserSubscription = mongoose.model<IUserSubscription>(
  'UserSubscription',
  userSubscriptionSchema
);
