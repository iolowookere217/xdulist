import mongoose, { Document, Schema, Types, Model } from "mongoose";
import crypto from "crypto";

export interface IRefreshToken extends Document {
  userId: Types.ObjectId;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  isValid(): boolean;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    token: {
      type: String,
      required: [true, "Token is required"],
    },
    expiresAt: {
      type: Date,
      required: [true, "Expiration date is required"],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Hash token before saving
refreshTokenSchema.pre("save", async function (next) {
  if (!this.isModified("token") || !this.isNew) {
    return next();
  }

  try {
    // Hash the token using SHA-256
    this.token = crypto.createHash("sha256").update(this.token).digest("hex");
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to check if token is still valid
refreshTokenSchema.methods.isValid = function (): boolean {
  return this.expiresAt > new Date();
};

// Static method to hash a token for comparison
refreshTokenSchema.statics.hashToken = function (token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
};

// Indexes - defined here explicitly instead of in field definitions
refreshTokenSchema.index({ token: 1 }, { unique: true });
refreshTokenSchema.index({ userId: 1 });

// TTL index to automatically delete expired tokens after 24 hours
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 86400 });

interface RefreshTokenModel extends Model<IRefreshToken> {
  hashToken(token: string): string;
}

export const RefreshToken = mongoose.model<IRefreshToken, RefreshTokenModel>(
  "RefreshToken",
  refreshTokenSchema
);
