import { Request, Response, NextFunction } from "express";
import { z, ZodSchema } from "zod";
import { ValidationError } from "../utils/errors";

export const RegisterSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const CreateExpenseSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z
    .number()
    .positive("Amount must be positive")
    .max(1000000, "Amount too large"),
  category: z
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
  currency: z.enum(["NGN", "USD", "GBP"]).default("NGN"),
  date: z.string().optional(),
  receiptUrl: z.string().url().optional(),
  merchant: z.string().optional(),
  isRecurring: z.boolean().optional(),
});

export const UpdateExpenseSchema = CreateExpenseSchema.partial();

export const CreateTodoSchema = z.object({
  description: z.string().min(1, "Description is required"),
  startTime: z
    .string()
    .regex(
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      "Invalid time format (use HH:mm)"
    ),
});

export const UpdateTodoSchema = z.object({
  description: z.string().min(1).optional(),
  startTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional(),
  isCompleted: z.boolean().optional(),
});

export const UpdateSubscriptionSchema = z.object({
  tier: z.enum(["free", "premium"]).optional(),
  monthlyBudget: z.number().positive().optional(),
  preferredCurrency: z.string().optional(),
  notificationSettings: z
    .object({
      spendingAlerts: z.boolean().optional(),
      weeklySummary: z.boolean().optional(),
      budgetWarnings: z.boolean().optional(),
    })
    .optional(),
  customCategories: z
    .array(z.string())
    .max(20, "Maximum 20 custom categories")
    .optional(),
});

export const UpdateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  avatar: z.string().url().optional(),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export const VoiceTranscriptSchema = z.object({
  transcript: z.string().min(1, "Transcript is required"),
});

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map((err: any) => ({
          field: Array.isArray(err.path)
            ? err.path.join(".")
            : String(err.path),
          message: err.message,
        }));
        throw new ValidationError(JSON.stringify(errors));
      }
      next(error);
    }
  };
};
