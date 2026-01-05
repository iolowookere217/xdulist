import { Document, Types, Model } from "mongoose";
export interface IRefreshToken extends Document {
    userId: Types.ObjectId;
    token: string;
    expiresAt: Date;
    createdAt: Date;
    isValid(): boolean;
}
interface RefreshTokenModel extends Model<IRefreshToken> {
    hashToken(token: string): string;
}
export declare const RefreshToken: RefreshTokenModel;
export {};
//# sourceMappingURL=RefreshToken.d.ts.map