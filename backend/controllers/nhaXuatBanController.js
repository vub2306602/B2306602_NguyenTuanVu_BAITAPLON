const NhaXuatBan = require('../models/NhaXuatBan');
const Sach = require('../models/Sach');

// @desc    Lấy danh sách tất cả nhà xuất bản
// @route   GET /api/nhaxuatban
// @access  Public
const getAllNhaXuatBan = async (req, res, next) => {
  try {
    const { keyword } = req.query;
    let query = {};
    if (keyword && keyword.trim()) {
      const regex = new RegExp(keyword.trim(), 'i');
      query = {
        $or: [
          { MaNXB: regex },
          { TenNXB: regex },
          { DiaChi: regex },
        ],
      };
    }
    const nxbs = await NhaXuatBan.find(query).sort({ MaNXB: 1 }).lean();

    // Thống kê số đầu sách và tổng số bản sách trong kho theo từng nhà xuất bản
    const bookCounts = await Sach.aggregate([
      {
        $group: {
          _id: '$MaNXB',
          soDauSach: { $sum: 1 },
          tongSoQuyen: { $sum: '$SoQuyen' },
        },
      },
    ]);
    const bookCountMap = {};
    bookCounts.forEach((bc) => {
      if (bc._id) {
        bookCountMap[bc._id] = {
          soDauSach: bc.soDauSach,
          tongSoQuyen: bc.tongSoQuyen,
        };
      }
    });

    const data = nxbs.map((nxb) => {
      const counts = bookCountMap[nxb.MaNXB] || { soDauSach: 0, tongSoQuyen: 0 };
      return {
        ...nxb,
        soDauSach: counts.soDauSach,
        tongSoQuyen: counts.tongSoQuyen,
      };
    });

    res.json({ success: true, count: data.length, data });
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy chi tiết một nhà xuất bản theo ID
// @route   GET /api/nhaxuatban/:id
// @access  Public
const getNhaXuatBanById = async (req, res, next) => {
  try {
    const nxb = await NhaXuatBan.findById(req.params.id);
    if (!nxb) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy nhà xuất bản.' });
    }
    res.json({ success: true, data: nxb });
  } catch (error) {
    next(error);
  }
};

// @desc    Tạo nhà xuất bản mới
// @route   POST /api/nhaxuatban
// @access  Private (Admin/Thủ thư)
const createNhaXuatBan = async (req, res, next) => {
  try {
    const { MaNXB, TenNXB, DiaChi } = req.body;

    if (!MaNXB || !TenNXB || !DiaChi) {
      return res.status(400).json({ success: false, message: 'Mã NXB, Tên NXB và Địa chỉ là bắt buộc.' });
    }

    const nxb = await NhaXuatBan.create({ MaNXB, TenNXB, DiaChi });
    res.status(201).json({ success: true, message: 'Tạo nhà xuất bản thành công.', data: nxb });
  } catch (error) {
    next(error);
  }
};

// @desc    Cập nhật nhà xuất bản
// @route   PUT /api/nhaxuatban/:id
// @access  Private (Admin/Thủ thư)
const updateNhaXuatBan = async (req, res, next) => {
  try {
    const { MaNXB, TenNXB, DiaChi } = req.body;

    const nxb = await NhaXuatBan.findById(req.params.id);
    if (!nxb) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy nhà xuất bản.' });
    }

    if (MaNXB) nxb.MaNXB = MaNXB;
    if (TenNXB) nxb.TenNXB = TenNXB;
    if (DiaChi) nxb.DiaChi = DiaChi;

    const updated = await nxb.save();
    res.json({ success: true, message: 'Cập nhật nhà xuất bản thành công.', data: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Xóa nhà xuất bản
// @route   DELETE /api/nhaxuatban/:id
// @access  Private (Admin)
const deleteNhaXuatBan = async (req, res, next) => {
  try {
    const nxb = await NhaXuatBan.findById(req.params.id);
    if (!nxb) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy nhà xuất bản.' });
    }

    // Ràng buộc: Không được xóa nếu vẫn còn ít nhất 1 sách vẫn còn trong kho thuộc nhà xuất bản đó
    const bookCount = await Sach.countDocuments({ MaNXB: nxb.MaNXB });
    if (bookCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa nhà xuất bản '${nxb.TenNXB}' (${nxb.MaNXB}) vì vẫn còn ${bookCount} cuốn sách thuộc nhà xuất bản này trong kho!`,
      });
    }

    await nxb.deleteOne();
    res.json({ success: true, message: 'Xóa nhà xuất bản thành công.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllNhaXuatBan, getNhaXuatBanById, createNhaXuatBan, updateNhaXuatBan, deleteNhaXuatBan };

