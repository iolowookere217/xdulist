import mongoose, { Document, Schema } from "mongoose";
import crypto from "crypto";

export interface IEmailVerification extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  isValid(): boolean;
}

const emailVerificationSchema = new Schema<IEmailVerification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    token: { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

emailVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 86400 });

emailVerificationSchema.methods.isValid = function (): boolean {
  return this.expiresAt > new Date();
};
emailVerificationSchema.statics.generateToken = function (): string {
  return crypto.randomBytes(32).toString("hex");
};
emailVerificationSchema.statics.hashToken = function (token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const EmailVerification = mongoose.model<IEmailVerification>(
  "EmailVerification",
  emailVerificationSchema
);
