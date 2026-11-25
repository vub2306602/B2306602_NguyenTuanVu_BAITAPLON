const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

// Import Routes
const theLoaiRoutes = require('./routes/theLoaiRoutes');
const nhaXuatBanRoutes = require('./routes/nhaXuatBanRoutes');
const tacGiaRoutes = require('./routes/tacGiaRoutes');
const authRoutes = require('./routes/authRoutes');
const sachRoutes = require('./routes/sachRoutes');
const docGiaRoutes = require('./routes/docGiaRoutes');
const nhanVienRoutes = require('./routes/nhanVienRoutes');
const muonTraRoutes = require('./routes/muonTraRoutes');
const thongKeRoutes = require('./routes/thongKeRoutes');

// Import Middlewares
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');

const app = express();

// ============================================================
// CORS — cho phép 2 frontend gọi API
// ============================================================
const allowedOrigins = [
  process.env.ADMIN_FRONTEND_URL || 'http://localhost:5173',
  process.env.CLIENT_FRONTEND_URL || 'http://localhost:5174',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Cho phép cả request không có origin (Postman, curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: Origin '${origin}' không được phép.`));
      }
    },
    credentials: true,
  })
);

// ============================================================
// MIDDLEWARE CHUNG
// ============================================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log request (chỉ khi môi trường development)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Phục vụ ảnh tĩnh từ thư mục uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================================
// ROUTES
// ============================================================
app.use('/api/auth', authRoutes);
app.use('/api/theloai', theLoaiRoutes);
app.use('/api/nhaxuatban', nhaXuatBanRoutes);
app.use('/api/tacgia', tacGiaRoutes);
app.use('/api/sach', sachRoutes);
app.use('/api/docgia', docGiaRoutes);
app.use('/api/nhanvien', nhanVienRoutes);
app.use('/api/muontra', muonTraRoutes);
app.use('/api/thongke', thongKeRoutes);

// Route kiểm tra server
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Quản Lý Mượn Sách API đang hoạt động ✅', timestamp: new Date().toISOString() });
});

// ============================================================
// ERROR HANDLING — phải đặt cuối cùng
// ============================================================
app.use(notFound);
app.use(errorHandler);

module.exports = app;
