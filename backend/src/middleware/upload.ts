import multer from 'multer';
import { ValidationError } from '../utils/errors';

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter for allowed types
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
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
  } else {
    cb(new ValidationError('Invalid file type. Only JPEG, PNG, WEBP, and PDF files are allowed.'));
  }
};

// Create multer upload instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  }
});

// Export middleware for single file upload
export const uploadSingleReceipt = upload.single('receipt');
