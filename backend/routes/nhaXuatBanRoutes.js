const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  getAllNhaXuatBan,
  getNhaXuatBanById,
  createNhaXuatBan,
  updateNhaXuatBan,
  deleteNhaXuatBan,
} = require('../controllers/nhaXuatBanController');

// GET /api/nhaxuatban        — Lấy danh sách (Public)
// POST /api/nhaxuatban       — Tạo mới (cần đăng nhập)
router.route('/').get(getAllNhaXuatBan).post(protect, createNhaXuatBan);

// GET /api/nhaxuatban/:id    — Chi tiết (Public)
// PUT /api/nhaxuatban/:id    — Cập nhật (cần đăng nhập)
// DELETE /api/nhaxuatban/:id — Xóa (cần đăng nhập)
router.route('/:id').get(getNhaXuatBanById).put(protect, updateNhaXuatBan).delete(protect, deleteNhaXuatBan);

module.exports = router;

