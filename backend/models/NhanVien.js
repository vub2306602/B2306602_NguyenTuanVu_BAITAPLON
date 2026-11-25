const mongoose = require('mongoose');

const NhanVienSchema = new mongoose.Schema(
  {
    MSNV: {
      type: String,
      required: [true, 'Mã số nhân viên là bắt buộc'],
      unique: true,
      trim: true,
    },
    HoTenNV: {
      type: String,
      required: [true, 'Họ tên nhân viên là bắt buộc'],
      trim: true,
    },
    // Lưu dạng đã băm bcrypt — việc băm thực hiện ở controller
    Password: {
      type: String,
      required: [true, 'Mật khẩu là bắt buộc'],
    },
    ChucVu: {
      type: String,
      enum: ['Admin', 'Thủ thư'],
      default: 'Thủ thư',
    },
    DiaChi: {
      type: String,
      default: '',
    },
    SoDienThoai: {
      type: String,
      required: [true, 'Số điện thoại là bắt buộc'],
      unique: true,
      trim: true,
      match: [/^[0-9]{10}$/, 'Số điện thoại phải gồm đúng 10 ký tự số từ 0 đến 9'],
    },
    TrangThai: {
      type: String,
      enum: ['HoatDong', 'BiKhoa'],
      default: 'HoatDong',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('NhanVien', NhanVienSchema);

