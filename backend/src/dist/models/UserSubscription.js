"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSubscription = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const userSubscriptionSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
            validator: function (categories) {
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
}, {
    timestamps: true
});
// Indexes
userSubscriptionSchema.index({ userId: 1 }, { unique: true });
userSubscriptionSchema.index({ monthResetDate: 1 });
userSubscriptionSchema.index({ tier: 1 });
// Virtual to check if subscription is active
userSubscriptionSchema.virtual('isActive').get(function () {
    if (this.tier === 'free')
        return true;
    if (!this.subscriptionEndsAt)
        return true;
    return this.subscriptionEndsAt > new Date();
});
exports.UserSubscription = mongoose_1.default.model('UserSubscription', userSubscriptionSchema);
//# sourceMappingURL=UserSubscription.js.map