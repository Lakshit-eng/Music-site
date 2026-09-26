// Central error handler. Any error passed to next(err) — or thrown inside
// an async route wrapped with utils/asyncHandler — ends up here, so error
// responses stay consistent across the whole API.

function errorHandler(err, req, res, next) {
  console.error(err);

  // Multer file-too-large / bad file type errors
  if (err.name === 'MulterError' || err.message?.includes('file')) {
    return res.status(400).json({ message: err.message });
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
    return res.status(400).json({ message });
  }

  // Invalid MongoDB ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID.' });
  }

  const status = err.status || 500;
  const message = err.message || 'Something went wrong on the server.';
  res.status(status).json({ message });
}

function notFound(req, res) {
  res.status(404).json({ message: 'Route not found.' });
}

module.exports = { errorHandler, notFound };
