const mongoose = require('mongoose');

const NhaXuatBanSchema = new mongoose.Schema(
  {
    MaNXB: {
      type: String,
      required: [true, 'Mã nhà xuất bản là bắt buộc'],
      unique: true,
      trim: true,
    },
    TenNXB: {
      type: String,
      required: [true, 'Tên nhà xuất bản là bắt buộc'],
      trim: true,
    },
    DiaChi: {
      type: String,
      required: [true, 'Địa chỉ nhà xuất bản là bắt buộc'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('NhaXuatBan', NhaXuatBanSchema);

