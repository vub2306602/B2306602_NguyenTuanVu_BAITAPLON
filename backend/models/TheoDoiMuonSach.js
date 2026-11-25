const mongoose = require('mongoose');

const TheoDoiMuonSachSchema = new mongoose.Schema(
  {
    MaDocGia: {
      type: String,
      required: [true, 'Mã độc giả là bắt buộc'],
      ref: 'DocGia',
    },
    MaSach: {
      type: String,
      required: [true, 'Mã sách là bắt buộc'],
      ref: 'Sach',
    },
    NgayMuon: {
      type: Date,
      default: Date.now,
    },
    // Ngày trả thực tế (điền khi trả sách)
    NgayTra: {
      type: Date,
    },
    // Hạn trả = NgayMuon + 14 ngày (tính khi chuyển sang DangMuon)
    HanTra: {
      type: Date,
    },
    TrangThai: {
      type: String,
      enum: ['ChoDuyet', 'DangMuon', 'DaTra', 'TuChoi', 'QuaHan', 'DaHuy'],
      default: 'ChoDuyet',
    },
    // Tình trạng sách khi trả: 'Không hư', 'Hư dưới 25%', 'Hư dưới 50%', 'Hư dưới 75%', 'Hư trên 75%'
    TinhTrangSach: {
      type: String,
      enum: ['Không hư', 'Hư dưới 25%', 'Hư dưới 50%', 'Hư dưới 75%', 'Hư trên 75%'],
      default: 'Không hư',
    },
    // Tiền phạt tính theo mức hư hại (hoặc quá hạn)
    TienPhat: {
      type: Number,
      default: 0,
      min: 0,
    },
    GhiChu: {
      type: String,
      default: '',
    },
    // Nhân viên xử lý phiếu mượn
    MSNV: {
      type: String,
      ref: 'NhanVien',
    },
  },
  { timestamps: true }
);

// RÀNG BUỘC TOÀN VẸN DỮ LIỆU:
// 1. HanTra không được nhỏ hơn NgayMuon
// 2. NgayTra (nếu có) không được nhỏ hơn NgayMuon
TheoDoiMuonSachSchema.pre('validate', function () {
  if (this.HanTra && this.NgayMuon && new Date(this.HanTra) < new Date(this.NgayMuon)) {
    this.invalidate('HanTra', 'Hạn trả không được nhỏ hơn ngày mượn sách!');
  }
  if (this.NgayTra && this.NgayMuon && new Date(this.NgayTra) < new Date(this.NgayMuon)) {
    this.invalidate('NgayTra', 'Ngày trả thực tế không được nhỏ hơn ngày mượn sách!');
  }
});

TheoDoiMuonSachSchema.pre(['findOneAndUpdate', 'updateOne'], async function () {
  const update = this.getUpdate();
  if (!update) return;
  const docToUpdate = update.$set || update;

  let ngayMuon = docToUpdate.NgayMuon;
  if (!ngayMuon && (docToUpdate.HanTra || docToUpdate.NgayTra)) {
    const existing = await this.model.findOne(this.getQuery());
    if (existing) ngayMuon = existing.NgayMuon;
  }

  if (docToUpdate.HanTra && ngayMuon && new Date(docToUpdate.HanTra) < new Date(ngayMuon)) {
    throw new Error('Hạn trả không được nhỏ hơn ngày mượn sách!');
  }
  if (docToUpdate.NgayTra && ngayMuon && new Date(docToUpdate.NgayTra) < new Date(ngayMuon)) {
    throw new Error('Ngày trả thực tế không được nhỏ hơn ngày mượn sách!');
  }
});

module.exports = mongoose.model('TheoDoiMuonSach', TheoDoiMuonSachSchema);

