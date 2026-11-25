const TheLoai = require('../models/TheLoai');
const Sach = require('../models/Sach');

// @desc    Lấy danh sách tất cả thể loại
// @route   GET /api/theloai
// @access  Public
const getAllTheLoai = async (req, res, next) => {
  try {
    const { keyword } = req.query;
    let query = {};
    if (keyword && keyword.trim()) {
      const regex = new RegExp(keyword.trim(), 'i');
      query = {
        $or: [
          { MaTheLoai: regex },
          { TenTheLoai: regex },
          { MoTa: regex },
        ],
      };
    }
    const theLoais = await TheLoai.find(query).sort({ MaTheLoai: 1 }).lean();

    // Thống kê số đầu sách và tổng số bản sách trong kho theo từng thể loại
    const bookCounts = await Sach.aggregate([
      {
        $group: {
          _id: '$MaTheLoai',
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

    const data = theLoais.map((tl) => {
      const counts = bookCountMap[tl.MaTheLoai] || { soDauSach: 0, tongSoQuyen: 0 };
      return {
        ...tl,
        soDauSach: counts.soDauSach,
        tongSoQuyen: counts.tongSoQuyen,
      };
    });

    res.json({ success: true, count: data.length, data });
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy chi tiết một thể loại theo ID MongoDB
// @route   GET /api/theloai/:id
// @access  Public
const getTheLoaiById = async (req, res, next) => {
  try {
    const theLoai = await TheLoai.findById(req.params.id);
    if (!theLoai) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thể loại.' });
    }
    res.json({ success: true, data: theLoai });
  } catch (error) {
    next(error);
  }
};

// @desc    Tạo thể loại mới
// @route   POST /api/theloai
// @access  Private (Admin/Thủ thư)
const createTheLoai = async (req, res, next) => {
  try {
    const { MaTheLoai, TenTheLoai, MoTa } = req.body;

    if (!MaTheLoai || !TenTheLoai) {
      return res.status(400).json({ success: false, message: 'Mã thể loại và Tên thể loại là bắt buộc.' });
    }

    const theLoai = await TheLoai.create({ MaTheLoai, TenTheLoai, MoTa });
    res.status(201).json({ success: true, message: 'Tạo thể loại thành công.', data: theLoai });
  } catch (error) {
    next(error);
  }
};

// @desc    Cập nhật thể loại
// @route   PUT /api/theloai/:id
// @access  Private (Admin/Thủ thư)
const updateTheLoai = async (req, res, next) => {
  try {
    const { MaTheLoai, TenTheLoai, MoTa } = req.body;

    const theLoai = await TheLoai.findById(req.params.id);
    if (!theLoai) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thể loại.' });
    }

    if (MaTheLoai) theLoai.MaTheLoai = MaTheLoai;
    if (TenTheLoai) theLoai.TenTheLoai = TenTheLoai;
    if (MoTa !== undefined) theLoai.MoTa = MoTa;

    const updated = await theLoai.save();
    res.json({ success: true, message: 'Cập nhật thể loại thành công.', data: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Xóa thể loại
// @route   DELETE /api/theloai/:id
// @access  Private (Admin)
const deleteTheLoai = async (req, res, next) => {
  try {
    const theLoai = await TheLoai.findById(req.params.id);
    if (!theLoai) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thể loại.' });
    }

    // Ràng buộc: Không được xóa nếu vẫn còn ít nhất 1 sách vẫn còn trong kho thuộc thể loại đó
    const bookCount = await Sach.countDocuments({ MaTheLoai: theLoai.MaTheLoai });
    if (bookCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa thể loại '${theLoai.TenTheLoai}' (${theLoai.MaTheLoai}) vì vẫn còn ${bookCount} cuốn sách thuộc thể loại này trong kho!`,
      });
    }

    await theLoai.deleteOne();
    res.json({ success: true, message: 'Xóa thể loại thành công.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllTheLoai, getTheLoaiById, createTheLoai, updateTheLoai, deleteTheLoai };

