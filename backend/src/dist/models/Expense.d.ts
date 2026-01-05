import mongoose, { Document, Types } from 'mongoose';
export type ExpenseCategory = 'groceries' | 'transport' | 'dining' | 'entertainment' | 'utilities' | 'healthcare' | 'shopping' | 'travel' | 'education' | 'subscriptions' | 'other';
export type Currency = 'NGN' | 'USD' | 'GBP';
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
export declare const Expense: mongoose.Model<IExpense, {}, {}, {}, mongoose.Document<unknown, {}, IExpense, {}, {}> & IExpense & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Expense.d.ts.map