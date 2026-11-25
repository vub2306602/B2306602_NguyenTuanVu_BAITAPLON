const mongoose = require('mongoose');

const DocGiaSchema = new mongoose.Schema(
  {
    MaDocGia: {
      type: String,
      required: [true, 'Mã độc giả là bắt buộc'],
      unique: true,
      trim: true,
    },
    HoLot: {
      type: String,
      required: [true, 'Họ lót là bắt buộc'],
      trim: true,
    },
    Ten: {
      type: String,
      required: [true, 'Tên là bắt buộc'],
      trim: true,
    },
    NgaySinh: {
      type: Date,
      required: [true, 'Ngày sinh là bắt buộc'],
    },
    Phai: {
      type: String,
      enum: ['Nam', 'Nữ', 'Khác'],
      default: 'Nam',
    },
    DiaChi: {
      type: String,
      required: [true, 'Địa chỉ là bắt buộc'],
    },
    DienThoai: {
      type: String,
      required: [true, 'Điện thoại là bắt buộc'],
      unique: true,
      trim: true,
      match: [/^[0-9]{10}$/, 'Số điện thoại phải gồm đúng 10 ký tự số từ 0 đến 9'],
    },
    // Lưu dạng đã băm bcrypt — việc băm thực hiện ở controller
    Password: {
      type: String,
      required: [true, 'Mật khẩu là bắt buộc'],
    },
    TrangThai: {
      type: String,
      enum: ['HoatDong', 'BiKhoa'],
      default: 'HoatDong',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DocGia', DocGiaSchema);

