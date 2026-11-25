const mongoose = require('mongoose');

const TacGiaSchema = new mongoose.Schema(
  {
    MaTacGia: {
      type: String,
      required: [true, 'Mã tác giả là bắt buộc'],
      unique: true,
      trim: true,
    },
    TenTacGia: {
      type: String,
      required: [true, 'Tên tác giả là bắt buộc'],
      trim: true,
    },
    MoTa: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TacGia', TacGiaSchema);
