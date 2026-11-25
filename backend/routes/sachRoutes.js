const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const {
  getAllSach,
  getSachById,
  createSach,
  updateSach,
  deleteSach,
} = require('../controllers/sachController');

// GET /api/sach: Public, hỗ trợ page, limit, keyword, theloai, nxb
// POST /api/sach: Private (Thủ thư / Admin), hỗ trợ upload ảnh bìa (multipart/form-data) hoặc JSON
router.route('/')
  .get(getAllSach)
  .post(protect, upload.single('HinhAnh'), createSach);

// GET /api/sach/:id: Public
// PUT /api/sach/:id: Private, hỗ trợ cập nhật ảnh hoặc JSON
// DELETE /api/sach/:id: Private
router.route('/:id')
  .get(getSachById)
  .put(protect, upload.single('HinhAnh'), updateSach)
  .delete(protect, deleteSach);

module.exports = router;

