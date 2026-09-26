// Handles incoming file uploads (audio + poster image) with multer.
//
// Files are stored on local disk under /server/uploads. This is the ONLY
// file that knows about "local disk" — the rest of the app just deals in
// URLs. See services/fileService.js for the matching delete logic and for
// notes on moving to Cloudinary/S3 later.

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const AUDIO_DIR = path.join(__dirname, '..', 'uploads', 'audio');
const POSTER_DIR = path.join(__dirname, '..', 'uploads', 'posters');

// Make sure the folders exist (useful on a fresh clone of the project).
[AUDIO_DIR, POSTER_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'audio') return cb(null, AUDIO_DIR);
    if (file.fieldname === 'poster') return cb(null, POSTER_DIR);
    cb(new Error('Unexpected file field'), null);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  if (file.fieldname === 'audio') {
    if (!file.mimetype.startsWith('audio/')) {
      return cb(new Error('The audio field must be an audio file'));
    }
  }
  if (file.fieldname === 'poster') {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('The poster field must be an image file'));
    }
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 70 * 1024 * 1024 }, // 50MB, generous for audio files
});

// Accepts an optional audio file and an optional poster image in the
// same multipart/form-data request.
const uploadSongFiles = upload.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'poster', maxCount: 1 },
]);

module.exports = { uploadSongFiles, AUDIO_DIR, POSTER_DIR };
