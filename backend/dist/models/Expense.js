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
exports.Expense = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const expenseSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        minlength: [1, 'Description cannot be empty'],
        maxlength: [200, 'Description must not exceed 200 characters']
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0, 'Amount must be positive'],
        max: [1000000, 'Amount too large']
    },
    category: {
        type: String,
        enum: {
            values: [
                'groceries',
                'transport',
                'dining',
                'entertainment',
                'utilities',
                'healthcare',
                'shopping',
                'travel',
                'education',
                'subscriptions',
                'other'
            ],
            message: '{VALUE} is not a valid category'
        }
    },
    date: {
        type: Date,
        required: [true, 'Date is required'],
        default: Date.now
    },
    receiptUrl: {
        type: String
    },
    currency: {
        type: String,
        enum: {
            values: ['NGN', 'USD', 'GBP'],
            message: '{VALUE} is not a supported currency'
        },
        default: 'NGN'
    },
    isRecurring: {
        type: Boolean,
        default: false
    },
    merchant: {
        type: String,
        trim: true,
        maxlength: [100, 'Merchant name must not exceed 100 characters']
    },
    aiExtracted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});
// Compound indexes for efficient queries
expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ userId: 1, category: 1 });
expenseSchema.index({ userId: 1, createdAt: -1 });
exports.Expense = mongoose_1.default.model('Expense', expenseSchema);
//# sourceMappingURL=Expense.js.map