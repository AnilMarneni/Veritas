const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

let upload;
const useCloudinary = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET;

if (useCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'veritas',
      allowed_formats: ['jpg', 'png', 'jpeg', 'pdf'],
    },
  });

  upload = multer({ storage });
  console.log('☁️  Cloudinary storage integration initialized successfully.');
} else {
  // Fallback to local storage
  const uploadDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
  });

  upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
      const allowedExts = ['.jpg', '.png', '.jpeg', '.pdf'];
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowedExts.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error('Only images (.jpg, .png, .jpeg) and PDFs (.pdf) are allowed'));
      }
    }
  });

  console.log('📁 Cloudinary credentials missing. Falling back to local disk storage in server/uploads/.');
}

module.exports = { cloudinary, upload, useCloudinary };
