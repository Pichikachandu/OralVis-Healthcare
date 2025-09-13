const multer = require('multer');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 3 // Max 3 files
  }
});

// Middleware for handling multiple file uploads
const uploadFiles = upload.fields([
  { name: 'upper', maxCount: 1 },
  { name: 'front', maxCount: 1 },
  { name: 'lower', maxCount: 1 }
]);

// Wrapper to handle errors
const handleUpload = (req, res, next) => {
  uploadFiles(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred during upload
      return res.status(400).json({ msg: err.message });
    } else if (err) {
      // An unknown error occurred
      return res.status(500).json({ msg: err.message });
    }
    next();
  });
};

module.exports = handleUpload;