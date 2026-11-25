const Sach = require('../models/Sach');
const NhaXuatBan = require('../models/NhaXuatBan');
const TheLoai = require('../models/TheLoai');
const TacGia = require('../models/TacGia');
const TheoDoiMuonSach = require('../models/TheoDoiMuonSach');

// Helper: Tạo URL ảnh từ tên file
const buildImageUrl = (req, filename) => {
  if (!filename) return '';
  return `${req.protocol}://${req.get('host')}/uploads/${filename}`;
};

// @desc    Lấy danh sách sách (phân trang, tìm kiếm, lọc)
// @route   GET /api/sach
// @access  Public
const getAllSach = async (req, res, next) => {
  try {
    const page    = parseInt(req.query.page)    || 1;
    const limit   = parseInt(req.query.limit)   || 10;
    const keyword = req.query.keyword || '';
    const theloai = req.query.theloai || '';
    const nxb     = req.query.nxb     || '';
    const tacgia  = req.query.tacgia  || '';

    // Xây dựng filter
    const filter = {};
    if (keyword) {
      // Tìm tác giả có tên khớp với từ khóa
      const matchingTGs = await TacGia.find({
        TenTacGia: { $regex: keyword, $options: 'i' },
      }).distinct('MaTacGia');

      filter.$or = [
        { TenSach: { $regex: keyword, $options: 'i' } },
        { TacGia:  { $regex: keyword, $options: 'i' } },
        { TacGia:  { $in: matchingTGs } },
        { MaSach:  { $regex: keyword, $options: 'i' } },
      ];
    }
    if (theloai) filter.MaTheLoai = theloai;
    if (nxb)     filter.MaNXB     = nxb;
    if (tacgia)  filter.TacGia    = tacgia;

    const total = await Sach.countDocuments(filter);
    const [sachs, nxbs, theLoais, tacGias] = await Promise.all([
      Sach.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      NhaXuatBan.find().lean(),
      TheLoai.find().lean(),
      TacGia.find().lean(),
    ]);

    const nxbMap = {};
    nxbs.forEach((item) => {
      nxbMap[item.MaNXB] = item.TenNXB;
    });

    const theLoaiMap = {};
    theLoais.forEach((item) => {
      theLoaiMap[item.MaTheLoai] = item.TenTheLoai;
    });

    const tacGiaMap = {};
    tacGias.forEach((item) => {
      tacGiaMap[item.MaTacGia] = item.TenTacGia;
    });

    // Thêm URL đầy đủ cho ảnh bìa + TenNXB + TenTheLoai + TenTacGia
    const data = sachs.map((s) => {
      const obj = s.toObject();
      if (obj.HinhAnh) obj.HinhAnhUrl = buildImageUrl(req, obj.HinhAnh);
      obj.TenNXB = nxbMap[obj.MaNXB] || '';
      obj.TenTheLoai = theLoaiMap[obj.MaTheLoai] || '';
      obj.TenTacGia = tacGiaMap[obj.TacGia] || obj.TacGia || '';
      return obj;
    });

    res.json({
      success: true,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      count: data.length,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy chi tiết một cuốn sách
// @route   GET /api/sach/:id
// @access  Public
const getSachById = async (req, res, next) => {
  try {
    let sach = null;
    const mongoose = require('mongoose');
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      sach = await Sach.findById(req.params.id);
    }
    if (!sach) {
      sach = await Sach.findOne({ MaSach: req.params.id });
    }
    if (!sach) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sách.' });
    }
    const obj = sach.toObject();
    if (obj.HinhAnh) obj.HinhAnhUrl = buildImageUrl(req, obj.HinhAnh);

    // Bổ sung thông tin Nhà xuất bản, Thể loại, Tác giả
    if (obj.MaNXB) {
      const nxb = await NhaXuatBan.findOne({ MaNXB: obj.MaNXB }).lean();
      if (nxb) {
        obj.TenNXB = nxb.TenNXB;
        obj.NhaXuatBan = nxb;
      }
    }
    if (obj.MaTheLoai) {
      const tl = await TheLoai.findOne({ MaTheLoai: obj.MaTheLoai }).lean();
      if (tl) {
        obj.TenTheLoai = tl.TenTheLoai;
        obj.TheLoai = tl;
      }
    }
    if (obj.TacGia) {
      let tg = await TacGia.findOne({ MaTacGia: obj.TacGia }).lean();
      if (!tg) {
        const mongoose = require('mongoose');
        if (mongoose.Types.ObjectId.isValid(obj.TacGia)) {
          tg = await TacGia.findById(obj.TacGia).lean();
        }
      }
      if (!tg) {
        tg = await TacGia.findOne({ TenTacGia: obj.TacGia }).lean();
      }
      if (tg) {
        obj.TenTacGia = tg.TenTacGia;
        obj.TacGiaInfo = tg;
      } else {
        obj.TenTacGia = obj.TacGia;
      }
    }

    res.json({ success: true, data: obj });
  } catch (error) {
    next(error);
  }
};

// @desc    Thêm sách mới (hỗ trợ upload ảnh bìa)
// @route   POST /api/sach
// @access  Private
const createSach = async (req, res, next) => {
  try {
    const { MaSach, TenSach, DonGia, SoQuyen, NamXuatBan, MaNXB, TacGia: authorCode, MaTheLoai, MoTa } = req.body;

    if (!MaSach || !TenSach) {
      return res.status(400).json({ success: false, message: 'Mã sách và Tên sách là bắt buộc.' });
    }

    // Tên file ảnh (nếu có upload)
    const HinhAnh = req.file ? req.file.filename : '';

    const sach = await Sach.create({
      MaSach, TenSach, DonGia, SoQuyen, NamXuatBan,
      MaNXB, TacGia: authorCode, MaTheLoai, MoTa, HinhAnh,
    });

    const obj = sach.toObject();
    if (obj.HinhAnh) obj.HinhAnhUrl = buildImageUrl(req, obj.HinhAnh);
    if (obj.MaNXB) {
      const nxb = await NhaXuatBan.findOne({ MaNXB: obj.MaNXB }).lean();
      if (nxb) obj.TenNXB = nxb.TenNXB;
    }
    if (obj.MaTheLoai) {
      const tl = await TheLoai.findOne({ MaTheLoai: obj.MaTheLoai }).lean();
      if (tl) obj.TenTheLoai = tl.TenTheLoai;
    }
    if (obj.TacGia) {
      const tg = await TacGia.findOne({ MaTacGia: obj.TacGia }).lean();
      if (tg) obj.TenTacGia = tg.TenTacGia;
    }

    res.status(201).json({ success: true, message: 'Thêm sách thành công.', data: obj });
  } catch (error) {
    next(error);
  }
};

// @desc    Cập nhật sách (hỗ trợ upload ảnh bìa mới)
// @route   PUT /api/sach/:id
// @access  Private
const updateSach = async (req, res, next) => {
  try {
    const sach = await Sach.findById(req.params.id);
    if (!sach) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sách.' });
    }

    const fields = ['MaSach', 'TenSach', 'DonGia', 'SoQuyen', 'NamXuatBan', 'MaNXB', 'TacGia', 'MaTheLoai', 'MoTa'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) sach[f] = req.body[f];
    });

    // Nếu có upload ảnh mới → cập nhật
    if (req.file) {
      sach.HinhAnh = req.file.filename;
    }

    const updated = await sach.save();
    const obj = updated.toObject();
    if (obj.HinhAnh) obj.HinhAnhUrl = buildImageUrl(req, obj.HinhAnh);
    if (obj.MaNXB) {
      const nxb = await NhaXuatBan.findOne({ MaNXB: obj.MaNXB }).lean();
      if (nxb) obj.TenNXB = nxb.TenNXB;
    }
    if (obj.MaTheLoai) {
      const tl = await TheLoai.findOne({ MaTheLoai: obj.MaTheLoai }).lean();
      if (tl) obj.TenTheLoai = tl.TenTheLoai;
    }
    if (obj.TacGia) {
      const tg = await TacGia.findOne({ MaTacGia: obj.TacGia }).lean();
      if (tg) obj.TenTacGia = tg.TenTacGia;
    }

    res.json({ success: true, message: 'Cập nhật sách thành công.', data: obj });
  } catch (error) {
    next(error);
  }
};

// @desc    Xóa sách
// @route   DELETE /api/sach/:id
// @access  Private
const deleteSach = async (req, res, next) => {
  try {
    const sach = await Sach.findById(req.params.id);
    if (!sach) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sách.' });
    }

    // Ràng buộc 1: Không được xóa sách nếu số lượng lớn hơn 0
    if (sach.SoQuyen > 0) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa sách '${sach.TenSach}' vì số lượng trong kho còn ${sach.SoQuyen} quyển (phải bằng 0 mới được xóa)!`,
      });
    }

    // Ràng buộc 2: Không được xóa sách nếu đang được mượn, quá hạn hoặc chờ duyệt
    const activeLoan = await TheoDoiMuonSach.findOne({
      MaSach: sach.MaSach,
      TrangThai: { $in: ['DangMuon', 'QuaHan', 'ChoDuyet'] },
    });
    if (activeLoan) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa sách '${sach.TenSach}' (${sach.MaSach}) vì đang có phiếu mượn ở trạng thái Chờ duyệt, Đang mượn hoặc Quá hạn!`,
      });
    }

    await sach.deleteOne();
    res.json({ success: true, message: 'Xóa sách thành công.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllSach, getSachById, createSach, updateSach, deleteSach };

