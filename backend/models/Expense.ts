import mongoose, { Document, Schema, Types } from "mongoose";

export type ExpenseCategory =
  | "groceries"
  | "transport"
  | "dining"
  | "entertainment"
  | "utilities"
  | "healthcare"
  | "shopping"
  | "travel"
  | "education"
  | "subscriptions"
  | "other";

export type Currency = "NGN" | "USD" | "GBP";

export interface IExpense extends Document {
  userId: Types.ObjectId;
  description: string;
  amount: number;
  category?: ExpenseCategory;
  date: Date;
  receiptUrl?: string;
  currency: Currency;
  isRecurring: boolean;
  merchant?: string;
  aiExtracted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const expenseSchema = new Schema<IExpense>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [1, "Description cannot be empty"],
      maxlength: [200, "Description must not exceed 200 characters"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount must be positive"],
      max: [1000000, "Amount too large"],
    },
    category: {
      type: String,
      enum: {
        values: [
          "groceries",
          "transport",
          "dining",
          "entertainment",
          "utilities",
          "healthcare",
          "shopping",
          "travel",
          "education",
          "subscriptions",
          "other",
        ],
        message: "{VALUE} is not a valid category",
      },
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      default: Date.now,
    },
    receiptUrl: { type: String },
    currency: {
      type: String,
      enum: {
        values: ["NGN", "USD", "GBP"],
        message: "{VALUE} is not a supported currency",
      },
      default: "NGN",
    },
    isRecurring: { type: Boolean, default: false },
    merchant: {
      type: String,
      trim: true,
      maxlength: [100, "Merchant name must not exceed 100 characters"],
    },
    aiExtracted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ userId: 1, category: 1 });
expenseSchema.index({ userId: 1, createdAt: -1 });

export const Expense = mongoose.model<IExpense>("Expense", expenseSchema);
