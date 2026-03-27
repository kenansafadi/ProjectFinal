const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
   destination: (_req, _file, done) => done(null, uploadDir),
   filename: (_req, file, done) => {
      const ext = path.extname(file.originalname).toLowerCase();
      done(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
   },
});

const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const docExtensions = ['.pdf', '.doc', '.docx', '.txt', '.zip', '.csv', '.xls', '.xlsx'];

const imageFilter = (_req, file, done) => {
   const ext = path.extname(file.originalname).toLowerCase();
   if (imageExtensions.includes(ext)) {
      done(null, true);
   } else {
      done(new Error('Only JPEG, PNG, GIF, and WebP images are allowed'), false);
   }
};

const fileFilter = (_req, file, done) => {
   const ext = path.extname(file.originalname).toLowerCase();
   if ([...imageExtensions, ...docExtensions].includes(ext)) {
      done(null, true);
   } else {
      done(new Error('File type not allowed'), false);
   }
};

const upload = multer({ storage, fileFilter: imageFilter, limits: { fileSize: 5 * 1024 * 1024 } });
const fileUpload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

module.exports = upload;
module.exports.fileUpload = fileUpload;
