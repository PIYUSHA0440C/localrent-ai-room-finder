import multer from 'multer';

// Use memory storage so we can pass buffer to ImageKit
const storage = multer.memoryStorage();

// File filter - only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
  }
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
