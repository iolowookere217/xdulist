import mongoose, { Document } from 'mongoose';
export interface IEmailVerification extends Document {
    userId: mongoose.Types.ObjectId;
    token: string;
    expiresAt: Date;
    createdAt: Date;
    isValid(): boolean;
}
export declare const EmailVerification: mongoose.Model<IEmailVerification, {}, {}, {}, mongoose.Document<unknown, {}, IEmailVerification, {}, {}> & IEmailVerification & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=EmailVerification.d.ts.map