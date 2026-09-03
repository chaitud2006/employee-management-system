const errorHandler = (err, req, res, next) => {
  console.error('API Error Stack:', err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    errorCode: err.code || 'SERVER_ERROR'
  });
};

module.exports = errorHandler;