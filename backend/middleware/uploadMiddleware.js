const multer = require('multer');
const path = require('path');

// Set up storage (store files in the local 'uploads' folder)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // 'uploads/' is the folder we just created in the backend root
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    // Create unique file name: fieldname-timestamp.ext
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// File filter to only accept specific image types
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    // Accept the file
    return cb(null, true);
  } else {
    // Reject the file
    cb(new Error('Only images (JPEG, JPG, PNG, GIF) are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB limit
  fileFilter: fileFilter,
});

module.exports = upload;