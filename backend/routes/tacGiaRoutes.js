const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middlewares/authMiddleware');
const {
  getAllTacGia,
  getTacGiaById,
  createTacGia,
  updateTacGia,
  deleteTacGia,
} = require('../controllers/tacGiaController');

// GET  /api/tacgia      — Lấy danh sách tác giả (Public)
// POST /api/tacgia      — Tạo tác giả mới (Private: Nhân viên)
router.route('/')
  .get(getAllTacGia)
  .post(protect, createTacGia);

// GET    /api/tacgia/:id — Lấy chi tiết tác giả (Public)
// PUT    /api/tacgia/:id — Cập nhật tác giả (Private: Nhân viên)
// DELETE /api/tacgia/:id — Xóa tác giả (Private: Admin)
router.route('/:id')
  .get(getTacGiaById)
  .put(protect, updateTacGia)
  .delete(protect, adminOnly, deleteTacGia);

module.exports = router;
