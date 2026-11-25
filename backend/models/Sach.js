const mongoose = require('mongoose');

const SachSchema = new mongoose.Schema(
  {
    MaSach: {
      type: String,
      required: [true, 'Mã sách là bắt buộc'],
      unique: true,
      trim: true,
    },
    TenSach: {
      type: String,
      required: [true, 'Tên sách là bắt buộc'],
      trim: true,
      index: true,
    },
    DonGia: {
      type: Number,
      min: [0, 'Đơn giá không được âm'],
      default: 0,
    },
    SoQuyen: {
      type: Number,
      min: [0, 'Số quyển không được âm'],
      default: 0,
    },
    NamXuatBan: {
      type: Number,
    },
    MaNXB: {
      type: String,
      ref: 'NhaXuatBan',
    },
    TacGia: {
      type: String,
      ref: 'TacGia',
      trim: true,
    },
    MaTheLoai: {
      type: String,
      ref: 'TheLoai',
    },
    HinhAnh: {
      type: String,
      default: '',
    },
    MoTa: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Sach', SachSchema);

