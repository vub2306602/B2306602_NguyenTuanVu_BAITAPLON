const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const NhanVien = require('../models/NhanVien');
const DocGia = require('../models/DocGia');

/**
 * Sinh JWT Token cho nhân viên
 */
const generateNhanVienToken = (nhanVien) => {
  return jwt.sign(
    {
      id: nhanVien._id,
      MSNV: nhanVien.MSNV,
      ChucVu: nhanVien.ChucVu,
      role: 'nhanvien',
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * Sinh JWT Token cho độc giả
 */
const generateDocGiaToken = (docGia) => {
  return jwt.sign(
    {
      id: docGia._id,
      MaDocGia: docGia.MaDocGia,
      DienThoai: docGia.DienThoai,
      role: 'docgia',
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// ============================================================
// AUTH NHÂN VIÊN
// ============================================================

// @desc    Đăng nhập Nhân viên / Admin
// @route   POST /api/auth/nhanvien/login
// @access  Public
const loginNhanVien = async (req, res, next) => {
  try {
    const { MSNV, Password } = req.body;

    if (!MSNV || !Password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập MSNV và mật khẩu.' });
    }

    const nhanVien = await NhanVien.findOne({ MSNV });
    if (!nhanVien) {
      return res.status(401).json({ success: false, message: 'MSNV hoặc mật khẩu không đúng.' });
    }

    // Kiểm tra tài khoản có bị khóa không
    if (nhanVien.TrangThai === 'BiKhoa') {
      return res.status(403).json({ success: false, message: 'Tài khoản nhân viên này đã bị khóa. Vui lòng liên hệ Quản trị viên.' });
    }

    const isMatch = await bcrypt.compare(Password, nhanVien.Password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'MSNV hoặc mật khẩu không đúng.' });
    }

    const token = generateNhanVienToken(nhanVien);

    res.json({
      success: true,
      message: 'Đăng nhập thành công.',
      data: {
        token,
        nhanVien: {
          MSNV: nhanVien.MSNV,
          HoTenNV: nhanVien.HoTenNV,
          ChucVu: nhanVien.ChucVu,
          SoDienThoai: nhanVien.SoDienThoai,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy thông tin nhân viên đang đăng nhập
// @route   GET /api/auth/nhanvien/me
// @access  Private
const getMe = async (req, res) => {
  res.json({ success: true, data: req.nhanVien });
};

// ============================================================
// AUTH ĐỘC GIẢ
// ============================================================

// @desc    Đăng ký tài khoản Độc giả
// @route   POST /api/auth/docgia/register
// @access  Public
const registerDocGia = async (req, res, next) => {
  try {
    const { HoLot, Ten, NgaySinh, Phai, DiaChi, DienThoai, Password } = req.body;

    if (!HoLot || !Ten || !NgaySinh || !DiaChi || !DienThoai || !Password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ các thông tin bắt buộc: Họ lót, Tên, Ngày sinh, Địa chỉ, Số điện thoại, Mật khẩu.',
      });
    }

    // Ràng buộc số điện thoại gồm 10 chữ số từ 0 đến 9
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(String(DienThoai).trim())) {
      return res.status(400).json({
        success: false,
        message: 'Số điện thoại không hợp lệ. Vui lòng nhập đúng 10 ký tự số từ 0 đến 9.',
      });
    }

    // Kiểm tra số điện thoại đã tồn tại chưa
    const existingDocGia = await DocGia.findOne({ DienThoai });
    if (existingDocGia) {
      return res.status(400).json({
        success: false,
        message: 'Số điện thoại này đã được đăng ký tài khoản độc giả.',
      });
    }

    // Tự sinh MaDocGia nếu chưa có (DG + timestamp)
    let MaDocGia = req.body.MaDocGia;
    if (!MaDocGia) {
      const count = await DocGia.countDocuments();
      MaDocGia = `DG${String(count + 1).padStart(4, '0')}`;
    }

    // Băm mật khẩu bcrypt
    const hashedPassword = await bcrypt.hash(Password, 10);

    const docGia = await DocGia.create({
      MaDocGia,
      HoLot,
      Ten,
      NgaySinh,
      Phai: Phai || 'Nam',
      DiaChi,
      DienThoai,
      Password: hashedPassword,
    });

    const token = generateDocGiaToken(docGia);
    const dataResponse = docGia.toObject();
    delete dataResponse.Password;

    res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản độc giả thành công.',
      data: {
        token,
        docGia: dataResponse,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Đăng nhập Độc giả
// @route   POST /api/auth/docgia/login
// @access  Public
const loginDocGia = async (req, res, next) => {
  try {
    const { DienThoai, Password } = req.body;

    if (!DienThoai || !Password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp số điện thoại và mật khẩu.',
      });
    }

    const docGia = await DocGia.findOne({ DienThoai });
    if (!docGia) {
      return res.status(401).json({
        success: false,
        message: 'Số điện thoại hoặc mật khẩu không chính xác.',
      });
    }

    const isMatch = await bcrypt.compare(Password, docGia.Password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Số điện thoại hoặc mật khẩu không chính xác.',
      });
    }

    // Tự động kiểm tra khóa tài khoản nếu có sách mượn quá hạn > 20 ngày
    const TheoDoiMuonSach = require('../models/TheoDoiMuonSach');
    const twentyDaysAgo = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000);
    const overdue20 = await TheoDoiMuonSach.findOne({
      MaDocGia: docGia.MaDocGia,
      TrangThai: { $in: ['DangMuon', 'QuaHan'] },
      HanTra: { $lt: twentyDaysAgo },
    });

    if (overdue20 && docGia.TrangThai !== 'BiKhoa') {
      docGia.TrangThai = 'BiKhoa';
      await docGia.save();
    }

    // Kiểm tra trạng thái tài khoản độc giả
    if (docGia.TrangThai === 'BiKhoa') {
      return res.status(403).json({
        success: false,
        message: overdue20
          ? 'Tài khoản của bạn đã bị tự động khóa do có sách mượn quá hạn hơn 20 ngày. Vui lòng liên hệ thủ thư thư viện.'
          : 'Tài khoản độc giả này đã bị khóa. Vui lòng liên hệ thủ thư thư viện.',
      });
    }

    const token = generateDocGiaToken(docGia);
    const dataResponse = docGia.toObject();
    delete dataResponse.Password;

    res.json({
      success: true,
      message: 'Đăng nhập độc giả thành công.',
      data: {
        token,
        docGia: dataResponse,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy thông tin độc giả đang đăng nhập
// @route   GET /api/auth/docgia/me
// @access  Private (Độc giả)
const getDocGiaMe = async (req, res) => {
  res.json({ success: true, data: req.docGia });
};

// @desc    Độc giả tự đổi mật khẩu
// @route   PUT /api/auth/docgia/change-password
// @access  Private (Độc giả)
const doiMatKhauDocGia = async (req, res, next) => {
  try {
    const { MatKhauCu, MatKhauMoi } = req.body;

    if (!MatKhauCu || !MatKhauMoi) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập mật khẩu hiện tại và mật khẩu mới.',
      });
    }

    if (MatKhauMoi.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu mới phải có ít nhất 6 ký tự.',
      });
    }

    // Lấy full document có Password
    const docGia = await require('../models/DocGia').findById(req.docGia._id);
    if (!docGia) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản.' });
    }

    const isMatch = await bcrypt.compare(MatKhauCu, docGia.Password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Mật khẩu hiện tại không đúng.' });
    }

    docGia.Password = await bcrypt.hash(MatKhauMoi, 10);
    await docGia.save();

    res.json({ success: true, message: 'Đổi mật khẩu thành công.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  loginNhanVien,
  getMe,
  registerDocGia,
  loginDocGia,
  getDocGiaMe,
  doiMatKhauDocGia,
};
