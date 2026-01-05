import mongoose, { Document, Types } from 'mongoose';
export interface ITodo extends Document {
    userId: Types.ObjectId;
    description: string;
    startTime: string;
    reminderTime?: string;
    isCompleted: boolean;
    reminderSent: boolean;
    reminderDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Todo: mongoose.Model<ITodo, {}, {}, {}, mongoose.Document<unknown, {}, ITodo, {}, {}> & ITodo & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Todo.d.ts.map