/**
 * SEED DATA SCRIPT
 * Khởi tạo dữ liệu mẫu ban đầu cho hệ thống Quản lý Mượn Trả Sách
 *
 * Chạy bằng lệnh: node backend/seeds/seedData.js
 * (Từ thư mục gốc dự án, hoặc: node seeds/seedData.js từ trong backend/)
 *
 * Dữ liệu được nạp:
 *   - 1 tài khoản Admin mặc định
 *   - 1 tài khoản Thủ thư mẫu
 *   - 5 Thể loại sách
 *   - 3 Nhà xuất bản
 *   - 10 Đầu sách mẫu
 */

require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import Models
const NhanVien = require('../models/NhanVien');
const TheLoai = require('../models/TheLoai');
const NhaXuatBan = require('../models/NhaXuatBan');
const TacGia = require('../models/TacGia');
const Sach = require('../models/Sach');

// ============================================================
// DỮ LIỆU MẪU
// ============================================================

// 1. Nhân viên (Admin + Thủ thư)
const nhanVienData = [
  {
    MSNV: 'admin',
    HoTenNV: 'Quản trị viên',
    Password: bcrypt.hashSync('admin123', 10),
    ChucVu: 'Admin',
    DiaChi: '01 Võ Văn Ngân, Thủ Đức, TP.HCM',
    SoDienThoai: '0900000001',
  },
  {
    MSNV: 'NV001',
    HoTenNV: 'Nguyễn Thị Lan',
    Password: bcrypt.hashSync('thuThu123', 10),
    ChucVu: 'Thủ thư',
    DiaChi: '12 Lê Lợi, Quận 1, TP.HCM',
    SoDienThoai: '0900000002',
  },
];

// 2. Thể loại sách
const theLoaiData = [
  { MaTheLoai: 'TL01', TenTheLoai: 'Công nghệ thông tin', MoTa: 'Sách về lập trình, phần mềm, trí tuệ nhân tạo, an toàn thông tin' },
  { MaTheLoai: 'TL02', TenTheLoai: 'Văn học', MoTa: 'Tiểu thuyết, truyện ngắn, thơ ca trong và ngoài nước' },
  { MaTheLoai: 'TL03', TenTheLoai: 'Kinh tế - Quản trị', MoTa: 'Sách kinh doanh, tài chính, marketing, quản lý doanh nghiệp' },
  { MaTheLoai: 'TL04', TenTheLoai: 'Khoa học tự nhiên', MoTa: 'Toán học, vật lý, hóa học, sinh học' },
  { MaTheLoai: 'TL05', TenTheLoai: 'Kỹ năng sống', MoTa: 'Phát triển bản thân, tâm lý học ứng dụng, kỹ năng mềm' },
];

// 3. Nhà xuất bản
const nhaXuatBanData = [
  { MaNXB: 'NXB01', TenNXB: 'NXB Kim Đồng', DiaChi: '55 Quang Trung, Hai Bà Trưng, Hà Nội' },
  { MaNXB: 'NXB02', TenNXB: 'NXB Trẻ', DiaChi: '161B Lý Chính Thắng, Quận 3, TP.HCM' },
  { MaNXB: 'NXB03', TenNXB: 'NXB Khoa học và Kỹ thuật', DiaChi: '70 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội' },
];

// 3.1 Tác giả
const tacGiaData = [
  { MaTacGia: 'TG001', TenTacGia: 'Nguyễn Văn A', MoTa: 'Chuyên gia công nghệ thông tin và lập trình Web' },
  { MaTacGia: 'TG002', TenTacGia: 'Trần Thị B', MoTa: 'Kỹ sư phần mềm cao cấp, chuyên gia kiến trúc backend' },
  { MaTacGia: 'TG003', TenTacGia: 'Lê Văn C', MoTa: 'Lập trình viên Frontend, tác giả sách công nghệ' },
  { MaTacGia: 'TG004', TenTacGia: 'Dale Carnegie', MoTa: 'Nhà văn, nhà thuyết trình người Mỹ, tác giả Đắc Nhân Tâm' },
  { MaTacGia: 'TG005', TenTacGia: 'Paulo Coelho', MoTa: 'Tiểu thuyết gia người Brazil, tác giả Nhà Giả Kim' },
  { MaTacGia: 'TG006', TenTacGia: 'Eric Ries', MoTa: 'Doanh nhân và tác giả người Mỹ, khởi xướng phong trào Lean Startup' },
  { MaTacGia: 'TG007', TenTacGia: 'Daniel Kahneman', MoTa: 'Nhà tâm lý học người Mỹ gốc Israel đạt giải Nobel Kinh tế 2002' },
  { MaTacGia: 'TG008', TenTacGia: 'Nguyễn Đình Trí', MoTa: 'Giáo sư Toán học, chủ biên nhiều bộ giáo trình Toán cao cấp' },
  { MaTacGia: 'TG009', TenTacGia: 'Nguyễn Du', MoTa: 'Đại thi hào dân tộc Việt Nam, Danh nhân văn hóa thế giới' },
  { MaTacGia: 'TG010', TenTacGia: 'Stuart Russell & Peter Norvig', MoTa: 'Hai nhà khoa học máy tính hàng đầu thế giới về Trí tuệ Nhân tạo' },
];

// 4. Sách mẫu (10 đầu sách)
const sachData = [
  {
    MaSach: 'S001',
    TenSach: 'Lập trình JavaScript từ cơ bản đến nâng cao',
    DonGia: 120000,
    SoQuyen: 5,
    NamXuatBan: 2022,
    MaNXB: 'NXB03',
    TacGia: 'TG001',
    MaTheLoai: 'TL01',
    HinhAnh: '',
    MoTa: 'Hướng dẫn toàn diện về ngôn ngữ JavaScript, từ cú pháp cơ bản đến ES6+ và lập trình bất đồng bộ.',
  },
  {
    MaSach: 'S002',
    TenSach: 'Node.js và Express – Xây dựng REST API',
    DonGia: 135000,
    SoQuyen: 4,
    NamXuatBan: 2023,
    MaNXB: 'NXB03',
    TacGia: 'TG002',
    MaTheLoai: 'TL01',
    HinhAnh: '',
    MoTa: 'Thực hành xây dựng RESTful API với Node.js, Express.js và kết nối MongoDB qua Mongoose.',
  },
  {
    MaSach: 'S003',
    TenSach: 'Vue.js 3 – Phát triển ứng dụng SPA hiện đại',
    DonGia: 145000,
    SoQuyen: 6,
    NamXuatBan: 2023,
    MaNXB: 'NXB03',
    TacGia: 'TG003',
    MaTheLoai: 'TL01',
    HinhAnh: '',
    MoTa: 'Toàn tập Vue 3 với Composition API, Pinia, Vue Router 4 và tích hợp Axios gọi API.',
  },
  {
    MaSach: 'S004',
    TenSach: 'Đắc nhân tâm',
    DonGia: 85000,
    SoQuyen: 8,
    NamXuatBan: 2020,
    MaNXB: 'NXB02',
    TacGia: 'TG004',
    MaTheLoai: 'TL05',
    HinhAnh: '',
    MoTa: 'Cuốn sách bán chạy nhất mọi thời đại về nghệ thuật giao tiếp và ảnh hưởng đến người khác.',
  },
  {
    MaSach: 'S005',
    TenSach: 'Nhà giả kim',
    DonGia: 79000,
    SoQuyen: 10,
    NamXuatBan: 2019,
    MaNXB: 'NXB02',
    TacGia: 'TG005',
    MaTheLoai: 'TL02',
    HinhAnh: '',
    MoTa: 'Tiểu thuyết triết học nổi tiếng thế giới về hành trình theo đuổi ước mơ của chàng trai trẻ Santiago.',
  },
  {
    MaSach: 'S006',
    TenSach: 'Khởi nghiệp tinh gọn',
    DonGia: 99000,
    SoQuyen: 3,
    NamXuatBan: 2021,
    MaNXB: 'NXB02',
    TacGia: 'TG006',
    MaTheLoai: 'TL03',
    HinhAnh: '',
    MoTa: 'Phương pháp Lean Startup giúp các startup xây dựng sản phẩm đúng nhu cầu thị trường, giảm thiểu lãng phí.',
  },
  {
    MaSach: 'S007',
    TenSach: 'Tư duy nhanh và chậm',
    DonGia: 110000,
    SoQuyen: 5,
    NamXuatBan: 2021,
    MaNXB: 'NXB01',
    TacGia: 'TG007',
    MaTheLoai: 'TL05',
    HinhAnh: '',
    MoTa: 'Khám phá hai hệ thống tư duy của con người và cách chúng ảnh hưởng đến các quyết định hằng ngày.',
  },
  {
    MaSach: 'S008',
    TenSach: 'Giải tích toán học tập 1',
    DonGia: 95000,
    SoQuyen: 7,
    NamXuatBan: 2018,
    MaNXB: 'NXB03',
    TacGia: 'TG008',
    MaTheLoai: 'TL04',
    HinhAnh: '',
    MoTa: 'Giáo trình giải tích toán học dành cho sinh viên đại học khối kỹ thuật và tự nhiên.',
  },
  {
    MaSach: 'S009',
    TenSach: 'Truyện Kiều',
    DonGia: 55000,
    SoQuyen: 12,
    NamXuatBan: 2017,
    MaNXB: 'NXB01',
    TacGia: 'TG009',
    MaTheLoai: 'TL02',
    HinhAnh: '',
    MoTa: 'Kiệt tác văn học cổ điển Việt Nam — truyện thơ Nôm 3254 câu lục bát bất hủ của đại thi hào Nguyễn Du.',
  },
  {
    MaSach: 'S010',
    TenSach: 'Trí tuệ nhân tạo – Nhập môn',
    DonGia: 160000,
    SoQuyen: 2,
    NamXuatBan: 2024,
    MaNXB: 'NXB03',
    TacGia: 'TG010',
    MaTheLoai: 'TL01',
    HinhAnh: '',
    MoTa: 'Giáo trình AI kinh điển nhất thế giới — tổng quan về tìm kiếm, học máy, xử lý ngôn ngữ tự nhiên và robot.',
  },
];

// ============================================================
// HÀM THỰC THI SEED
// ============================================================
const seedDatabase = async () => {
  try {
    // Kết nối MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[Seed] Đã kết nối MongoDB:', mongoose.connection.host);

    // Xóa toàn bộ dữ liệu cũ (nếu có) để seed sạch
    console.log('[Seed] Đang xóa dữ liệu cũ...');
    await Promise.all([
      NhanVien.deleteMany({}),
      TheLoai.deleteMany({}),
      NhaXuatBan.deleteMany({}),
      TacGia.deleteMany({}),
      Sach.deleteMany({}),
    ]);
    console.log('[Seed] Đã xóa dữ liệu cũ.');

    // Chèn dữ liệu mới
    console.log('[Seed] Đang nạp dữ liệu mẫu...');
    const nhanViens = await NhanVien.insertMany(nhanVienData);
    const theLoais = await TheLoai.insertMany(theLoaiData);
    const nhaXuatBans = await NhaXuatBan.insertMany(nhaXuatBanData);
    const tacGias = await TacGia.insertMany(tacGiaData);
    const sachs = await Sach.insertMany(sachData);

    // Báo cáo kết quả
    console.log('\n========================================');
    console.log('SEED DATA THÀNH CÔNG!');
    console.log('========================================');
    console.log(` Nhân viên     : ${nhanViens.length} tài khoản`);
    console.log(` Thể loại sách : ${theLoais.length} thể loại`);
    console.log(` Nhà xuất bản  : ${nhaXuatBans.length} nhà xuất bản`);
    console.log(` Tác giả       : ${tacGias.length} tác giả`);
    console.log(` Đầu sách      : ${sachs.length} quyển`);
    console.log('========================================');
    console.log('\nTài khoản Admin mặc định:');
    console.log('   MSNV     : admin');
    console.log('   Password : admin123');
    console.log('   ChucVu   : Admin');
    console.log('\nTài khoản Thủ thư mẫu:');
    console.log('   MSNV     : NV001');
    console.log('   Password : thuThu123');
    console.log('   ChucVu   : Thủ thư');
    console.log('========================================\n');
  } catch (error) {
    console.error('[Seed] LỖI:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('[Seed] Đã ngắt kết nối MongoDB.');
    process.exit(0);
  }
};

// Chạy seed
seedDatabase();

