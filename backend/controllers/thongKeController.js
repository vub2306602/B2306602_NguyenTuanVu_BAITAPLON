const Sach = require('../models/Sach');
const DocGia = require('../models/DocGia');
const TheoDoiMuonSach = require('../models/TheoDoiMuonSach');
const TheLoai = require('../models/TheLoai');

// @desc    Thống kê tổng quan (tổng sách, sách đang mượn, tổng độc giả, phiếu chờ duyệt)
// @route   GET /api/thongke/tong-quan
// @access  Private (Nhân viên)
const getTongQuan = async (req, res, next) => {
  try {
    // 1. Tổng số đầu sách & tổng số bản sách trong kho
    const sachStats = await Sach.aggregate([
      {
        $group: {
          _id: null,
          tongDauSach: { $sum: 1 },
          tongSoLuongKho: { $sum: '$SoQuyen' },
        },
      },
    ]);
    const tongDauSach = sachStats.length > 0 ? sachStats[0].tongDauSach : 0;
    const tongSoLuongKho = sachStats.length > 0 ? sachStats[0].tongSoLuongKho : 0;

    // 2. Số sách đang mượn trong hạn (không tính quá hạn)
    const now = new Date();
    const sachDangMuon = await TheoDoiMuonSach.countDocuments({
      TrangThai: 'DangMuon',
      $or: [
        { HanTra: { $exists: false } },
        { HanTra: { $gte: now } },
      ],
    });

    // 3. Tổng số độc giả
    const tongDocGia = await DocGia.countDocuments();

    // 4. Số phiếu đang chờ duyệt
    const phieuChoDuyet = await TheoDoiMuonSach.countDocuments({ TrangThai: 'ChoDuyet' });

    // 5. Phiếu mượn quá hạn (chưa trả và đã quá hạn)
    const phieuQuaHan = await TheoDoiMuonSach.countDocuments({
      $or: [
        { TrangThai: 'QuaHan' },
        { TrangThai: 'DangMuon', HanTra: { $lt: now } },
      ],
    });

    res.json({
      success: true,
      data: {
        tongDauSach,
        tongSoLuongKho,
        sachDangMuon,
        tongDocGia,
        phieuChoDuyet,
        phieuQuaHan,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Top sách được mượn nhiều nhất
// @route   GET /api/thongke/sach-muon-nhieu
// @access  Private (Nhân viên)
const getSachMuonNhieu = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    // Gom nhóm theo MaSach trong bảng TheoDoiMuonSach (tính các phiếu đã được duyệt/đang mượn/đã trả)
    const topSach = await TheoDoiMuonSach.aggregate([
      {
        $match: {
          TrangThai: { $in: ['DangMuon', 'DaTra', 'QuaHan'] },
        },
      },
      {
        $group: {
          _id: '$MaSach',
          soLanMuon: { $sum: 1 },
        },
      },
      {
        $sort: { soLanMuon: -1 },
      },
      {
        $limit: limit,
      },
      {
        $lookup: {
          from: 'saches',
          localField: '_id',
          foreignField: 'MaSach',
          as: 'sachInfo',
        },
      },
      {
        $unwind: {
          path: '$sachInfo',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          MaSach: '$_id',
          soLanMuon: 1,
          TenSach: '$sachInfo.TenSach',
          TacGia: '$sachInfo.TacGia',
          MaTheLoai: '$sachInfo.MaTheLoai',
          HinhAnh: '$sachInfo.HinhAnh',
        },
      },
    ]);

    res.json({
      success: true,
      count: topSach.length,
      data: topSach,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Thống kê cơ cấu sách theo từng thể loại
// @route   GET /api/thongke/theo-the-loai
// @access  Private (Nhân viên)
const getTheoTheLoai = async (req, res, next) => {
  try {
    const thongKe = await Sach.aggregate([
      {
        $group: {
          _id: '$MaTheLoai',
          soDauSach: { $sum: 1 },
          tongSoQuyen: { $sum: '$SoQuyen' },
        },
      },
      {
        $lookup: {
          from: 'theloais',
          localField: '_id',
          foreignField: 'MaTheLoai',
          as: 'theLoaiInfo',
        },
      },
      {
        $unwind: {
          path: '$theLoaiInfo',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          MaTheLoai: '$_id',
          TenTheLoai: { $ifNull: ['$theLoaiInfo.TenTheLoai', 'Chưa phân loại'] },
          soDauSach: 1,
          tongSoQuyen: 1,
        },
      },
      {
        $sort: { tongSoQuyen: -1 },
      },
    ]);

    res.json({
      success: true,
      count: thongKe.length,
      data: thongKe,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Thống kê cơ cấu sách theo từng tác giả
// @route   GET /api/thongke/theo-tac-gia
// @access  Private (Nhân viên)
const getTheoTacGia = async (req, res, next) => {
  try {
    const thongKe = await Sach.aggregate([
      {
        $group: {
          _id: '$TacGia',
          soDauSach: { $sum: 1 },
          tongSoQuyen: { $sum: '$SoQuyen' },
        },
      },
      {
        $lookup: {
          from: 'tacgias',
          localField: '_id',
          foreignField: 'MaTacGia',
          as: 'tacGiaInfo',
        },
      },
      {
        $unwind: {
          path: '$tacGiaInfo',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          MaTacGia: '$_id',
          TenTacGia: { $ifNull: ['$tacGiaInfo.TenTacGia', '$_id'] },
          soDauSach: 1,
          tongSoQuyen: 1,
        },
      },
      {
        $sort: { tongSoQuyen: -1 },
      },
    ]);

    res.json({
      success: true,
      count: thongKe.length,
      data: thongKe,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Thống kê cơ cấu sách theo từng nhà xuất bản
// @route   GET /api/thongke/theo-nha-xuat-ban
// @access  Private (Nhân viên)
const getTheoNhaXuatBan = async (req, res, next) => {
  try {
    const thongKe = await Sach.aggregate([
      {
        $group: {
          _id: '$MaNXB',
          soDauSach: { $sum: 1 },
          tongSoQuyen: { $sum: '$SoQuyen' },
        },
      },
      {
        $lookup: {
          from: 'nhaxuatbans',
          localField: '_id',
          foreignField: 'MaNXB',
          as: 'nxbInfo',
        },
      },
      {
        $unwind: {
          path: '$nxbInfo',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          MaNXB: '$_id',
          TenNXB: { $ifNull: ['$nxbInfo.TenNXB', '$_id'] },
          soDauSach: 1,
          tongSoQuyen: 1,
        },
      },
      {
        $sort: { tongSoQuyen: -1 },
      },
    ]);

    res.json({
      success: true,
      count: thongKe.length,
      data: thongKe,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Danh sách các phiếu mượn quá hạn
// @route   GET /api/thongke/qua-han
// @access  Private (Nhân viên)
const getPhieuQuaHan = async (req, res, next) => {
  try {
    const now = new Date();

    // Tìm các phiếu ở trạng thái DangMuon hoặc đã đánh dấu QuaHan có HanTra < now
    const phieuQuaHan = await TheoDoiMuonSach.find({
      $or: [
        { TrangThai: 'DangMuon', HanTra: { $lt: now } },
        { TrangThai: 'QuaHan' },
      ],
    }).sort({ HanTra: 1 });

    // Tự động đồng bộ trạng thái sang QuaHan nếu đang là DangMuon mà quá hạn
    const idsToUpdate = phieuQuaHan
      .filter((p) => p.TrangThai === 'DangMuon' && p.HanTra < now)
      .map((p) => p._id);

    if (idsToUpdate.length > 0) {
      await TheoDoiMuonSach.updateMany(
        { _id: { $in: idsToUpdate } },
        { $set: { TrangThai: 'QuaHan' } }
      );
    }

    res.json({
      success: true,
      count: phieuQuaHan.length,
      data: phieuQuaHan,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTongQuan,
  getSachMuonNhieu,
  getTheoTheLoai,
  getTheoTacGia,
  getTheoNhaXuatBan,
  getPhieuQuaHan,
};

