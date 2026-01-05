"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.VoiceTranscriptSchema = exports.ChangePasswordSchema = exports.UpdateProfileSchema = exports.UpdateSubscriptionSchema = exports.UpdateTodoSchema = exports.CreateTodoSchema = exports.UpdateExpenseSchema = exports.CreateExpenseSchema = exports.LoginSchema = exports.RegisterSchema = void 0;
const zod_1 = require("zod");
const errors_1 = require("../utils/errors");
// Register Schema
exports.RegisterSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
    fullName: zod_1.z.string().min(2, "Full name must be at least 2 characters"),
});
// Login Schema
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address"),
    password: zod_1.z.string().min(1, "Password is required"),
});
// Create Expense Schema
exports.CreateExpenseSchema = zod_1.z.object({
    description: zod_1.z.string().min(1, "Description is required"),
    amount: zod_1.z
        .number()
        .positive("Amount must be positive")
        .max(1000000, "Amount too large"),
    category: zod_1.z
        .enum([
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
    ])
        .optional(),
    currency: zod_1.z.enum(["NGN", "USD", "GBP"]).default("NGN"),
    date: zod_1.z.string().optional(),
    receiptUrl: zod_1.z.string().url().optional(),
    merchant: zod_1.z.string().optional(),
    isRecurring: zod_1.z.boolean().optional(),
});
// Update Expense Schema
exports.UpdateExpenseSchema = exports.CreateExpenseSchema.partial();
// Create Todo Schema
exports.CreateTodoSchema = zod_1.z.object({
    description: zod_1.z.string().min(1, "Description is required"),
    startTime: zod_1.z
        .string()
        .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (use HH:mm)"),
});
// Update Todo Schema
exports.UpdateTodoSchema = zod_1.z.object({
    description: zod_1.z.string().min(1).optional(),
    startTime: zod_1.z
        .string()
        .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .optional(),
    isCompleted: zod_1.z.boolean().optional(),
});
// Update Subscription Schema
exports.UpdateSubscriptionSchema = zod_1.z.object({
    tier: zod_1.z.enum(["free", "premium"]).optional(),
    monthlyBudget: zod_1.z.number().positive().optional(),
    preferredCurrency: zod_1.z.string().optional(),
    notificationSettings: zod_1.z
        .object({
        spendingAlerts: zod_1.z.boolean().optional(),
        weeklySummary: zod_1.z.boolean().optional(),
        budgetWarnings: zod_1.z.boolean().optional(),
    })
        .optional(),
    customCategories: zod_1.z
        .array(zod_1.z.string())
        .max(20, "Maximum 20 custom categories")
        .optional(),
});
// Update Profile Schema
exports.UpdateProfileSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2).optional(),
    avatar: zod_1.z.string().url().optional(),
});
// Change Password Schema
exports.ChangePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1, "Current password is required"),
    newPassword: zod_1.z.string().min(6, "New password must be at least 6 characters"),
});
// Voice Transcript Schema
exports.VoiceTranscriptSchema = zod_1.z.object({
    transcript: zod_1.z.string().min(1, "Transcript is required"),
});
// Generic validation middleware
const validate = (schema) => {
    return (req, res, next) => {
        try {
            schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const errors = error.issues.map((err) => ({
                    field: Array.isArray(err.path)
                        ? err.path.join(".")
                        : String(err.path),
                    message: err.message,
                }));
                throw new errors_1.ValidationError(JSON.stringify(errors));
            }
            next(error);
        }
    };
};
exports.validate = validate;
//# sourceMappingURL=validation.js.map