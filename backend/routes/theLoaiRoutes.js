const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  getAllTheLoai,
  getTheLoaiById,
  createTheLoai,
  updateTheLoai,
  deleteTheLoai,
} = require('../controllers/theLoaiController');

// GET /api/theloai        — Lấy danh sách (Public)
// POST /api/theloai       — Tạo mới (cần đăng nhập)
router.route('/').get(getAllTheLoai).post(protect, createTheLoai);

// GET /api/theloai/:id    — Chi tiết (Public)
// PUT /api/theloai/:id    — Cập nhật (cần đăng nhập)
// DELETE /api/theloai/:id — Xóa (cần đăng nhập)
router.route('/:id').get(getTheLoaiById).put(protect, updateTheLoai).delete(protect, deleteTheLoai);

module.exports = router;

