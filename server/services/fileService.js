// Storage abstraction layer.
//
// Every other file in the app should ask THIS module to save/delete files
// instead of touching the filesystem directly. That way, when you're
// ready to move to Cloudinary or S3, you only need to rewrite the two
// functions below — nothing in the controllers, routes, or frontend has
// to change.

const fs = require('fs');
const path = require('path');

const UPLOADS_ROOT = path.join(__dirname, '..', 'uploads');

// Multer already saved the file to disk and gives us its path.
// We just turn that into a public URL like "/uploads/audio/169....mp3"
// that the frontend can use directly in an <audio> or <img> tag.
function getPublicUrlForUploadedFile(file) {
  if (!file) return '';
  const folder = file.fieldname === 'audio' ? 'audio' : 'posters';
  return `/uploads/${folder}/${file.filename}`;
}

// Deletes a previously-uploaded file given its public URL
// (e.g. "/uploads/posters/12345-cover.jpg"). Safe to call with an
// empty/missing URL - it just does nothing.
//
// --- MOVING TO CLOUDINARY / S3 LATER ---
// Replace the body of this function (and getPublicUrlForUploadedFile
// above) with calls to the Cloudinary/S3 SDK. Everywhere else in the
// app just stores/reads a URL string, so no other files need to change.
function deleteFileByUrl(publicUrl) {
  if (!publicUrl) return;
  try {
    const relativePath = publicUrl.replace('/uploads/', '');
    const fullPath = path.join(UPLOADS_ROOT, relativePath);
    // Only delete files that are actually inside our uploads folder.
    if (fullPath.startsWith(UPLOADS_ROOT) && fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (err) {
    // Don't crash the request just because cleanup failed.
    console.warn('Could not delete file:', publicUrl, err.message);
  }
}

module.exports = { getPublicUrlForUploadedFile, deleteFileByUrl };
