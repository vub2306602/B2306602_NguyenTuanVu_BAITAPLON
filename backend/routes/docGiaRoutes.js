const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middlewares/authMiddleware');
const {
  getAllDocGia,
  getDocGiaById,
  updateDocGia,
  deleteDocGia,
  toggleKhoaDocGia,
  capLaiMatKhauDocGia,
} = require('../controllers/docGiaController');

// Quản lý độc giả dành cho Admin / Thủ thư
router.route('/')
  .get(protect, getAllDocGia);

router.route('/:id/khoa')
  .put(protect, toggleKhoaDocGia);

router.route('/:id/reset-password')
  .put(protect, capLaiMatKhauDocGia);

router.route('/:id')
  .get(protect, getDocGiaById)
  .put(protect, updateDocGia)
  .delete(protect, adminOnly, deleteDocGia);

module.exports = router;

