import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    email: string;
    password?: string;
    fullName: string;
    googleId?: string;
    avatar?: string;
    isEmailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=User.d.ts.map