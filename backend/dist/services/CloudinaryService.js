"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinary_1 = require("cloudinary");
const errors_1 = require("../utils/errors");
class CloudinaryService {
    constructor() {
        // Configure Cloudinary
        cloudinary_1.v2.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });
        if (!process.env.CLOUDINARY_CLOUD_NAME) {
            console.warn('⚠️  Cloudinary credentials not set. File uploads will fail.');
        }
    }
    /**
     * Upload receipt image to Cloudinary
     */
    async uploadReceipt(file, userId) {
        try {
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                    folder: `moneymata/receipts/${userId}`,
                    resource_type: 'auto',
                    transformation: [
                        { quality: 'auto', fetch_format: 'auto' }
                    ]
                }, (error, result) => {
                    if (error) {
                        reject(new errors_1.InternalServerError('Failed to upload file to Cloudinary'));
                    }
                    else {
                        resolve(result.secure_url);
                    }
                });
                uploadStream.end(file.buffer);
            });
        }
        catch (error) {
            console.error('Cloudinary upload error:', error);
            throw new errors_1.InternalServerError('Failed to upload receipt');
        }
    }
    /**
     * Delete receipt from Cloudinary
     */
    async deleteReceipt(publicId) {
        try {
            await cloudinary_1.v2.uploader.destroy(publicId);
        }
        catch (error) {
            console.error('Cloudinary delete error:', error);
            // Don't throw error, just log it
        }
    }
}
exports.default = new CloudinaryService();
//# sourceMappingURL=CloudinaryService.js.map