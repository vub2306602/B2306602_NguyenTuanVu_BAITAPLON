const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  getTongQuan,
  getSachMuonNhieu,
  getTheoTheLoai,
  getTheoTacGia,
  getTheoNhaXuatBan,
  getPhieuQuaHan,
} = require('../controllers/thongKeController');

// Tất cả các API thống kê đều yêu cầu quyền truy cập của Nhân viên/Admin
router.use(protect);

// 1. Thống kê số liệu tổng quan (Tổng sách, Sách đang mượn, Tổng độc giả, Phiếu chờ duyệt)
router.get('/tong-quan', getTongQuan);

// 2. Thống kê top sách được mượn nhiều nhất
router.get('/sach-muon-nhieu', getSachMuonNhieu);

// 3. Thống kê cơ cấu sách theo từng thể loại
router.get('/theo-the-loai', getTheoTheLoai);

// 4. Thống kê cơ cấu sách theo từng tác giả
router.get('/theo-tac-gia', getTheoTacGia);

// 5. Thống kê cơ cấu sách theo từng nhà xuất bản
router.get('/theo-nha-xuat-ban', getTheoNhaXuatBan);

// 6. Danh sách các phiếu mượn quá hạn
router.get('/qua-han', getPhieuQuaHan);

module.exports = router;

