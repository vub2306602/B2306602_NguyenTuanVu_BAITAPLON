const TheoDoiMuonSach = require('../models/TheoDoiMuonSach');
const Sach = require('../models/Sach');
const DocGia = require('../models/DocGia');
const NhanVien = require('../models/NhanVien');

// @desc    Độc giả đặt mượn sách (đơn lẻ)
// @route   POST /api/muontra/dat-muon
// @access  Private (Độc giả)
const datMuonSach = async (req, res, next) => {
  try {
    const { MaSach, GhiChu } = req.body;
    const MaDocGia = req.docGia ? req.docGia.MaDocGia : req.body.MaDocGia;

    if (!MaDocGia || !MaSach) {
      return res.status(400).json({
        success: false,
        message: 'Mã độc giả và Mã sách là bắt buộc.',
      });
    }

    // 1. Kiểm tra sách có tồn tại không
    const sach = await Sach.findOne({ MaSach });
    if (!sach) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy sách với mã '${MaSach}'.`,
      });
    }

    // 2. Bắt lỗi nếu sách hết số lượng (SoQuyen <= 0)
    if (sach.SoQuyen <= 0) {
      return res.status(400).json({
        success: false,
        message: `Sách '${sach.TenSach}' hiện đã hết số lượng trong kho, không thể đặt mượn.`,
      });
    }

    // 3. Kiểm tra quá hạn và hạn mức 5 quyển sách
    const activePhieus = await TheoDoiMuonSach.find({
      MaDocGia,
      TrangThai: { $in: ['ChoDuyet', 'DangMuon', 'QuaHan'] },
    });

    const now = new Date();
    const isQuaHan = activePhieus.some(
      (p) => p.TrangThai === 'QuaHan' || (p.TrangThai === 'DangMuon' && p.HanTra && new Date(p.HanTra) < now)
    );

    if (isQuaHan) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đang có sách mượn quá hạn chưa hoàn trả! Vui lòng trả sách trước khi mượn tiếp.',
      });
    }

    if (activePhieus.length >= 5) {
      return res.status(400).json({
        success: false,
        message: `Mỗi độc giả chỉ mượn tối đa 5 quyển sách. Bạn đang mượn/chờ duyệt ${activePhieus.length} quyển, đã đạt hạn mức tối đa.`,
      });
    }

    // 4. Tạo phiếu mượn mới với trạng thái mặc định 'ChoDuyet'
    const ngayMuon = new Date();
    const hanTra = new Date(ngayMuon.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 ngày theo quy định
    const phieuMuon = await TheoDoiMuonSach.create({
      MaDocGia,
      MaSach,
      NgayMuon: ngayMuon,
      HanTra: hanTra,
      TrangThai: 'ChoDuyet',
      GhiChu: GhiChu || '',
    });

    res.status(201).json({
      success: true,
      message: 'Đặt mượn sách thành công! Yêu cầu đang chờ thủ thư phê duyệt.',
      data: phieuMuon,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Độc giả đặt mượn theo giỏ hàng (nhiều cuốn / nhiều bản)
// @route   POST /api/muontra/dat-muon-gio-hang
// @access  Private (Độc giả)
const datMuonGioHang = async (req, res, next) => {
  try {
    const { items, GhiChu } = req.body;
    const MaDocGia = req.docGia ? req.docGia.MaDocGia : req.body.MaDocGia;

    if (!MaDocGia) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng đăng nhập tài khoản độc giả.',
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Giỏ hàng đang trống, vui lòng chọn ít nhất 1 cuốn sách.',
      });
    }

    // 1. Kiểm tra quá hạn
    const activePhieus = await TheoDoiMuonSach.find({
      MaDocGia,
      TrangThai: { $in: ['ChoDuyet', 'DangMuon', 'QuaHan'] },
    });

    const now = new Date();
    const isQuaHan = activePhieus.some(
      (p) => p.TrangThai === 'QuaHan' || (p.TrangThai === 'DangMuon' && p.HanTra && new Date(p.HanTra) < now)
    );

    if (isQuaHan) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đang có sách mượn quá hạn chưa hoàn trả! Vui lòng hoàn trả sách trước khi mượn mới.',
      });
    }

    // 2. Tính tổng số lượng yêu cầu
    const tongSoQuyen = items.reduce((sum, item) => sum + (parseInt(item.SoLuong) || 1), 0);
    const dangMuonCount = activePhieus.length;
    const toiDa = 5;

    if (dangMuonCount + tongSoQuyen > toiDa) {
      const conLai = Math.max(0, toiDa - dangMuonCount);
      return res.status(400).json({
        success: false,
        message: `Mỗi độc giả chỉ mượn tối đa 5 quyển sách. Bạn đang mượn/chờ duyệt ${dangMuonCount} quyển, nên chỉ có thể mượn thêm tối đa ${conLai} quyển.`,
      });
    }

    // 3. Kiểm tra từng cuốn sách có tồn tại và đủ số lượng trong kho
    for (const item of items) {
      const soLuong = parseInt(item.SoLuong) || 1;
      const sach = await Sach.findOne({ MaSach: item.MaSach });
      if (!sach) {
        return res.status(404).json({
          success: false,
          message: `Không tìm thấy sách với mã '${item.MaSach}'.`,
        });
      }
      if (sach.SoQuyen < soLuong) {
        return res.status(400).json({
          success: false,
          message: `Sách '${sach.TenSach}' chỉ còn ${sach.SoQuyen} quyển trong kho, không đủ cho yêu cầu mượn ${soLuong} quyển.`,
        });
      }
    }

    // 4. Tạo các phiếu mượn tương ứng cho từng cuốn sách
    const ngayMuon = new Date();
    const hanTra = new Date(ngayMuon.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 ngày theo quy định
    const createdPhieus = [];
    for (const item of items) {
      const soLuong = parseInt(item.SoLuong) || 1;
      for (let i = 0; i < soLuong; i++) {
        const phieu = await TheoDoiMuonSach.create({
          MaDocGia,
          MaSach: item.MaSach,
          NgayMuon: ngayMuon,
          HanTra: hanTra,
          TrangThai: 'ChoDuyet',
          GhiChu: GhiChu || 'Đặt mượn từ giỏ hàng',
        });
        createdPhieus.push(phieu);
      }
    }

    res.status(201).json({
      success: true,
      message: `Đặt mượn thành công ${tongSoQuyen} quyển sách! Yêu cầu đang chờ thủ thư phê duyệt.`,
      count: createdPhieus.length,
      data: createdPhieus,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy trạng thái mượn và hạn mức của độc giả (kiểm tra giỏ hàng, cảnh báo và tự động khóa quá hạn)
// @route   GET /api/muontra/trang-thai-doc-gia
// @access  Private (Độc giả)
const getTrangThaiDocGia = async (req, res, next) => {
  try {
    const MaDocGia = req.docGia ? req.docGia.MaDocGia : req.query.MaDocGia;
    if (!MaDocGia) {
      return res.status(400).json({
        success: false,
        message: 'Không xác định được độc giả.',
      });
    }

    const activePhieus = await TheoDoiMuonSach.find({
      MaDocGia,
      TrangThai: { $in: ['ChoDuyet', 'DangMuon', 'QuaHan'] },
    });

    const now = new Date();
    let maxOverdueDays = 0;
    let overdueCount = 0;

    activePhieus.forEach((p) => {
      if ((p.TrangThai === 'QuaHan' || p.TrangThai === 'DangMuon') && p.HanTra) {
        const hanTraDate = new Date(p.HanTra);
        if (hanTraDate < now) {
          overdueCount++;
          const diffDays = Math.max(1, Math.ceil((now.getTime() - hanTraDate.getTime()) / (1000 * 60 * 60 * 24)));
          if (diffDays > maxOverdueDays) {
            maxOverdueDays = diffDays;
          }
        }
      }
    });

    const isQuaHan = maxOverdueDays > 0;
    let isKhoaDoQuaHan = false;
    let isCanhBao = false;

    // Quy tắc: Quá hạn > 20 ngày tự động khóa tài khoản độc giả; <= 20 ngày thì cảnh báo nhắc nhở
    if (maxOverdueDays > 20) {
      isKhoaDoQuaHan = true;
      await DocGia.findOneAndUpdate({ MaDocGia }, { TrangThai: 'BiKhoa' });
    } else if (maxOverdueDays > 0 && maxOverdueDays <= 20) {
      isCanhBao = true;
    }

    const docGiaInfo = await DocGia.findOne({ MaDocGia }).select('TrangThai HoLot Ten');

    const dangMuonCount = activePhieus.length;
    const toiDa = 5;
    const soLuongConLai = Math.max(0, toiDa - dangMuonCount);

    res.json({
      success: true,
      data: {
        isQuaHan,
        maxOverdueDays,
        overdueCount,
        isCanhBao,
        isKhoaDoQuaHan,
        trangThaiDocGia: docGiaInfo ? docGiaInfo.TrangThai : 'HoatDong',
        dangMuonCount,
        soLuongConLai,
        toiDa,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Phê duyệt mượn sách (Admin / Thủ thư)
// @route   PUT /api/muontra/duyet/:id
// @access  Private (Nhân viên)
const duyetMuonSach = async (req, res, next) => {
  try {
    const phieu = await TheoDoiMuonSach.findById(req.params.id);
    if (!phieu) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phiếu mượn.',
      });
    }

    if (phieu.TrangThai !== 'ChoDuyet') {
      return res.status(400).json({
        success: false,
        message: `Chỉ có thể duyệt phiếu đang ở trạng thái 'ChoDuyet'. Phiếu này hiện là '${phieu.TrangThai}'.`,
      });
    }

    // Kiểm tra số lượng tồn kho sách trước khi trừ
    const sach = await Sach.findOne({ MaSach: phieu.MaSach });
    if (!sach) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy sách '${phieu.MaSach}' trong hệ thống.`,
      });
    }

    if (sach.SoQuyen <= 0) {
      return res.status(400).json({
        success: false,
        message: `Sách '${sach.TenSach}' hiện đã hết (tồn kho: 0), không thể phê duyệt mượn.`,
      });
    }

    // Giảm tồn kho SoQuyen đi 1
    sach.SoQuyen -= 1;
    await sach.save();

    // Cập nhật phiếu mượn
    const ngayDuyet = new Date();
    const hanTra = new Date(ngayDuyet.getTime() + 14 * 24 * 60 * 60 * 1000); // +14 ngày

    phieu.TrangThai = 'DangMuon';
    phieu.NgayMuon = ngayDuyet;
    phieu.HanTra = hanTra;
    phieu.MSNV = req.nhanVien ? req.nhanVien.MSNV : req.body.MSNV;
    if (req.body.GhiChu) phieu.GhiChu = req.body.GhiChu;

    const updatedPhieu = await phieu.save();

    res.json({
      success: true,
      message: 'Phê duyệt mượn sách thành công! Đã trừ 1 quyển trong kho.',
      data: {
        phieu: updatedPhieu,
        soLuongConLai: sach.SoQuyen,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Từ chối yêu cầu mượn sách
// @route   PUT /api/muontra/tu-choi/:id
// @access  Private (Nhân viên)
const tuChoiMuonSach = async (req, res, next) => {
  try {
    const { LyDo } = req.body;
    const phieu = await TheoDoiMuonSach.findById(req.params.id);

    if (!phieu) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phiếu mượn.',
      });
    }

    if (phieu.TrangThai !== 'ChoDuyet') {
      return res.status(400).json({
        success: false,
        message: `Chỉ có thể từ chối phiếu đang ở trạng thái 'ChoDuyet'. Phiếu này hiện là '${phieu.TrangThai}'.`,
      });
    }

    phieu.TrangThai = 'TuChoi';
    phieu.MSNV = req.nhanVien ? req.nhanVien.MSNV : req.body.MSNV;
    phieu.GhiChu = LyDo ? `Lý do từ chối: ${LyDo}` : (phieu.GhiChu || 'Bị từ chối bởi thủ thư');

    const updatedPhieu = await phieu.save();

    res.json({
      success: true,
      message: 'Đã từ chối yêu cầu mượn sách.',
      data: updatedPhieu,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Xác nhận trả sách
// @route   PUT /api/muontra/tra-sach/:id
// @access  Private (Nhân viên)
const xacNhanTraSach = async (req, res, next) => {
  try {
    const phieu = await TheoDoiMuonSach.findById(req.params.id);
    if (!phieu) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phiếu mượn.',
      });
    }

    if (!['DangMuon', 'QuaHan'].includes(phieu.TrangThai)) {
      return res.status(400).json({
        success: false,
        message: `Phiếu mượn đang ở trạng thái '${phieu.TrangThai}', không thể xác nhận trả sách.`,
      });
    }

    // Tình trạng sách khi trả & các mức phạt tương ứng:
    // 'Không hư' (0%), 'Hư dưới 25%' (25%), 'Hư dưới 50%' (50%), 'Hư dưới 75%' (75%), 'Hư trên 75%' (100%)
    const validTinhTrang = ['Không hư', 'Hư dưới 25%', 'Hư dưới 50%', 'Hư dưới 75%', 'Hư trên 75%'];
    const TinhTrangSach = validTinhTrang.includes(req.body.TinhTrangSach) ? req.body.TinhTrangSach : 'Không hư';

    const mucPhatMap = {
      'Không hư': 0,
      'Hư dưới 25%': 0.25,
      'Hư dưới 50%': 0.50,
      'Hư dưới 75%': 0.75,
      'Hư trên 75%': 1.00,
    };
    const ratePhat = mucPhatMap[TinhTrangSach] || 0;

    // Lấy thông tin sách để tính tiền phạt và xử lý số lượng kho
    const sach = await Sach.findOne({ MaSach: phieu.MaSach });
    const donGia = sach ? (sach.DonGia || 0) : 0;
    const tienPhat = Math.round(donGia * ratePhat);

    // QUY TẮC CẬP NHẬT KHO:
    // Nếu sách 'Không hư': cộng trả 1 quyển vào kho.
    // Nếu sách có hư: KHÔNG cập nhật số lượng sách trong kho và kèm theo tiền phạt.
    const coHuHai = TinhTrangSach !== 'Không hư';
    if (!coHuHai && sach) {
      sach.SoQuyen += 1;
      await sach.save();
    }

    // Cập nhật phiếu mượn
    phieu.TrangThai = 'DaTra';
    phieu.NgayTra = new Date();
    phieu.TinhTrangSach = TinhTrangSach;
    phieu.TienPhat = tienPhat;
    phieu.MSNV = req.nhanVien ? req.nhanVien.MSNV : phieu.MSNV;
    if (req.body.GhiChu) phieu.GhiChu = req.body.GhiChu;

    const updatedPhieu = await phieu.save();

    // Tự động mở khóa tài khoản độc giả nếu không còn sách nào khác quá hạn > 20 ngày
    const twentyDaysAgo = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000);
    const conSachQuaHan20 = await TheoDoiMuonSach.findOne({
      MaDocGia: phieu.MaDocGia,
      _id: { $ne: phieu._id },
      TrangThai: { $in: ['DangMuon', 'QuaHan'] },
      HanTra: { $lt: twentyDaysAgo },
    });

    let autoUnlocked = false;
    if (!conSachQuaHan20) {
      const docGia = await DocGia.findOne({ MaDocGia: phieu.MaDocGia });
      if (docGia && docGia.TrangThai === 'BiKhoa') {
        docGia.TrangThai = 'HoatDong';
        await docGia.save();
        autoUnlocked = true;
      }
    }

    let message = '';
    if (coHuHai) {
      message = `Xác nhận trả sách thành công! Tình trạng: ${TinhTrangSach}. Phạt hư hại: ${tienPhat.toLocaleString('vi-VN')} VNĐ (${ratePhat * 100}% giá bìa). Không cộng số lượng vào kho do sách hư hỏng.`;
    } else {
      message = 'Xác nhận trả sách thành công! Sách nguyên vẹn (Không hư), đã cộng trả 1 quyển vào kho.';
    }

    if (autoUnlocked) {
      message += ' Độc giả đã hoàn tất sách quá hạn >20 ngày, tài khoản đã được tự động mở khóa hoạt động.';
    }

    res.json({
      success: true,
      message,
      data: {
        phieu: updatedPhieu,
        soLuongSauKhiTra: sach ? sach.SoQuyen : undefined,
        autoUnlocked,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy toàn bộ danh sách phiếu mượn (kèm lọc trạng thái, phân trang cho Admin)
// @route   GET /api/muontra
// @access  Private (Nhân viên)
const getAllPhieuMuon = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const trangthai = req.query.trangthai || '';
    const keyword = req.query.keyword || '';

    const filter = {};
    if (trangthai) filter.TrangThai = trangthai;
    if (keyword) {
      filter.$or = [
        { MaDocGia: { $regex: keyword, $options: 'i' } },
        { MaSach: { $regex: keyword, $options: 'i' } },
      ];
    }

    const total = await TheoDoiMuonSach.countDocuments(filter);

    // Sắp xếp: Tab "Lịch sử toàn bộ" mới nhất lên đầu,
    // còn tất cả tab khác (ChoDuyet, DangMuon, QuaHan) → yêu cầu ĐẶT SỚM NHẤT lên đầu (FIFO)
    const sortOrder = trangthai && ['DaTra', 'TuChoi'].includes(trangthai)
      ? { createdAt: -1 }   // Lịch sử: mới nhất trước
      : trangthai === ''
        ? { createdAt: -1 } // Lịch sử toàn bộ (không lọc): mới nhất trước
        : { createdAt: 1 }; // ChoDuyet / DangMuon / QuaHan: đặt sớm nhất lên đầu (FIFO)

    const phieus = await TheoDoiMuonSach.find(filter)
      .sort(sortOrder)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Bổ sung thông tin sách (TenSach, DonGia)
    const maSachList = [...new Set(phieus.map((p) => p.MaSach))];
    const sachs = await Sach.find({ MaSach: { $in: maSachList } }).select('MaSach TenSach DonGia').lean();
    const sachMap = {};
    sachs.forEach((s) => {
      sachMap[s.MaSach] = s;
    });

    const data = phieus.map((p) => ({
      ...p,
      TenSach: sachMap[p.MaSach]?.TenSach || '',
      DonGia: sachMap[p.MaSach]?.DonGia || 0,
    }));

    res.json({
      success: true,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      count: data.length,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Xem lịch sử mượn sách cá nhân của độc giả
// @route   GET /api/muontra/lich-su-ca-nhan
// @access  Private (Độc giả)
const getLichSuCaNhan = async (req, res, next) => {
  try {
    const MaDocGia = req.docGia ? req.docGia.MaDocGia : req.query.MaDocGia;
    if (!MaDocGia) {
      return res.status(400).json({
        success: false,
        message: 'Không xác định được thông tin độc giả.',
      });
    }

    const lichSu = await TheoDoiMuonSach.find({ MaDocGia }).sort({ createdAt: -1 }).lean();

    const maSachList = [...new Set(lichSu.map((p) => p.MaSach))];
    const sachs = await Sach.find({ MaSach: { $in: maSachList } }).select('MaSach TenSach DonGia').lean();
    const sachMap = {};
    sachs.forEach((s) => {
      sachMap[s.MaSach] = s;
    });

    const data = lichSu.map((p) => ({
      ...p,
      TenSach: sachMap[p.MaSach]?.TenSach || '',
      DonGia: sachMap[p.MaSach]?.DonGia || 0,
    }));

    res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy chi tiết một phiếu mượn (đầy đủ thông tin độc giả, sách, nhân viên phục vụ in phiếu)
// @route   GET /api/muontra/:id
// @access  Private (Nhân viên)
const getChiTietPhieuMuon = async (req, res, next) => {
  try {
    const phieu = await TheoDoiMuonSach.findById(req.params.id);
    if (!phieu) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phiếu mượn.',
      });
    }

    const phieuObj = phieu.toObject();
    if (!phieuObj.HanTra && phieuObj.NgayMuon) {
      phieuObj.HanTra = new Date(new Date(phieuObj.NgayMuon).getTime() + 14 * 24 * 60 * 60 * 1000);
    }

    const [docGia, sach, nhanVien] = await Promise.all([
      DocGia.findOne({ MaDocGia: phieu.MaDocGia }).select('-Password'),
      Sach.findOne({ MaSach: phieu.MaSach }),
      phieu.MSNV ? NhanVien.findOne({ MSNV: phieu.MSNV }).select('MSNV HoTenNV ChucVu') : null,
    ]);

    res.json({
      success: true,
      data: {
        phieu: phieuObj,
        docGia: docGia ? {
          MaDocGia: docGia.MaDocGia,
          HoTen: `${docGia.HoLot} ${docGia.Ten}`,
          DienThoai: docGia.DienThoai,
          DiaChi: docGia.DiaChi,
          Phai: docGia.Phai,
        } : null,
        sach: sach ? {
          MaSach: sach.MaSach,
          TenSach: sach.TenSach,
          TacGia: sach.TacGia,
          DonGia: sach.DonGia,
          NamXuatBan: sach.NamXuatBan,
          HinhAnh: sach.HinhAnh,
        } : null,
        nhanVien: nhanVien ? {
          MSNV: nhanVien.MSNV,
          HoTenNV: nhanVien.HoTenNV,
          ChucVu: nhanVien.ChucVu,
        } : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Độc giả hủy yêu cầu mượn sách (chỉ áp dụng khi phiếu đang ở trạng thái 'ChoDuyet')
// @route   PUT /api/muontra/huy-yeu-cau/:id
// @access  Private (Độc giả)
const huyYeuCauMuon = async (req, res, next) => {
  try {
    const phieu = await TheoDoiMuonSach.findById(req.params.id);
    if (!phieu) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phiếu yêu cầu mượn sách.',
      });
    }

    const MaDocGia = req.docGia ? req.docGia.MaDocGia : req.body.MaDocGia;
    if (phieu.MaDocGia !== MaDocGia) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền hủy phiếu mượn của độc giả khác.',
      });
    }

    if (phieu.TrangThai !== 'ChoDuyet') {
      return res.status(400).json({
        success: false,
        message: `Chỉ có thể hủy yêu cầu đang ở trạng thái 'Chờ Duyệt'. Phiếu này hiện là '${phieu.TrangThai}'.`,
      });
    }

    phieu.TrangThai = 'DaHuy';
    phieu.GhiChu = phieu.GhiChu
      ? `${phieu.GhiChu} [Độc giả đã hủy yêu cầu]`
      : '[Độc giả đã hủy yêu cầu]';
    await phieu.save();

    res.json({
      success: true,
      message: 'Hủy yêu cầu mượn sách thành công!',
      data: phieu,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};

