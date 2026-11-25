<template>
  <div>
    <!-- Header -->
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <h3 class="fw-bold text-success mb-1">Xử Lý Mượn & Trả Sách</h3>
        <p class="text-muted mb-0">Duyệt mượn sách, xác nhận trả sách và theo dõi hạn mượn</p>
      </div>
      <button class="btn btn-outline-success btn-sm" @click="fetchPhieuMuon">
        <i class="bi bi-arrow-clockwise"></i> Tải lại
      </button>
    </div>

    <!-- Thanh Tabs phân loại trạng thái -->
    <ul class="nav nav-pills mb-4 bg-white p-2 rounded shadow-sm border">
      <li class="nav-item">
        <button
          class="nav-link fw-semibold"
          :class="{ active: currentTab === 'ChoDuyet' }"
          @click="currentTab = 'ChoDuyet'"
        >
          <i class="bi bi-hourglass-split me-1"></i> Chờ Duyệt
          <span v-if="counts.ChoDuyet > 0" class="badge bg-warning text-dark ms-1">{{ counts.ChoDuyet }}</span>
        </button>
      </li>
      <li class="nav-item">
        <button
          class="nav-link fw-semibold"
          :class="{ active: currentTab === 'DangMuon' }"
          @click="currentTab = 'DangMuon'"
        >
          <i class="bi bi-book me-1"></i> Đang Mượn
          <span v-if="counts.DangMuon > 0" class="badge bg-primary ms-1">{{ counts.DangMuon }}</span>
        </button>
      </li>
      <li class="nav-item">
        <button
          class="nav-link fw-semibold text-danger"
          :class="{ 'active bg-danger text-white': currentTab === 'QuaHan' }"
          @click="currentTab = 'QuaHan'"
        >
          <i class="bi bi-exclamation-triangle-fill me-1"></i> Quá Hạn
          <span v-if="counts.QuaHan > 0" class="badge bg-white text-danger ms-1">{{ counts.QuaHan }}</span>
        </button>
      </li>
      <li class="nav-item">
        <button
          class="nav-link fw-semibold"
          :class="{ active: currentTab === 'TuChoi' }"
          @click="currentTab = 'TuChoi'"
        >
          <i class="bi bi-x-circle me-1"></i> Từ Chối / Đã Hủy
          <!-- <span v-if="counts.TuChoi > 0" class="badge bg-secondary ms-1">{{ counts.TuChoi }}</span> -->
        </button>
      </li>
      <li class="nav-item">
        <button
          class="nav-link fw-semibold"
          :class="{ active: currentTab === 'TatCa' }"
          @click="currentTab = 'TatCa'"
        >
          <i class="bi bi-journal-text me-1"></i> Lịch Sử Toàn Bộ
        </button>
      </li>
    </ul>

    <!-- Thanh Tìm Kiếm Đa Năng cho tất cả các mục -->
    <div class="card border-0 shadow-sm p-3 mb-3 bg-white">
      <div class="row g-2 align-items-center">
        <div class="col-md-6 col-lg-5">
          <div class="input-group">
            <span class="input-group-text bg-white border-end-0 text-success">
              <i class="bi bi-search"></i>
            </span>
            <input
              type="text"
              class="form-control border-start-0 ps-0"
              v-model="searchKeyword"
              placeholder="Tìm theo Mã Độc Giả, Mã Sách, Ghi chú, Ngày..."
            />
            <button
              v-if="searchKeyword"
              class="btn btn-outline-secondary border-start-0"
              type="button"
              @click="searchKeyword = ''"
              title="Xóa tìm kiếm"
            >
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
        </div>
        <div class="col-md-6 col-lg-7 text-md-end text-muted small">
          <span v-if="searchKeyword">
            Tìm thấy <strong class="text-success">{{ filteredPhieus.length }}</strong> kết quả phù hợp với từ khóa "<span class="text-dark fw-bold">{{ searchKeyword }}</span>"
          </span>
          <span v-else>
            Hiển thị <strong class="text-dark">{{ filteredPhieus.length }}</strong> phiếu trong mục này
          </span>
        </div>
      </div>
    </div>

    <!-- Bảng danh sách phiếu theo Tab -->
    <div class="card border-0 shadow-sm p-4" :class="{ 'border-danger border-2': currentTab === 'QuaHan' }">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Mã Độc Giả</th>
              <th>Mã Sách</th>
              <th>Ngày Mượn</th>
              <th>Hạn Trả</th>
              <th>Ngày Trả</th>
              <th>Trạng Thái</th>
              <th>Ghi Chú</th>
              <th class="text-end" style="min-width: 260px;">Xử Lý</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="p in filteredPhieus"
              :key="p._id"
              :class="{ 'table-danger border-danger': p.TrangThai === 'QuaHan' || isOverdue(p) }"
            >
              <td class="fw-bold">{{ p.MaDocGia }}</td>
              <td>
                <span class="badge bg-light text-dark border">{{ p.MaSach }}</span>
                <div v-if="p.TenSach" class="small fw-semibold text-dark mt-1" style="max-width: 170px;" :title="p.TenSach">
                  {{ p.TenSach }}
                </div>
              </td>
              <td class="small">{{ formatDate(p.NgayMuon) }}</td>
              <td class="small fw-semibold" :class="{ 'text-danger': isOverdue(p) }">
                <span v-if="p.HanTra">{{ formatDate(p.HanTra) }}</span>
                <span v-else-if="p.TrangThai === 'ChoDuyet'" class="text-primary" title="Hạn trả dự kiến (+14 ngày kể từ ngày mượn)">
                  {{ getDisplayHanTra(p) }} <small class="text-muted fw-normal">(dự kiến)</small>
                </span>
                <span v-else>—</span>
              </td>
              <td class="small">
                <template v-if="p.NgayTra">
                  <div class="fw-semibold text-dark">{{ formatDate(p.NgayTra) }}</div>
                  <!-- Tình trạng sách khi trả & Tiền phạt hư hại -->
                  <div v-if="p.TinhTrangSach" class="mt-1" style="font-size: 0.73rem;">
                    <span v-if="p.TinhTrangSach === 'Không hư'" class="badge bg-success-subtle text-success border border-success-subtle">
                      <i class="bi bi-shield-check me-1"></i>Sách nguyên vẹn
                    </span>
                    <span v-else class="badge bg-danger-subtle text-danger border border-danger-subtle" :title="`Mức hư hại: ${p.TinhTrangSach}`">
                      <i class="bi bi-exclamation-triangle-fill me-1"></i>{{ p.TinhTrangSach }} (Phạt: {{ formatCurrency(p.TienPhat || 0) }})
                    </span>
                  </div>
                  <!-- Quá hạn trễ hạn -->
                  <div v-if="calculateLateDays(p) > 0" class="text-danger fw-semibold mt-1" style="font-size: 0.73rem;">
                    <i class="bi bi-clock-history"></i> Trễ {{ calculateLateDays(p) }} ngày (Phạt {{ formatCurrency(calculateFine(p)) }})
                  </div>
                </template>
                <span v-else class="text-muted">—</span>
              </td>
              <td>
                <span :class="getStatusBadgeClass(p.TrangThai)">{{ p.TrangThai }}</span>
              </td>
              <td class="small text-muted" style="max-width: 200px;">{{ p.GhiChu || '—' }}</td>
              <td class="text-end">
                <!-- Nút In Phiếu: Nếu Đã Trả thì hiện In Phiếu Trả, nếu chưa trả thì hiện In Phiếu Mượn -->
                <button
                  v-if="p.TrangThai === 'DaTra'"
                  class="btn btn-sm btn-outline-success me-1 fw-semibold"
                  @click="handleOpenPrintModal(p, 'tra')"
                  title="In phiếu trả sách và biên lai nộp phạt quá hạn"
                >
                  <i class="bi bi-receipt"></i> In Phiếu Trả
                </button>

                <template v-else-if="p.TrangThai === 'ChoDuyet'">
                  <button
                    class="btn btn-sm btn-outline-secondary me-1"
                    @click="handleOpenPrintModal(p, 'muon')"
                    title="In phiếu mượn sách"
                  >
                    <i class="bi bi-printer"></i> In Phiếu Mượn
                  </button>
                  <button class="btn btn-sm btn-success me-1" @click="handleDuyet(p._id)">
                    <i class="bi bi-check-lg"></i> Duyệt
                  </button>
                  <button class="btn btn-sm btn-outline-danger" @click="handleTuChoi(p._id)">
                    <i class="bi bi-x-lg"></i> Từ Chối
                  </button>
                </template>

                <template v-else-if="['DangMuon', 'QuaHan'].includes(p.TrangThai)">
                  <button
                    class="btn btn-sm btn-outline-secondary me-1"
                    @click="handleOpenPrintModal(p, 'muon')"
                    title="In phiếu mượn sách"
                  >
                    <i class="bi bi-printer"></i> In Phiếu Mượn
                  </button>
                  <button class="btn btn-sm btn-primary" @click="handleOpenReturnModal(p)">
                    <i class="bi bi-arrow-return-left"></i> Xác Nhận Trả
                  </button>
                </template>

                <template v-else>
                  <span class="text-muted small ms-1">Hoàn tất</span>
                </template>
              </td>
            </tr>
            <tr v-if="filteredPhieus.length === 0">
              <td colspan="8" class="text-center text-muted py-4">Không có phiếu mượn nào ở mục này.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Xem Trước & In Phiếu Mượn / Trả Sách -->
    <div v-if="showPrintModal" class="modal-backdrop fade show"></div>
    <div v-if="showPrintModal" class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-light">
            <h5 class="modal-title fw-bold text-dark">
              <i class="bi me-2" :class="printModalType === 'tra' ? 'bi-receipt text-success' : 'bi-printer text-success'"></i>
              {{ printModalType === 'tra' ? 'Xem Trước & In Phiếu Trả Sách (Kèm Biên Lai Tiền Phạt)' : 'Xem Trước & In Phiếu Mượn Sách' }}
            </h5>
            <button type="button" class="btn-close" @click="closePrintModal"></button>
          </div>

          <div class="modal-body p-4 bg-light">
            <!-- Vùng In Phiếu (Khổ giấy phiếu in trang trọng) -->
            <div id="print-area" class="print-paper bg-white p-4 shadow-sm rounded border mx-auto">
        
              <!-- Tiêu đề Phiếu -->
              <div class="text-center my-3">
                <h3 class="fw-bold text-dark text-uppercase mb-1" style="letter-spacing: 1.5px;">
                  {{ printModalType === 'tra' ? 'PHIẾU TRẢ SÁCH' : 'PHIẾU MƯỢN SÁCH' }}
                </h3>
                <div class="text-muted small mb-1" style="font-size: 0.8rem;">
                  {{ printModalType === 'tra' ? '(BIÊN LAI TIẾP NHẬN HOÀN TRẢ & XÁC NHẬN TIỀN PHẠT TRỄ HẠN)' : '(MẪU SỐ 01/PM-TV - THEO DÕI MƯỢN TRẢ TÀI LIỆU)' }}
                </div>
                <span class="badge" :class="getStatusBadgeClass(printData.phieu?.TrangThai)" style="font-size: 0.8rem;">
                  Trạng thái: {{ printData.phieu?.TrangThai }}
                </span>
              </div>

              <!-- 1. Thông tin Độc giả -->
              <div class="mb-3">
                <div class="fw-bold text-success border-bottom border-success pb-1 mb-2 small text-uppercase">
                  <i class="bi bi-person-badge me-1"></i>
                  {{ (printModalType === 'tra' || printData.phieu?.TrangThai === 'DaTra') ? 'I. Thông Tin Độc Giả (Người Trả Sách)' : 'I. Thông Tin Độc Giả (Người Mượn)' }}
                </div>
                <div class="row g-2 small">
                  <div class="col-sm-6">
                    <span class="text-muted">Mã thẻ độc giả:</span>
                    <strong class="ms-1">{{ printData.docGia?.MaDocGia || printData.phieu?.MaDocGia }}</strong>
                  </div>
                  <div class="col-sm-6">
                    <span class="text-muted">Họ và tên:</span>
                    <strong class="ms-1 text-primary">{{ printData.docGia?.HoTen || '—' }}</strong>
                  </div>
                  <div class="col-sm-6">
                    <span class="text-muted">Số điện thoại:</span>
                    <span class="ms-1">{{ printData.docGia?.DienThoai || '—' }}</span>
                  </div>
                  <div class="col-sm-6">
                    <span class="text-muted">Địa chỉ:</span>
                    <span class="ms-1">{{ printData.docGia?.DiaChi || '—' }}</span>
                  </div>
                </div>
              </div>

              <!-- 2. Thông tin Tài liệu mượn / hoàn trả -->
              <div class="mb-3">
                <div class="fw-bold text-success border-bottom border-success pb-1 mb-2 small text-uppercase">
                  <i class="bi bi-book me-1"></i>
                  {{ (printModalType === 'tra' || printData.phieu?.TrangThai === 'DaTra') ? 'II. Thông Tin Tài Liệu / Sách Hoàn Trả' : 'II. Thông Tin Tài Liệu / Sách Mượn' }}
                </div>
                <div class="table-responsive">
                  <table class="table table-bordered table-sm align-middle mb-0" style="font-size: 0.85rem;">
                    <thead class="table-light text-center">
                      <tr>
                        <th style="width: 100px;">Mã Sách</th>
                        <th>Tên Tác Phẩm / Sách</th>
                        <th style="width: 150px;">Tác Giả</th>
                        <th style="width: 100px;">Năm XB</th>
                        <th style="width: 110px;">Đơn Giá</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td class="text-center font-monospace fw-bold">{{ printData.sach?.MaSach || printData.phieu?.MaSach }}</td>
                        <td class="fw-semibold text-dark">{{ printData.sach?.TenSach || '—' }}</td>
                        <td>{{ printData.sach?.TenTacGia || printData.sach?.TacGia || '—' }}</td>
                        <td class="text-center">{{ printData.sach?.NamXuatBan || '—' }}</td>
                        <td class="text-end fw-semibold">{{ formatCurrency(printData.sach?.DonGia) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- 3. Thời hạn & Cam kết mượn trả -->
              <div class="mb-3 p-3 bg-light rounded border">
                <div class="row g-2 small">
                  <div class="col-sm-4">
                    <span class="text-muted d-block">Ngày mượn sách:</span>
                    <strong class="fs-6 text-dark">{{ formatDate(printData.phieu?.NgayMuon) }}</strong>
                  </div>
                  <div class="col-sm-4">
                    <span class="text-muted d-block">Hạn chót trả sách:</span>
                    <strong class="fs-6 text-danger">{{ getDisplayHanTra(printData.phieu) }}</strong>
                    <small v-if="!printData.phieu?.HanTra && printData.phieu?.TrangThai === 'ChoDuyet'" class="text-muted d-block" style="font-size: 0.72rem;">
                      (Dự kiến 14 ngày)
                    </small>
                  </div>
                  <div class="col-sm-4">
                    <span class="text-muted d-block">Ngày trả thực tế:</span>
                    <strong class="fs-6 text-success">{{ printData.phieu?.NgayTra ? formatDate(printData.phieu?.NgayTra) : 'Chưa hoàn trả' }}</strong>
                  </div>
                  <div class="col-12 mt-2 pt-2 border-top">
                    <span class="text-muted">Ghi chú:</span>
                    <span class="ms-1 fst-italic">{{ printData.phieu?.GhiChu || ((printModalType === 'tra' || printData.phieu?.TrangThai === 'DaTra') ? 'Đã kiểm tra tài liệu nguyên vẹn, nhập kho thành công.' : 'Mượn sách đọc tại nhà theo quy định thư viện.') }}</span>
                  </div>
                </div>

                <!-- Bảng tính tiền phạt nếu là Phiếu Trả Sách -->
                <div
                  v-if="printModalType === 'tra' || printData.phieu?.TrangThai === 'DaTra'"
                  class="mt-3 p-3 rounded border"
                  :class="calculateLateDays(printData.phieu) > 0 ? 'bg-danger-subtle border-danger' : 'bg-success-subtle border-success'"
                >
                  <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="fw-bold fs-6">
                      <i class="bi" :class="calculateLateDays(printData.phieu) > 0 ? 'bi-exclamation-triangle-fill text-danger' : 'bi-check-circle-fill text-success'"></i>
                      Tình trạng hoàn trả:
                      <span :class="calculateLateDays(printData.phieu) > 0 ? 'text-danger' : 'text-success'">
                        {{ calculateLateDays(printData.phieu) > 0 ? `Trễ hạn ${calculateLateDays(printData.phieu)} ngày` : 'Trả sách đúng hạn (0 ngày trễ)' }}
                      </span>
                    </span>
                    <span class="fs-5 fw-bold" :class="calculateLateDays(printData.phieu) > 0 ? 'text-danger' : 'text-success'">
                      Tiền phạt: {{ formatCurrency(calculateFine(printData.phieu)) }}
                    </span>
                  </div>
                  <div class="small text-muted" style="font-size: 0.78rem;">
                    * Quy chế thư viện: Trễ hạn 1 ngày phạt 1.000 VNĐ, mức phạt tối đa 20.000 VNĐ / 1 cuốn sách.
                    <template v-if="calculateLateDays(printData.phieu) > 0">
                      <span class="d-block mt-1">
                        Chi tiết: <strong>{{ calculateLateDays(printData.phieu) }} ngày</strong> × 1.000 VNĐ = <strong>{{ formatCurrency(calculateLateDays(printData.phieu) * 1000) }}</strong>
                        <span v-if="calculateLateDays(printData.phieu) > 20" class="fw-bold text-danger ms-1">
                          (Áp dụng mức trần phạt tối đa 20.000 VNĐ)
                        </span>
                      </span>
                    </template>
                  </div>
                  <!-- Hiển thị tiền phạt hư hại nếu có -->
                  <div
                    v-if="printData.phieu?.TinhTrangSach && printData.phieu?.TinhTrangSach !== 'Không hư'"
                    class="mt-2 pt-2 border-top border-danger border-opacity-25 d-flex justify-content-between align-items-center small"
                  >
                    <span class="text-danger fw-semibold">
                      <i class="bi bi-tools me-1"></i>Hư hại tài liệu ({{ printData.phieu.TinhTrangSach }}):
                    </span>
                    <span class="text-danger fw-bold fs-6">
                      Phạt hư hại: {{ formatCurrency(printData.phieu.TienPhat || 0) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Quy định / Cam kết xác nhận -->
              <div class="small text-muted mb-4 fst-italic" style="font-size: 0.78rem;">
                <template v-if="printModalType === 'tra' || printData.phieu?.TrangThai === 'DaTra'">
                  * Xác nhận: Độc giả đã hoàn trả tài liệu nguyên vẹn vào kho sách và thanh toán đầy đủ tiền phạt quá hạn (nếu có). Biên lai này có giá trị xác nhận độc giả đã hoàn tất nghĩa vụ đối với thư viện.
                </template>
                <template v-else>
                  * Quy định: Độc giả có trách nhiệm bảo quản tài liệu nguyên vẹn, không viết vẽ, làm rách hoặc ẩm ướt sách. Hoàn trả sách đúng hoặc trước ngày hẹn trả. Mọi trường hợp trễ hạn sẽ bị phạt theo quy chế của thư viện.
                </template>
              </div>

              <!-- Chữ ký 2 bên -->
              <div class="row text-center mt-3 pt-2">
                <div class="col-6">
                  <div class="fw-bold small text-uppercase">
                    {{ (printModalType === 'tra' || printData.phieu?.TrangThai === 'DaTra') ? 'ĐỘC GIẢ (NGƯỜI TRẢ SÁCH)' : 'ĐỘC GIẢ (NGƯỜI MƯỢN)' }}
                  </div>
                  <div class="text-muted" style="font-size: 0.75rem;">(Ký và ghi rõ họ tên)</div>
                  <div style="height: 60px;"></div>
                  <div class="fw-semibold text-dark">{{ printData.docGia?.HoTen || '' }}</div>
                </div>
                <div class="col-6">
                  <div class="fw-bold small text-uppercase">
                    {{ (printModalType === 'tra' || printData.phieu?.TrangThai === 'DaTra') ? 'THỦ THƯ TIẾP NHẬN SÁCH' : 'THỦ THƯ PHỤ TRÁCH' }}
                  </div>
                  <div class="text-muted" style="font-size: 0.75rem;">(Ký và ghi rõ họ tên)</div>
                  <div style="height: 60px;"></div>
                  <div class="fw-semibold text-dark">
                    {{ printData.nhanVien?.HoTenNV || authStore.adminUser?.HoTenNV || 'Thủ thư thư viện' }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer bg-white d-flex justify-content-between align-items-center flex-wrap gap-2">
            <!-- Nhãn tên file PDF tự động tăng dần: phieu_muon_1, phieu_muon_2... -->
            <div class="d-flex align-items-center gap-2">
              <span class="badge bg-light text-dark border px-2 py-2" title="Tên file PDF xuất ra sẽ tự động tăng dần cho các lần tiếp theo">
                <i class="bi bi-file-earmark-pdf-fill text-danger me-1"></i>
                Tên file PDF: <strong class="text-danger">{{ nextPdfFileName }}.pdf</strong>
              </span>
              <button
                type="button"
                class="btn btn-sm btn-outline-secondary"
                @click="resetPdfCounter"
                title="Đặt lại số thứ tự về phieu_muon_1"
              >
                <i class="bi bi-arrow-counterclockwise"></i> Reset
              </button>
            </div>

            <!-- Các nút hành động -->
            <div class="d-flex gap-2">
              <button type="button" class="btn btn-light" @click="closePrintModal">
                <i class="bi bi-x-circle me-1"></i> Đóng
              </button>
              <!-- Nút tải trực tiếp file PDF -->
              <button
                type="button"
                class="btn btn-success fw-semibold"
                @click="exportPdfDirect"
                :disabled="isExportingPdf"
                title="Tải trực tiếp file PDF về máy tính"
              >
                <span v-if="isExportingPdf" class="spinner-border spinner-border-sm me-1"></span>
                <i v-else class="bi bi-printer-fill me-1"></i>
                In phiếu mượn
              </button>
              <!-- Nút mở hộp thoại In của trình duyệt (cũng tự động đặt tên phieu_muon_X)
              <button
                type="button"
                class="btn btn-success fw-semibold"
                @click="printSlip"
                title="Mở hộp thoại in (hoặc Lưu PDF qua trình duyệt)"
              >
                <i class="bi bi-printer-fill me-1"></i> In Phiếu
              </button> -->
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Xác Nhận Trả Sách & Đánh Giá Tình Trạng Sách -->
    <div v-if="showReturnModal" class="modal-backdrop fade show"></div>
    <div v-if="showReturnModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow rounded-4 overflow-hidden">
          <div class="modal-header bg-success text-white py-3">
            <div class="d-flex align-items-center gap-2">
              <i class="bi bi-arrow-return-left fs-4"></i>
              <div>
                <h5 class="modal-title fw-bold mb-0 text-white">Xác Nhận Trả Sách</h5>
                <small class="text-white-50">Đánh giá tình trạng tài liệu và tính tiền phạt hư hại</small>
              </div>
            </div>
            <button type="button" class="btn-close btn-close-white" @click="closeReturnModal"></button>
          </div>

          <form @submit.prevent="submitReturnBook">
            <div class="modal-body p-4">
              <!-- Thông tin sách & độc giả -->
              <div class="p-3 bg-light rounded-3 mb-3 border">
                <div class="row g-2 small">
                  <div class="col-6">
                    <span class="text-muted d-block">Mã độc giả:</span>
                    <strong class="text-dark">{{ returnTargetPhieu?.MaDocGia }}</strong>
                  </div>
                  <div class="col-6">
                    <span class="text-muted d-block">Mã sách:</span>
                    <strong class="text-success">{{ returnTargetPhieu?.MaSach }}</strong>
                  </div>
                  <div class="col-12" v-if="returnTargetPhieu?.TenSach">
                    <span class="text-muted d-block">Tên sách:</span>
                    <strong class="text-dark">{{ returnTargetPhieu?.TenSach }}</strong>
                  </div>
                  <div class="col-12">
                    <span class="text-muted d-block">Đơn giá sách:</span>
                    <strong class="text-danger">{{ formatCurrency(returnTargetPhieu?.DonGia || 0) }}</strong>
                  </div>
                </div>
              </div>

              <!-- Lựa chọn tình trạng sách -->
              <div class="mb-3">
                <label class="form-label fw-bold text-dark">
                  <i class="bi bi-shield-check text-success me-1"></i>
                  Tình trạng sách khi trả <span class="text-danger">*</span>
                </label>
                <div class="d-flex flex-column gap-2">
                  <div
                    v-for="opt in tinhTrangOptions"
                    :key="opt.label"
                    class="form-check p-2 border rounded-3 transition-all"
                    :class="{ 'border-success bg-success bg-opacity-10': returnTinhTrang === opt.label }"
                  >
                    <input
                      class="form-check-input ms-1"
                      type="radio"
                      :id="`opt-${opt.label}`"
                      :value="opt.label"
                      v-model="returnTinhTrang"
                      name="tinhTrangRadio"
                    />
                    <label class="form-check-label ms-2 d-flex justify-content-between align-items-center w-100 cursor-pointer" :for="`opt-${opt.label}`">
                      <span class="fw-semibold text-dark">{{ opt.label }}</span>
                      <span class="badge" :class="opt.rate === 0 ? 'bg-success' : 'bg-danger'">
                        Phạt: {{ opt.rate * 100 }}%
                      </span>
                    </label>
                    <div class="small text-muted ms-4 ps-1 mt-1">
                      {{ opt.desc }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Thẻ tổng kết kết quả xử lý -->
              <div class="alert mb-3 rounded-3" :class="returnTinhTrang === 'Không hư' ? 'alert-success border-success' : 'alert-danger border-danger'">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <span class="fw-semibold">Tiền phạt hư hại:</span>
                  <strong class="fs-5" :class="returnTinhTrang === 'Không hư' ? 'text-success' : 'text-danger'">
                    {{ formatCurrency(calculatedDamageFine) }}
                  </strong>
                </div>
                <div class="small">
                  <strong>Quy tắc cập nhật kho:</strong>
                  <span v-if="returnTinhTrang === 'Không hư'" class="text-success ms-1">
                    <i class="bi bi-plus-circle me-1"></i>Sách nguyên vẹn, số lượng tồn kho sẽ <strong>+1</strong> quyển.
                  </span>
                  <span v-else class="text-danger ms-1">
                    <i class="bi bi-x-circle me-1"></i>Sách bị hư hại, <strong>KHÔNG</strong> cộng lại số lượng vào kho.
                  </span>
                </div>
              </div>

              <!-- Ô ghi chú bổ sung -->
              <div class="mb-2">
                <label class="form-label small fw-semibold text-muted">Ghi chú (nếu có chi tiết hư hại):</label>
                <textarea
                  v-model="returnGhiChu"
                  class="form-control form-control-sm"
                  rows="2"
                  placeholder="Ví dụ: Rách bìa sau, mất trang 15..."
                ></textarea>
              </div>
            </div>

            <div class="modal-footer bg-light border-0 py-3 d-flex justify-content-between">
              <button type="button" class="btn btn-secondary btn-sm" @click="closeReturnModal" :disabled="isSubmittingReturn">
                Hủy
              </button>
              <button type="submit" class="btn btn-success btn-sm px-3 fw-bold" :disabled="isSubmittingReturn">
                <span v-if="isSubmittingReturn" class="spinner-border spinner-border-sm me-1"></span>
                <i v-else class="bi bi-check2-circle me-1"></i>
                Hoàn Tất Trả Sách
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { muonTraService } from '@/shared/services/adminServices'
import { useAdminAuthStore } from '../stores/auth'
import { useToastStore } from '@/shared/stores/toast'
import { useConfirmStore } from '@/shared/stores/confirm'

const authStore = useAdminAuthStore()
const toast = useToastStore()
const confirmStore = useConfirmStore()

const allPhieus = ref([])
const currentTab = ref('ChoDuyet')
const searchKeyword = ref('')
const printModalType = ref('muon') // 'muon' hoặc 'tra'

// State In Phiếu Mượn / Trả
const showPrintModal = ref(false)
const printData = ref({
  phieu: null,
  docGia: null,
  sach: null,
  nhanVien: null
})

// State Xác Nhận Trả Sách & Đánh Giá Tình Trạng
const showReturnModal = ref(false)
const returnTargetPhieu = ref(null)
const returnTinhTrang = ref('Không hư')
const returnGhiChu = ref('')
const isSubmittingReturn = ref(false)

const tinhTrangOptions = [
  { label: 'Không hư', rate: 0, desc: 'Sách nguyên vẹn, nhập trả 1 quyển vào kho sách.' },
  { label: 'Hư dưới 25%', rate: 0.25, desc: 'Hư hỏng nhẹ (rách nhẹ, quăn góc). Phạt 25% giá bìa, không cộng kho.' },
  { label: 'Hư dưới 50%', rate: 0.50, desc: 'Hư hỏng trung bình (bong gáy, bẩn nhiều trang). Phạt 50% giá bìa, không cộng kho.' },
  { label: 'Hư dưới 75%', rate: 0.75, desc: 'Hư hỏng nặng (rách nát, mất một số trang). Phạt 75% giá bìa, không cộng kho.' },
  { label: 'Hư trên 75%', rate: 1.00, desc: 'Hư hỏng hoàn toàn hoặc mất sách. Phạt 100% giá bìa, không cộng kho.' },
]

const calculatedDamageFine = computed(() => {
  if (!returnTargetPhieu.value) return 0
  const donGia = returnTargetPhieu.value.DonGia || 0
  const opt = tinhTrangOptions.find(o => o.label === returnTinhTrang.value)
  const rate = opt ? opt.rate : 0
  return Math.round(donGia * rate)
})

const counts = computed(() => {
  return {
    ChoDuyet: allPhieus.value.filter(p => p.TrangThai === 'ChoDuyet').length,
    DangMuon: allPhieus.value.filter(p => p.TrangThai === 'DangMuon' && !isOverdue(p)).length,
    QuaHan: allPhieus.value.filter(p => isOverdue(p)).length,
    TuChoi: allPhieus.value.filter(p => ['TuChoi', 'DaHuy'].includes(p.TrangThai)).length
  }
})

const filteredPhieus = computed(() => {
  // 1. Phân loại theo Tab
  const sortAsc = (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  const sortDesc = (a, b) => new Date(b.createdAt) - new Date(a.createdAt)

  let list = []
  if (currentTab.value === 'ChoDuyet') {
    list = allPhieus.value.filter(p => p.TrangThai === 'ChoDuyet').sort(sortAsc)
  } else if (currentTab.value === 'DangMuon') {
    list = allPhieus.value.filter(p => p.TrangThai === 'DangMuon' && !isOverdue(p)).sort(sortAsc)
  } else if (currentTab.value === 'QuaHan') {
    list = allPhieus.value.filter(p => isOverdue(p)).sort(sortAsc)
  } else if (currentTab.value === 'TuChoi') {
    list = allPhieus.value.filter(p => ['TuChoi', 'DaHuy'].includes(p.TrangThai)).sort(sortDesc)
  } else {
    // Tab Lịch sử Toàn Bộ
    list = [...allPhieus.value].sort(sortDesc)
  }

  // 2. Tìm kiếm đa năng cho tất cả các mục
  const kw = searchKeyword.value.trim().toLowerCase()
  if (!kw) return list

  return list.filter(p => {
    const maDocGia = (p.MaDocGia || '').toLowerCase()
    const maSach = (p.MaSach || '').toLowerCase()
    const ghiChu = (p.GhiChu || '').toLowerCase()
    const trangThai = (p.TrangThai || '').toLowerCase()
    const ngayMuon = formatDate(p.NgayMuon).toLowerCase()
    const hanTra = formatDate(p.HanTra).toLowerCase()
    const ngayTra = p.NgayTra ? formatDate(p.NgayTra).toLowerCase() : ''
    return maDocGia.includes(kw) ||
      maSach.includes(kw) ||
      ghiChu.includes(kw) ||
      trangThai.includes(kw) ||
      ngayMuon.includes(kw) ||
      hanTra.includes(kw) ||
      ngayTra.includes(kw)
  })
})

function isOverdue(p) {
  if (!p) return false
  if (p.TrangThai === 'QuaHan') return true
  if (p.TrangThai === 'DangMuon' && p.HanTra) {
    return new Date(p.HanTra) < new Date()
  }
  return false
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('vi-VN')
}

function getDisplayHanTra(p) {
  if (!p) return '—'
  if (p.HanTra) return formatDate(p.HanTra)
  if (p.NgayMuon) {
    const d = new Date(p.NgayMuon)
    d.setDate(d.getDate() + 14) // Hạn trả mặc định 14 ngày
    return formatDate(d)
  }
  return '—'
}

// Tính số ngày trễ hạn
function calculateLateDays(phieu) {
  if (!phieu) return 0
  const hanTraStr = phieu.HanTra || phieu.NgayMuon
  const ngayTraStr = phieu.NgayTra
  if (!hanTraStr || !ngayTraStr) return 0

  const hanTra = new Date(hanTraStr)
  const ngayTra = new Date(ngayTraStr)

  const dHan = new Date(hanTra.getFullYear(), hanTra.getMonth(), hanTra.getDate())
  const dTra = new Date(ngayTra.getFullYear(), ngayTra.getMonth(), ngayTra.getDate())

  const diffTime = dTra.getTime() - dHan.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? diffDays : 0
}

// Tính tiền phạt trễ hạn: cứ trễ 1 ngày phạt 1.000 VNĐ, tối đa 20.000 VNĐ
function calculateFine(phieu) {
  const lateDays = calculateLateDays(phieu)
  if (lateDays <= 0) return 0
  const finePerDay = 1000
  const maxFine = 20000
  return Math.min(maxFine, lateDays * finePerDay)
}

function formatDateTime(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatCurrency(val) {
  if (!val && val !== 0) return '—'
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)
}

function getStatusBadgeClass(st) {
  switch (st) {
    case 'DangMuon': return 'badge bg-primary'
    case 'ChoDuyet': return 'badge bg-warning text-dark'
    case 'DaTra': return 'badge bg-success'
    case 'QuaHan': return 'badge bg-danger'
    case 'TuChoi': return 'badge bg-secondary'
    case 'DaHuy': return 'badge bg-secondary text-white'
    default: return 'badge bg-light text-dark'
  }
}

async function fetchPhieuMuon() {
  try {
    const res = await muonTraService.getAll({ limit: 200 })
    if (res.success) allPhieus.value = res.data
  } catch (err) {
    toast.error(err.message)
  }
}

async function handleDuyet(id) {
  const ok = await confirmStore.ask({
    title: 'Phê duyệt mượn sách',
    message: 'Xác nhận phê duyệt phiếu mượn này? Số lượng sách trong kho sẽ tự động trừ đi 1.',
    type: 'success',
    confirmText: 'Phê duyệt'
  })
  if (!ok) return
  try {
    const res = await muonTraService.duyet(id)
    toast.success(res.message || 'Phê duyệt mượn sách thành công! Kho đã trừ 1 sách.')
    fetchPhieuMuon()
  } catch (err) {
    toast.error(err.message)
  }
}

async function handleTuChoi(id) {
  const lyDo = await confirmStore.prompt({
    title: 'Từ chối mượn sách',
    message: 'Nhập lý do từ chối yêu cầu mượn sách:',
    inputPlaceholder: 'Lý do từ chối...',
    type: 'warning',
    confirmText: 'Từ chối'
  })
  if (lyDo === null) return
  try {
    const res = await muonTraService.tuChoi(id, { LyDo: lyDo })
    toast.warning(res.message || 'Đã từ chối phiếu mượn.')
    fetchPhieuMuon()
  } catch (err) {
    toast.error(err.message)
  }
}

function handleOpenReturnModal(phieu) {
  returnTargetPhieu.value = phieu
  returnTinhTrang.value = 'Không hư'
  returnGhiChu.value = phieu.GhiChu || ''
  showReturnModal.value = true
}

function closeReturnModal() {
  showReturnModal.value = false
  returnTargetPhieu.value = null
}

async function submitReturnBook() {
  if (!returnTargetPhieu.value) return
  isSubmittingReturn.value = true
  try {
    const payload = {
      TinhTrangSach: returnTinhTrang.value,
      GhiChu: returnGhiChu.value
    }
    const res = await muonTraService.xacNhanTra(returnTargetPhieu.value._id, payload)
    toast.success(res.message || 'Xác nhận trả sách thành công!')
    closeReturnModal()
    fetchPhieuMuon()
  } catch (err) {
    toast.error(err.message)
  } finally {
    isSubmittingReturn.value = false
  }
}

// ============================================================
// CHỨC NĂNG IN PHIẾU MƯỢN / TRẢ SÁCH & BIÊN LAI TIỀN PHẠT
// ============================================================

async function handleOpenPrintModal(phieuItem, type = null) {
  printModalType.value = type || (phieuItem.TrangThai === 'DaTra' ? 'tra' : 'muon')
  try {
    // Gọi API lấy đầy đủ chi tiết bao gồm thông tin Độc Giả, Sách và Nhân Viên
    const res = await muonTraService.getById(phieuItem._id)
    if (res.success && res.data) {
      printData.value = res.data
    } else {
      printData.value = {
        phieu: phieuItem,
        docGia: { MaDocGia: phieuItem.MaDocGia },
        sach: { MaSach: phieuItem.MaSach },
        nhanVien: null
      }
    }
  } catch (e) {
    // Dự phòng nếu API chi tiết có vấn đề, vẫn hiển thị thông tin cơ bản
    printData.value = {
      phieu: phieuItem,
      docGia: { MaDocGia: phieuItem.MaDocGia },
      sach: { MaSach: phieuItem.MaSach },
      nhanVien: null
    }
  }
  showPrintModal.value = true
}

function closePrintModal() {
  showPrintModal.value = false
}

// Quản lý số thứ tự xuất file PDF tự động tăng dần:
// Cho phiếu mượn: phieu_muon_1, phieu_muon_2,...
// Cho phiếu trả: phieu_tra_1, phieu_tra_2,...
const returnPdfCounter = ref(parseInt(localStorage.getItem('phieu_tra_pdf_counter') || '1', 10))
const borrowPdfCounter = ref(parseInt(localStorage.getItem('phieu_muon_pdf_counter') || '1', 10))
const isExportingPdf = ref(false)

const nextPdfFileName = computed(() => {
  if (printModalType.value === 'tra' || printData.value.phieu?.TrangThai === 'DaTra') {
    return `phieu_tra_${returnPdfCounter.value}`
  }
  return `phieu_muon_${borrowPdfCounter.value}`
})

function getAndIncrementCounter() {
  const isTra = printModalType.value === 'tra' || printData.value.phieu?.TrangThai === 'DaTra'
  if (isTra) {
    const current = returnPdfCounter.value
    const next = current + 1
    returnPdfCounter.value = next
    localStorage.setItem('phieu_tra_pdf_counter', next.toString())
    return `phieu_tra_${current}`
  } else {
    const current = borrowPdfCounter.value
    const next = current + 1
    borrowPdfCounter.value = next
    localStorage.setItem('phieu_muon_pdf_counter', next.toString())
    return `phieu_muon_${current}`
  }
}

function resetPdfCounter() {
  const isTra = printModalType.value === 'tra' || printData.value.phieu?.TrangThai === 'DaTra'
  if (isTra) {
    returnPdfCounter.value = 1
    localStorage.setItem('phieu_tra_pdf_counter', '1')
    toast.info('Đã đặt lại tên file Phiếu Trả bắt đầu từ phieu_tra_1')
  } else {
    borrowPdfCounter.value = 1
    localStorage.setItem('phieu_muon_pdf_counter', '1')
    toast.info('Đã đặt lại tên file Phiếu Mượn bắt đầu từ phieu_muon_1')
  }
}

// 1. Tải trực tiếp file PDF về máy tính bằng thư viện html2pdf
async function exportPdfDirect() {
  const element = document.getElementById('print-area')
  if (!element) return

  const fileName = getAndIncrementCounter()
  isExportingPdf.value = true

  try {
    const html2pdfModule = await import('html2pdf.js')
    const html2pdf = html2pdfModule.default || html2pdfModule
    const opt = {
      margin: [8, 8, 8, 8],
      filename: `${fileName}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }
    await html2pdf().set(opt).from(element).save()
    toast.success(`Đã xuất file ${fileName}.pdf thành công!`)
  } catch (err) {
    console.error('Lỗi xuất PDF:', err)
    toast.error('Có lỗi khi tạo PDF trực tiếp. Đang chuyển sang hộp thoại in hệ thống...')
    printSlip()
  } finally {
    isExportingPdf.value = false
  }
}

// 2. Mở hộp thoại In của trình duyệt (cũng tự động đặt tên file là phieu_muon_X hoặc phieu_tra_X)
function printSlip() {
  const fileName = getAndIncrementCounter()
  const originalTitle = document.title
  document.title = fileName

  const handleAfterPrint = () => {
    document.title = originalTitle
    window.removeEventListener('afterprint', handleAfterPrint)
  }
  window.addEventListener('afterprint', handleAfterPrint)

  window.print()

  // Fallback khôi phục lại document.title
  setTimeout(() => {
    document.title = originalTitle
  }, 2000)
}

onMounted(() => {
  fetchPhieuMuon()
})
</script>

<style scoped>
.nav-pills .nav-link {
  color: #495057;
  border-radius: 6px;
  padding: 0.5rem 1rem;
}
.nav-pills .nav-link.active {
  background-color: #198754;
  color: #fff;
}

.print-paper {
  max-width: 720px;
  background-color: #ffffff;
  color: #212529;
}

/* ============================================================
 * CSS KHI IN ẤN (PRINT MEDIA QUERY)
 * Chỉ hiển thị đúng vùng #print-area, ẩn toàn bộ UI xung quanh
 * ============================================================ */
@media print {
  body * {
    visibility: hidden;
  }

  #print-area, #print-area * {
    visibility: visible;
  }

  #print-area {
    position: absolute;
    left: 0;
    top: 0;
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 20px !important;
    box-shadow: none !important;
    border: none !important;
  }

  /* Ẩn thanh header/footer modal, backdrop */
  .modal-backdrop,
  .modal-header,
  .modal-footer,
  .btn,
  .admin-sidebar,
  .navbar {
    display: none !important;
  }
}
</style>
