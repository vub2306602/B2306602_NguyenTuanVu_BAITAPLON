const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middlewares/authMiddleware');
const {
  getAllNhanVien,
  getNhanVienById,
  createNhanVien,
  updateNhanVien,
  doiQuyenNhanVien,
  toggleKhoaNhanVien,
  deleteNhanVien,
} = require('../controllers/nhanVienController');

// Tất cả các thao tác CRUD Nhân viên đều yêu cầu đăng nhập và chỉ dành cho Admin
router.use(protect, adminOnly);

router.route('/')
  .get(getAllNhanVien)
  .post(createNhanVien);

router.route('/:id')
  .get(getNhanVienById)
  .put(updateNhanVien)
  .delete(deleteNhanVien);

router.put('/:id/quyen', doiQuyenNhanVien);
router.put('/:id/khoa', toggleKhoaNhanVien);

module.exports = router;

