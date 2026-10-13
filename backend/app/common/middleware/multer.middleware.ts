import multer from "multer";

// Memory storage so we can pass buffer directly to Django face service
const memoryStorage = multer.memoryStorage();

export const upload = multer({
  storage: memoryStorage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /png|jpg|jpeg|gif|webp|bmp/;
    if (
      allowed.test(file.mimetype) ||
      allowed.test(file.originalname.toLowerCase())
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});
