const bcrypt = require('bcryptjs');
const DocGia = require('../models/DocGia');
const TheoDoiMuonSach = require('../models/TheoDoiMuonSach');

// @desc    Lấy danh sách tất cả độc giả (kèm tự động kiểm tra khóa quá hạn > 20 ngày)
// @route   GET /api/docgia
// @access  Private (Admin/Thủ thư)
const getAllDocGia = async (req, res, next) => {
  try {
    // Tự động kiểm tra và khóa tài khoản các độc giả có sách mượn quá hạn > 20 ngày
    const twentyDaysAgo = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000);
    const overdueOver20DocGias = await TheoDoiMuonSach.find({
      TrangThai: { $in: ['DangMuon', 'QuaHan'] },
      HanTra: { $lt: twentyDaysAgo },
    }).distinct('MaDocGia');

    if (overdueOver20DocGias.length > 0) {
      await DocGia.updateMany(
        { MaDocGia: { $in: overdueOver20DocGias }, TrangThai: { $ne: 'BiKhoa' } },
        { TrangThai: 'BiKhoa' }
      );
    }

    const page    = parseInt(req.query.page)  || 1;
    const limit   = parseInt(req.query.limit) || 20;
    const keyword = req.query.keyword || '';

    const filter = keyword
      ? {
          $or: [
            { MaDocGia:  { $regex: keyword, $options: 'i' } },
            { Ten:       { $regex: keyword, $options: 'i' } },
            { HoLot:     { $regex: keyword, $options: 'i' } },
            { DienThoai: { $regex: keyword, $options: 'i' } },
            { DiaChi:    { $regex: keyword, $options: 'i' } },
          ],
        }
      : {};

    const total  = await DocGia.countDocuments(filter);
    const docGias = await DocGia.find(filter)
      .select('-Password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      count: docGias.length,
      data: docGias,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy chi tiết một độc giả
// @route   GET /api/docgia/:id
// @access  Private
const getDocGiaById = async (req, res, next) => {
  try {
    const docGia = await DocGia.findById(req.params.id).select('-Password');
    if (!docGia) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy độc giả.' });
    }
    res.json({ success: true, data: docGia });
  } catch (error) {
    next(error);
  }
};

// @desc    Cập nhật thông tin độc giả
// @route   PUT /api/docgia/:id
// @access  Private (Admin/Thủ thư)
const updateDocGia = async (req, res, next) => {
  try {
    const docGia = await DocGia.findById(req.params.id);
    if (!docGia) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy độc giả.' });
    }

    if (req.body.DienThoai !== undefined) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(String(req.body.DienThoai).trim())) {
        return res.status(400).json({
          success: false,
          message: 'Số điện thoại không hợp lệ. Vui lòng nhập đúng 10 ký tự số từ 0 đến 9.',
        });
      }
    }

    const fields = ['HoLot', 'Ten', 'NgaySinh', 'Phai', 'DiaChi', 'DienThoai'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) docGia[f] = req.body[f];
    });

    // Nếu có đổi mật khẩu
    if (req.body.Password) {
      docGia.Password = await bcrypt.hash(req.body.Password, 10);
    }

    const updated = await docGia.save();
    const obj = updated.toObject();
    delete obj.Password;

    res.json({ success: true, message: 'Cập nhật độc giả thành công.', data: obj });
  } catch (error) {
    next(error);
  }
};

// @desc    Xóa độc giả (chỉ xóa khi không đang mượn sách, xóa kèm toàn bộ lịch sử)
// @route   DELETE /api/docgia/:id
// @access  Private (Admin)
const deleteDocGia = async (req, res, next) => {
  try {
    const docGia = await DocGia.findById(req.params.id);
    if (!docGia) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy độc giả.' });
    }

    // 1. Kiểm tra độc giả có đang mượn sách hoặc có phiếu chờ duyệt không
    const dangMuonPhieu = await TheoDoiMuonSach.findOne({
      MaDocGia: docGia.MaDocGia,
      TrangThai: { $in: ['DangMuon', 'QuaHan', 'ChoDuyet'] },
    });

    if (dangMuonPhieu) {
      return res.status(400).json({
        success: false,
        message: `Độc giả '${docGia.HoLot} ${docGia.Ten}' (${docGia.MaDocGia}) đang có sách mượn chưa hoàn trả hoặc phiếu đang chờ duyệt. Không thể xóa!`,
      });
    }

    // 2. Nếu không đang mượn sách nào: Xóa toàn bộ thông tin độc giả kèm toàn bộ lịch sử mượn trả lưu trong hệ thống
    const deleteHistoryRes = await TheoDoiMuonSach.deleteMany({ MaDocGia: docGia.MaDocGia });
    await docGia.deleteOne();

    res.json({
      success: true,
      message: `Đã xóa toàn bộ thông tin độc giả '${docGia.HoLot} ${docGia.Ten}' (${docGia.MaDocGia}) cùng ${deleteHistoryRes.deletedCount} bản ghi lịch sử mượn trả trong hệ thống.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Khóa hoặc mở khóa tài khoản độc giả
// @route   PUT /api/docgia/:id/khoa
// @access  Private (Admin/Thủ thư)
const toggleKhoaDocGia = async (req, res, next) => {
  try {
    const docGia = await DocGia.findById(req.params.id);
    if (!docGia) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy độc giả.' });
    }

    docGia.TrangThai = docGia.TrangThai === 'BiKhoa' ? 'HoatDong' : 'BiKhoa';
    await docGia.save();

    const trangThaiText = docGia.TrangThai === 'BiKhoa' ? 'Đã khóa' : 'Đã mở khóa';
    res.json({
      success: true,
      message: `${trangThaiText} tài khoản độc giả '${docGia.HoLot} ${docGia.Ten}' (${docGia.MaDocGia}) thành công.`,
      data: {
        _id: docGia._id,
        MaDocGia: docGia.MaDocGia,
        TrangThai: docGia.TrangThai,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cấp lại mật khẩu mới cho độc giả
// @route   PUT /api/docgia/:id/reset-password
// @access  Private (Admin/Thủ thư)
const capLaiMatKhauDocGia = async (req, res, next) => {
  try {
    const { Password } = req.body;
    if (!Password || Password.trim().length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu mới phải có ít nhất 6 ký tự.',
      });
    }

    const docGia = await DocGia.findById(req.params.id);
    if (!docGia) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy độc giả.' });
    }

    docGia.Password = await bcrypt.hash(Password.trim(), 10);
    await docGia.save();

    res.json({
      success: true,
      message: `Cấp lại mật khẩu mới cho độc giả '${docGia.HoLot} ${docGia.Ten}' (${docGia.MaDocGia}) thành công.`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllDocGia,
  getDocGiaById,
  updateDocGia,
  deleteDocGia,
  toggleKhoaDocGia,
  capLaiMatKhauDocGia,
};

