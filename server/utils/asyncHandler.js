// Small helper so route handlers don't need try/catch everywhere.
// Wrap an async controller function with this, and any thrown error
// (or rejected promise) is forwarded to the error-handling middleware.

function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
