const multer = require('multer');
const path = require('path');

// Store file in memory (buffer)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
    return cb(new Error('Only images are allowed (jpg, jpeg, png)'), false);
  }
  cb(null, true);
};

module.exports = multer({
  storage,
  fileFilter,
});
