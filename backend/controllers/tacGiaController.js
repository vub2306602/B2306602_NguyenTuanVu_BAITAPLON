const TacGia = require('../models/TacGia');
const Sach = require('../models/Sach');

// @desc    Lấy danh sách tất cả tác giả (hỗ trợ tìm kiếm)
// @route   GET /api/tacgia
// @access  Public
const getAllTacGia = async (req, res, next) => {
  try {
    const keyword = req.query.keyword || '';
    const filter = keyword
      ? {
          $or: [
            { MaTacGia: { $regex: keyword, $options: 'i' } },
            { TenTacGia: { $regex: keyword, $options: 'i' } },
          ],
        }
      : {};

    const tacGias = await TacGia.find(filter).sort({ MaTacGia: 1 }).lean();

    // Thống kê số đầu sách và tổng số bản sách trong kho theo từng tác giả
    const bookCounts = await Sach.aggregate([
      {
        $group: {
          _id: '$TacGia',
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

    const data = tacGias.map((tg) => {
      const counts = bookCountMap[tg.MaTacGia] || bookCountMap[tg.TenTacGia] || { soDauSach: 0, tongSoQuyen: 0 };
      return {
        ...tg,
        soDauSach: counts.soDauSach,
        tongSoQuyen: counts.tongSoQuyen,
      };
    });

    res.json({ success: true, count: data.length, data });
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy chi tiết một tác giả theo ID MongoDB
// @route   GET /api/tacgia/:id
// @access  Public
const getTacGiaById = async (req, res, next) => {
  try {
    const tacGia = await TacGia.findById(req.params.id);
    if (!tacGia) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tác giả.' });
    }
    res.json({ success: true, data: tacGia });
  } catch (error) {
    next(error);
  }
};

// @desc    Tạo tác giả mới
// @route   POST /api/tacgia
// @access  Private (Admin/Thủ thư)
const createTacGia = async (req, res, next) => {
  try {
    const { MaTacGia, TenTacGia, MoTa } = req.body;

    if (!MaTacGia || !TenTacGia) {
      return res.status(400).json({ success: false, message: 'Mã tác giả và Tên tác giả là bắt buộc.' });
    }

    const existing = await TacGia.findOne({ MaTacGia: MaTacGia.trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: `Mã tác giả '${MaTacGia}' đã tồn tại.` });
    }

    const tacGia = await TacGia.create({
      MaTacGia: MaTacGia.trim(),
      TenTacGia: TenTacGia.trim(),
      MoTa: MoTa || '',
    });

    res.status(201).json({ success: true, message: 'Tạo tác giả thành công.', data: tacGia });
  } catch (error) {
    next(error);
  }
};

// @desc    Cập nhật tác giả
// @route   PUT /api/tacgia/:id
// @access  Private (Admin/Thủ thư)
const updateTacGia = async (req, res, next) => {
  try {
    const { MaTacGia, TenTacGia, MoTa } = req.body;

    const tacGia = await TacGia.findById(req.params.id);
    if (!tacGia) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tác giả.' });
    }

    if (MaTacGia && MaTacGia.trim() !== tacGia.MaTacGia) {
      const duplicate = await TacGia.findOne({ MaTacGia: MaTacGia.trim() });
      if (duplicate) {
        return res.status(400).json({ success: false, message: `Mã tác giả '${MaTacGia}' đã tồn tại.` });
      }
      // Đồng thời cập nhật các sách đang trỏ tới mã cũ nếu đổi mã tác giả
      await Sach.updateMany({ TacGia: tacGia.MaTacGia }, { TacGia: MaTacGia.trim() });
      tacGia.MaTacGia = MaTacGia.trim();
    }

    if (TenTacGia) tacGia.TenTacGia = TenTacGia.trim();
    if (MoTa !== undefined) tacGia.MoTa = MoTa;

    const updated = await tacGia.save();
    res.json({ success: true, message: 'Cập nhật tác giả thành công.', data: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Xóa tác giả
// @route   DELETE /api/tacgia/:id
// @access  Private (Admin)
const deleteTacGia = async (req, res, next) => {
  try {
    const tacGia = await TacGia.findById(req.params.id);
    if (!tacGia) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tác giả.' });
    }

    // Kiểm tra xem có sách nào đang tham chiếu tới tác giả này không
    const bookCount = await Sach.countDocuments({ TacGia: tacGia.MaTacGia });
    if (bookCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa tác giả '${tacGia.TenTacGia}' vì đang có ${bookCount} cuốn sách thuộc tác giả này trong thư viện!`,
      });
    }

    await tacGia.deleteOne();
    res.json({ success: true, message: 'Xóa tác giả thành công.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTacGia,
  getTacGiaById,
  createTacGia,
  updateTacGia,
  deleteTacGia,
};
