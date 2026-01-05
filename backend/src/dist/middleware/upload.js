"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadSingleReceipt = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const errors_1 = require("../utils/errors");
// Configure multer for memory storage
const storage = multer_1.default.memoryStorage();
// File filter for allowed types
const fileFilter = (req, file, cb) => {
    // Allowed mime types for receipts
    const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/jpg',
        'application/pdf'
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new errors_1.ValidationError('Invalid file type. Only JPEG, PNG, WEBP, and PDF files are allowed.'));
    }
};
// Create multer upload instance
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
    }
});
// Export middleware for single file upload
exports.uploadSingleReceipt = exports.upload.single('receipt');
//# sourceMappingURL=upload.js.map