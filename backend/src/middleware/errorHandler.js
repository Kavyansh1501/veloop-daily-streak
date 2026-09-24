// Catches everything so Mongo/JWT/Axios internals never leak to the client
// (see spec section 92 - "Claim Errors" must not expose Mongo/Axios errors).
const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ success: false, message: 'Invalid data provided.' });
  }
  if (err.code === 11000) {
    return res.status(409).json({ success: false, message: 'This action has already been completed.' });
  }

  const status = err.statusCode || 500;
  const message = status === 500 ? 'Something went wrong. Please try again.' : err.message;
  res.status(status).json({ success: false, message });
};

module.exports = errorHandler;
