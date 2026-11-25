const bcrypt = require('bcryptjs');
const NhanVien = require('../models/NhanVien');
const TheoDoiMuonSach = require('../models/TheoDoiMuonSach');

// @desc    Lấy danh sách nhân viên
// @route   GET /api/nhanvien
// @access  Private (Admin only)
const getAllNhanVien = async (req, res, next) => {
  try {
    const { keyword } = req.query;
    let query = {};
    if (keyword && keyword.trim()) {
      const regex = new RegExp(keyword.trim(), 'i');
      query = {
        $or: [
          { MSNV: regex },
          { HoTenNV: regex },
          { SoDienThoai: regex },
          { DiaChi: regex },
          { ChucVu: regex },
        ],
      };
    }
    const nhanViens = await NhanVien.find(query).select('-Password').sort({ createdAt: -1 });
    res.json({ success: true, count: nhanViens.length, data: nhanViens });
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy chi tiết một nhân viên
// @route   GET /api/nhanvien/:id
// @access  Private (Admin only)
const getNhanVienById = async (req, res, next) => {
  try {
    const nv = await NhanVien.findById(req.params.id).select('-Password');
    if (!nv) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy nhân viên.' });
    }
    res.json({ success: true, data: nv });
  } catch (error) {
    next(error);
  }
};

// @desc    Thêm nhân viên mới
// @route   POST /api/nhanvien
// @access  Private (Admin only)
const createNhanVien = async (req, res, next) => {
  try {
    const { MSNV, HoTenNV, Password, ChucVu, DiaChi, SoDienThoai } = req.body;

    if (!MSNV || !HoTenNV || !Password || !SoDienThoai) {
      return res.status(400).json({ success: false, message: 'MSNV, HoTenNV, Password và SoDienThoai là bắt buộc.' });
    }

    // Ràng buộc số điện thoại gồm 10 chữ số từ 0 đến 9
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(String(SoDienThoai).trim())) {
      return res.status(400).json({
        success: false,
        message: 'Số điện thoại không hợp lệ. Vui lòng nhập đúng 10 ký tự số từ 0 đến 9.',
      });
    }

    const hashedPassword = await bcrypt.hash(Password, 10);
    const nv = await NhanVien.create({
      MSNV, HoTenNV, Password: hashedPassword, ChucVu, DiaChi, SoDienThoai,
    });

    const obj = nv.toObject();
    delete obj.Password;
    res.status(201).json({ success: true, message: 'Thêm nhân viên thành công.', data: obj });
  } catch (error) {
    next(error);
  }
};

// @desc    Cập nhật thông tin nhân viên (Họ tên, SĐT, Địa chỉ, Mật khẩu)
// @route   PUT /api/nhanvien/:id
// @access  Private (Admin only)
const updateNhanVien = async (req, res, next) => {
  try {
    const nv = await NhanVien.findById(req.params.id);
    if (!nv) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy nhân viên.' });
    }

    if (req.body.SoDienThoai !== undefined) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(String(req.body.SoDienThoai).trim())) {
        return res.status(400).json({
          success: false,
          message: 'Số điện thoại không hợp lệ. Vui lòng nhập đúng 10 ký tự số từ 0 đến 9.',
        });
      }
    }

    const fields = ['HoTenNV', 'DiaChi', 'SoDienThoai'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) nv[f] = req.body[f];
    });

    if (req.body.Password && req.body.Password.trim()) {
      nv.Password = await bcrypt.hash(req.body.Password, 10);
    }

    const updated = await nv.save();
    const obj = updated.toObject();
    delete obj.Password;

    res.json({ success: true, message: 'Cập nhật thông tin nhân viên thành công.', data: obj });
  } catch (error) {
    next(error);
  }
};

// @desc    Thay đổi chức vụ / phân quyền nhân viên
// @route   PUT /api/nhanvien/:id/quyen
// @access  Private (Admin only)
const doiQuyenNhanVien = async (req, res, next) => {
  try {
    const { ChucVu } = req.body;
    if (!ChucVu || !['Admin', 'Thủ thư'].includes(ChucVu)) {
      return res.status(400).json({ success: false, message: 'Chức vụ không hợp lệ (chỉ chấp nhận Admin hoặc Thủ thư).' });
    }

    const nv = await NhanVien.findById(req.params.id);
    if (!nv) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy nhân viên.' });
    }

    // Nếu tự hạ quyền Admin của chính mình, kiểm tra xem còn Admin nào khác không
    if (nv.MSNV === req.nhanVien.MSNV && ChucVu !== 'Admin') {
      const otherAdminCount = await NhanVien.countDocuments({
        MSNV: { $ne: nv.MSNV },
        ChucVu: 'Admin',
        TrangThai: 'HoatDong',
      });
      if (otherAdminCount === 0) {
        return res.status(400).json({
          success: false,
          message: 'Không thể tự hạ quyền của mình vì hệ thống phải có ít nhất 1 tài khoản Admin đang hoạt động.',
        });
      }
    }

    nv.ChucVu = ChucVu;
    const updated = await nv.save();
    const obj = updated.toObject();
    delete obj.Password;

    res.json({ success: true, message: `Đã đổi chức vụ nhân viên ${nv.HoTenNV} thành ${ChucVu}.`, data: obj });
  } catch (error) {
    next(error);
  }
};

// @desc    Khóa / Mở khóa tài khoản nhân viên
// @route   PUT /api/nhanvien/:id/khoa
// @access  Private (Admin only)
const toggleKhoaNhanVien = async (req, res, next) => {
  try {
    const nv = await NhanVien.findById(req.params.id);
    if (!nv) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy nhân viên.' });
    }

    // Không cho tự khóa chính mình
    if (nv.MSNV === req.nhanVien.MSNV) {
      return res.status(400).json({ success: false, message: 'Bạn không thể tự khóa tài khoản của chính mình.' });
    }

    const isCurrentlyLocked = nv.TrangThai === 'BiKhoa';
    nv.TrangThai = isCurrentlyLocked ? 'HoatDong' : 'BiKhoa';

    const updated = await nv.save();
    const obj = updated.toObject();
    delete obj.Password;

    const actionText = isCurrentlyLocked ? 'Mở khóa' : 'Khóa';
    res.json({
      success: true,
      message: `Đã ${actionText.toLowerCase()} tài khoản nhân viên ${nv.HoTenNV} thành công.`,
      data: obj,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Xóa nhân viên
// @route   DELETE /api/nhanvien/:id
// @access  Private (Admin only)
const deleteNhanVien = async (req, res, next) => {
  try {
    const nv = await NhanVien.findById(req.params.id);
    if (!nv) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy nhân viên.' });
    }
    // Không cho xóa chính mình
    if (nv.MSNV === req.nhanVien.MSNV) {
      return res.status(400).json({ success: false, message: 'Không thể tự xóa tài khoản của mình.' });
    }

    // Ràng buộc: Không thể xóa nhân viên nếu có ít nhất 1 giao dịch mượn vẫn còn hiệu lực (kể cả quá hạn) do nhân viên này xử lý
    const activeLoan = await TheoDoiMuonSach.findOne({
      MSNV: nv.MSNV,
      TrangThai: { $in: ['ChoDuyet', 'DangMuon', 'QuaHan'] },
    });
    if (activeLoan) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa nhân viên '${nv.HoTenNV}' (${nv.MSNV}) vì đang phụ trách giao dịch mượn sách vẫn còn hiệu lực hoặc quá hạn chưa hoàn tất!`,
      });
    }

    await nv.deleteOne();
    res.json({ success: true, message: 'Xóa nhân viên thành công.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllNhanVien,
  getNhanVienById,
  createNhanVien,
  updateNhanVien,
  doiQuyenNhanVien,
  toggleKhoaNhanVien,
  deleteNhanVien,
};

