import { v2 as cloudinary } from "cloudinary";
import { InternalServerError } from "../utils/errors";

class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    if (!process.env.CLOUDINARY_CLOUD_NAME)
      console.warn(
        "⚠️  Cloudinary credentials not set. File uploads will fail."
      );
  }

  async uploadReceipt(
    file: Express.Multer.File,
    userId: string
  ): Promise<string> {
    try {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `moneymata/receipts/${userId}`,
            resource_type: "auto",
            transformation: [{ quality: "auto", fetch_format: "auto" }],
          },
          (error, result) => {
            if (error)
              reject(
                new InternalServerError("Failed to upload file to Cloudinary")
              );
            else resolve(result!.secure_url);
          }
        );
        uploadStream.end(file.buffer);
      });
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw new InternalServerError("Failed to upload receipt");
    }
  }

  async deleteReceipt(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error("Cloudinary delete error:", error);
    }
  }
}

export default new CloudinaryService();
