const express = require('express');
const router = express.Router();
const { protect, protectDocGia } = require('../middlewares/authMiddleware');
const {
  loginNhanVien,
  getMe,
  registerDocGia,
  loginDocGia,
  getDocGiaMe,
  doiMatKhauDocGia,
} = require('../controllers/authController');

// --- Routes cho Nhân viên / Admin ---
// POST /api/auth/nhanvien/login  — Đăng nhập, trả về JWT (Public)
router.post('/nhanvien/login', loginNhanVien);

// GET /api/auth/nhanvien/me      — Lấy thông tin bản thân (Private)
router.get('/nhanvien/me', protect, getMe);

// --- Routes cho Độc giả ---
// POST /api/auth/docgia/register — Đăng ký tài khoản độc giả (Public)
router.post('/docgia/register', registerDocGia);

// POST /api/auth/docgia/login    — Đăng nhập tài khoản độc giả (Public)
router.post('/docgia/login', loginDocGia);

// GET /api/auth/docgia/me        — Lấy thông tin độc giả đăng nhập (Private)
router.get('/docgia/me', protectDocGia, getDocGiaMe);

// PUT /api/auth/docgia/change-password — Độc giả tự đổi mật khẩu (Private)
router.put('/docgia/change-password', protectDocGia, doiMatKhauDocGia);

module.exports = router;
