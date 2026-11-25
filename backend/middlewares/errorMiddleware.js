/**
 * Middleware xử lý lỗi tập trung
 * Đặt cuối cùng trong chuỗi middleware của app.js
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Lỗi trùng key unique của MongoDB (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `Giá trị '${err.keyValue[field]}' của trường '${field}' đã tồn tại trong hệ thống.`,
    });
  }

  // Lỗi validation Mongoose
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: messages.join(', ') });
  }

  // Lỗi CastError (ObjectId không hợp lệ)
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'ID không hợp lệ.' });
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Lỗi máy chủ nội bộ.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Middleware bắt route không tồn tại (404)
 */
const notFound = (req, res, next) => {
  const error = new Error(`Không tìm thấy route: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

module.exports = { errorHandler, notFound };

