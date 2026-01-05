import multer from "multer";
import { Request } from "express";

// In-memory storage for small file uploads (receipts)
const storage = multer.memoryStorage();

export const uploadSingleReceipt = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("receipt");

export default uploadSingleReceipt;
