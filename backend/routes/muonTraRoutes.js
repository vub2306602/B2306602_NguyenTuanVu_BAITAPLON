const express = require('express');
const router = express.Router();
const { protect, protectDocGia } = require('../middlewares/authMiddleware');
const {
  datMuonSach,
  datMuonGioHang,
  getTrangThaiDocGia,
  duyetMuonSach,
  tuChoiMuonSach,
  xacNhanTraSach,
  getAllPhieuMuon,
  getLichSuCaNhan,
  getChiTietPhieuMuon,
  huyYeuCauMuon,
} = require('../controllers/muonTraController');

// 1. Độc giả đặt mượn sách đơn lẻ
router.post('/dat-muon', protectDocGia, datMuonSach);

// 2. Độc giả đặt mượn theo giỏ hàng (nhiều cuốn / nhiều bản)
router.post('/dat-muon-gio-hang', protectDocGia, datMuonGioHang);

// 3. Độc giả kiểm tra hạn mức & trạng thái mượn (để kiểm tra giỏ hàng)
router.get('/trang-thai-doc-gia', protectDocGia, getTrangThaiDocGia);

// 4. Độc giả xem lịch sử mượn sách cá nhân
router.get('/lich-su-ca-nhan', protectDocGia, getLichSuCaNhan);

// 5. Độc giả hủy yêu cầu mượn sách (khi đang ở trạng thái 'ChoDuyet')
router.put('/huy-yeu-cau/:id', protectDocGia, huyYeuCauMuon);

// 3. Nhân viên lấy danh sách toàn bộ phiếu mượn (lọc theo trạng thái, tìm kiếm, phân trang)
router.get('/', protect, getAllPhieuMuon);

// 3.1. Nhân viên xem chi tiết một phiếu mượn (kèm thông tin độc giả, sách để in phiếu)
router.get('/:id', protect, getChiTietPhieuMuon);

// 4. Nhân viên duyệt phiếu mượn (đổi sang DangMuon, +14 ngày HanTra, trừ 1 SoQuyen)
router.put('/duyet/:id', protect, duyetMuonSach);

// 5. Nhân viên từ chối mượn (đổi sang TuChoi, ghi nhận lý do)
router.put('/tu-choi/:id', protect, tuChoiMuonSach);

// 6. Nhân viên xác nhận trả sách (đổi sang DaTra, NgayTra = Date.now, cộng 1 SoQuyen)
router.put('/tra-sach/:id', protect, xacNhanTraSach);

module.exports = router;

