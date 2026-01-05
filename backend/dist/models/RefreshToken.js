"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshToken = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const crypto_1 = __importDefault(require("crypto"));
const refreshTokenSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
}, {
    timestamps: { createdAt: true, updatedAt: false },
});
// Hash token before saving
refreshTokenSchema.pre("save", async function (next) {
    if (!this.isModified("token") || !this.isNew) {
        return next();
    }
    try {
        // Hash the token using SHA-256
        this.token = crypto_1.default.createHash("sha256").update(this.token).digest("hex");
        next();
    }
    catch (error) {
        next(error);
    }
});
// Method to check if token is still valid
refreshTokenSchema.methods.isValid = function () {
    return this.expiresAt > new Date();
};
// Static method to hash a token for comparison
refreshTokenSchema.statics.hashToken = function (token) {
    return crypto_1.default.createHash("sha256").update(token).digest("hex");
};
// Indexes - defined here explicitly instead of in field definitions
refreshTokenSchema.index({ token: 1 }, { unique: true });
refreshTokenSchema.index({ userId: 1 });
// TTL index to automatically delete expired tokens after 24 hours
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 86400 });
exports.RefreshToken = mongoose_1.default.model("RefreshToken", refreshTokenSchema);
//# sourceMappingURL=RefreshToken.js.map