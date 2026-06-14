import multer from 'multer';

// Use memory storage so we can pass buffer to ImageKit
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Allow all files to prevent crashes, we can validate later or let ImageKit handle it
  cb(null, true);
};

// Upload middleware configurations
export const uploadImages = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 8, // max 8 files
  },
});

export const uploadAvatar = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
    files: 1,
  },
});
