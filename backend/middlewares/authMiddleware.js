const jwt = require('jsonwebtoken');
const NhanVien = require('../models/NhanVien');
const DocGia = require('../models/DocGia');

/**
 * Middleware xác thực JWT Token cho Nhân viên (Admin / Thủ thư)
 * Yêu cầu header: Authorization: Bearer <token>
 */
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.nhanVien = await NhanVien.findOne({ MSNV: decoded.MSNV }).select('-Password');

      if (!req.nhanVien) {
        return res.status(401).json({ success: false, message: 'Token không hợp lệ hoặc tài khoản nhân viên không tồn tại.' });
      }

      if (req.nhanVien.TrangThai === 'BiKhoa') {
        return res.status(403).json({ success: false, message: 'Tài khoản nhân viên này đã bị khóa. Vui lòng liên hệ Quản trị viên.' });
      }

      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn.' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Không có token xác thực. Vui lòng đăng nhập.' });
  }
};

/**
 * Middleware phân quyền — chỉ Admin mới được truy cập
 */
const adminOnly = (req, res, next) => {
  if (req.nhanVien && req.nhanVien.ChucVu === 'Admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Chỉ Admin mới có quyền thực hiện thao tác này.' });
  }
};

/**
 * Middleware xác thực JWT Token cho Độc giả
 */
const protectDocGia = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.docGia = await DocGia.findById(decoded.id).select('-Password');

      if (!req.docGia) {
        return res.status(401).json({ success: false, message: 'Token không hợp lệ hoặc tài khoản độc giả không tồn tại.' });
      }

      // Tự động kiểm tra quá hạn > 20 ngày để khóa
      const TheoDoiMuonSach = require('../models/TheoDoiMuonSach');
      const twentyDaysAgo = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000);
      const isOver20 = await TheoDoiMuonSach.findOne({
        MaDocGia: req.docGia.MaDocGia,
        TrangThai: { $in: ['DangMuon', 'QuaHan'] },
        HanTra: { $lt: twentyDaysAgo },
      });

      if (isOver20 && req.docGia.TrangThai !== 'BiKhoa') {
        req.docGia.TrangThai = 'BiKhoa';
        await DocGia.updateOne({ _id: req.docGia._id }, { TrangThai: 'BiKhoa' });
      }

      if (req.docGia.TrangThai === 'BiKhoa') {
        return res.status(403).json({
          success: false,
          message: isOver20
            ? 'Tài khoản của bạn đã bị tự động khóa do mượn sách quá hạn hơn 20 ngày. Vui lòng liên hệ thủ thư thư viện.'
            : 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ thủ thư thư viện.',
        });
      }

      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn.' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập tài khoản độc giả.' });
  }
};

module.exports = { protect, adminOnly, protectDocGia };
