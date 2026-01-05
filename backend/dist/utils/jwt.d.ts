export interface JWTPayload {
    userId: string;
    email: string;
    tier: "free" | "premium";
}
export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}
export declare const generateAccessToken: (payload: JWTPayload) => string;
export declare const generateRefreshToken: () => string;
export declare const verifyAccessToken: (token: string) => JWTPayload;
export declare const getRefreshTokenExpiration: () => Date;
export declare const generateTokenPair: (payload: JWTPayload) => TokenPair;
export declare const extractTokenFromHeader: (authorizationHeader?: string) => string | null;
//# sourceMappingURL=jwt.d.ts.map