import { Request, Response, NextFunction } from "express";
import { z, ZodSchema } from "zod";
export declare const RegisterSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    fullName: z.ZodString;
}, z.core.$strip>;
export declare const LoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const CreateExpenseSchema: z.ZodObject<{
    description: z.ZodString;
    amount: z.ZodNumber;
    category: z.ZodOptional<z.ZodEnum<{
        groceries: "groceries";
        transport: "transport";
        dining: "dining";
        entertainment: "entertainment";
        utilities: "utilities";
        healthcare: "healthcare";
        shopping: "shopping";
        travel: "travel";
        education: "education";
        subscriptions: "subscriptions";
        other: "other";
    }>>;
    currency: z.ZodDefault<z.ZodEnum<{
        USD: "USD";
        NGN: "NGN";
        GBP: "GBP";
    }>>;
    date: z.ZodOptional<z.ZodString>;
    receiptUrl: z.ZodOptional<z.ZodString>;
    merchant: z.ZodOptional<z.ZodString>;
    isRecurring: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const UpdateExpenseSchema: z.ZodObject<{
    description: z.ZodOptional<z.ZodString>;
    amount: z.ZodOptional<z.ZodNumber>;
    category: z.ZodOptional<z.ZodOptional<z.ZodEnum<{
        groceries: "groceries";
        transport: "transport";
        dining: "dining";
        entertainment: "entertainment";
        utilities: "utilities";
        healthcare: "healthcare";
        shopping: "shopping";
        travel: "travel";
        education: "education";
        subscriptions: "subscriptions";
        other: "other";
    }>>>;
    currency: z.ZodOptional<z.ZodDefault<z.ZodEnum<{
        USD: "USD";
        NGN: "NGN";
        GBP: "GBP";
    }>>>;
    date: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    receiptUrl: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    merchant: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    isRecurring: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
export declare const CreateTodoSchema: z.ZodObject<{
    description: z.ZodString;
    startTime: z.ZodString;
}, z.core.$strip>;
export declare const UpdateTodoSchema: z.ZodObject<{
    description: z.ZodOptional<z.ZodString>;
    startTime: z.ZodOptional<z.ZodString>;
    isCompleted: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const UpdateSubscriptionSchema: z.ZodObject<{
    tier: z.ZodOptional<z.ZodEnum<{
        free: "free";
        premium: "premium";
    }>>;
    monthlyBudget: z.ZodOptional<z.ZodNumber>;
    preferredCurrency: z.ZodOptional<z.ZodString>;
    notificationSettings: z.ZodOptional<z.ZodObject<{
        spendingAlerts: z.ZodOptional<z.ZodBoolean>;
        weeklySummary: z.ZodOptional<z.ZodBoolean>;
        budgetWarnings: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>>;
    customCategories: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export declare const UpdateProfileSchema: z.ZodObject<{
    fullName: z.ZodOptional<z.ZodString>;
    avatar: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const ChangePasswordSchema: z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodString;
}, z.core.$strip>;
export declare const VoiceTranscriptSchema: z.ZodObject<{
    transcript: z.ZodString;
}, z.core.$strip>;
export declare const validate: (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=validation.d.ts.map