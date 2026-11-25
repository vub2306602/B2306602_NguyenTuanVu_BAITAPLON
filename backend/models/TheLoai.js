const mongoose = require('mongoose');

const TheLoaiSchema = new mongoose.Schema(
  {
    MaTheLoai: {
      type: String,
      required: [true, 'Mã thể loại là bắt buộc'],
      unique: true,
      trim: true,
    },
    TenTheLoai: {
      type: String,
      required: [true, 'Tên thể loại là bắt buộc'],
      trim: true,
    },
    MoTa: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TheLoai', TheLoaiSchema);

