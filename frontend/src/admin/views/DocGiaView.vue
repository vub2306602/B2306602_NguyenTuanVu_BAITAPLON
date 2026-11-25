<template>
  <div>
    <!-- Header & Thanh Tìm Kiếm -->
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <h3 class="fw-bold text-success mb-1">Quản Lý Độc Giả</h3>
        <p class="text-muted mb-0">Danh sách tài khoản bạn đọc, phân quyền trạng thái và cấp lại mật khẩu</p>
      </div>

      <!-- Ô tìm kiếm độc giả -->
      <div class="d-flex align-items-center gap-2">
        <div class="input-group" style="width: 320px;">
          <span class="input-group-text bg-white"><i class="bi bi-search text-muted"></i></span>
          <input
            v-model="keyword"
            @input="handleSearch"
            type="text"
            class="form-control"
            placeholder="Tìm tên, SĐT, mã độc giả, địa chỉ..."
          />
          <button
            v-if="keyword"
            class="btn btn-outline-secondary"
            type="button"
            @click="clearSearch"
            title="Xóa tìm kiếm"
          >
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Bảng danh sách độc giả -->
    <div class="card border-0 shadow-sm p-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <span class="text-muted small">
          Tổng số độc giả: <strong class="text-dark">{{ docGias.length }}</strong>
          <span v-if="keyword" class="ms-1">(Lọc theo từ khóa: "<span class="text-success fw-semibold">{{ keyword }}</span>")</span>
        </span>
      </div>

      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Mã Độc Giả</th>
              <th>Họ Và Tên</th>
              <th>Phái</th>
              <th>Số Điện Thoại</th>
              <th>Địa Chỉ</th>
              <th>Trạng Thái</th>
              <th class="text-end" style="min-width: 280px;">Hành Động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="dg in docGias" :key="dg._id" :class="{ 'table-secondary opacity-75': dg.TrangThai === 'BiKhoa' }">
              <td class="fw-bold text-success">{{ dg.MaDocGia }}</td>
              <td class="fw-semibold text-dark">{{ dg.HoLot }} {{ dg.Ten }}</td>
              <td><span class="badge bg-light text-dark border">{{ dg.Phai }}</span></td>
              <td><i class="bi bi-telephone text-muted me-1"></i>{{ dg.DienThoai }}</td>
              <td class="text-muted small">{{ dg.DiaChi }}</td>
              <td>
                <span
                  class="badge"
                  :class="dg.TrangThai === 'BiKhoa' ? 'bg-danger' : 'bg-success'"
                >
                  <i class="bi me-1" :class="dg.TrangThai === 'BiKhoa' ? 'bi-lock-fill' : 'bi-check-circle-fill'"></i>
                  {{ dg.TrangThai === 'BiKhoa' ? 'Đã khóa' : 'Hoạt động' }}
                </span>
              </td>
              <td class="text-end">
                <!-- Nút Lịch Sử Mượn -->
                <button
                  class="btn btn-sm btn-outline-info me-1"
                  @click="viewHistory(dg)"
                  title="Xem lịch sử mượn trả"
                >
                  <i class="bi bi-clock-history"></i> Lịch Sử
                </button>

                <!-- Nút Cấp Lại Mật Khẩu -->
                <button
                  class="btn btn-sm btn-outline-warning me-1 text-dark fw-semibold"
                  @click="openResetPasswordModal(dg)"
                  title="Cấp lại mật khẩu mới cho độc giả"
                >
                  <i class="bi bi-key-fill text-warning"></i> Cấp Lại MK
                </button>

                <!-- Nút Khóa / Mở Khóa Tài Khoản -->
                <button
                  class="btn btn-sm me-1"
                  :class="dg.TrangThai === 'BiKhoa' ? 'btn-outline-success fw-semibold' : 'btn-outline-secondary'"
                  @click="handleToggleKhoa(dg)"
                  :title="dg.TrangThai === 'BiKhoa' ? 'Mở khóa tài khoản độc giả' : 'Khóa tài khoản độc giả'"
                >
                  <i :class="dg.TrangThai === 'BiKhoa' ? 'bi bi-unlock-fill' : 'bi bi-lock-fill'"></i>
                  {{ dg.TrangThai === 'BiKhoa' ? 'Mở Khóa' : 'Khóa' }}
                </button>

                <!-- Nút Xóa Độc Giả -->
                <button
                  class="btn btn-sm btn-outline-danger"
                  @click="handleDelete(dg._id)"
                  title="Xóa hồ sơ độc giả"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </td>
            </tr>
            <tr v-if="docGias.length === 0">
              <td colspan="7" class="text-center text-muted py-4">
                <i class="bi bi-inbox fs-2 d-block mb-1 text-secondary"></i>
                Chưa tìm thấy độc giả nào phù hợp.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Cấp Lại Mật Khẩu Cho Độc Giả -->
    <div v-if="showResetModal" class="modal-backdrop fade show"></div>
    <div v-if="showResetModal" class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-warning text-dark">
            <h5 class="modal-title fw-bold">
              <i class="bi bi-key-fill me-2"></i>Cấp Lại Mật Khẩu Độc Giả
            </h5>
            <button type="button" class="btn-close" @click="closeResetModal"></button>
          </div>
          <div class="modal-body p-4">
            <div class="alert alert-light border mb-3">
              <div class="small text-muted">Độc giả nhận mật khẩu:</div>
              <div class="fw-bold fs-6 text-dark">{{ targetDocGia?.HoLot }} {{ targetDocGia?.Ten }}</div>
              <div class="small text-secondary mt-1">
                <span>Mã thẻ: <strong>{{ targetDocGia?.MaDocGia }}</strong></span> · 
                <span>SĐT đăng nhập: <strong>{{ targetDocGia?.DienThoai }}</strong></span>
              </div>
            </div>

            <form @submit.prevent="submitResetPassword">
              <div class="mb-3">
                <label class="form-label fw-semibold">Mật khẩu mới <span class="text-danger">*</span></label>
                <div class="input-group">
                  <input
                    :type="showPassword ? 'text' : 'password'"
                    v-model="newPassword"
                    class="form-control"
                    placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)..."
                    required
                  />
                  <button
                    type="button"
                    class="btn btn-outline-secondary"
                    @click="showPassword = !showPassword"
                    title="Ẩn / hiện mật khẩu"
                  >
                    <i class="bi" :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                  </button>
                </div>
                <div class="form-text d-flex justify-content-between align-items-center mt-1">
                  <span>Mật khẩu phải có ít nhất 6 ký tự.</span>
                  <button
                    type="button"
                    class="btn btn-link btn-sm p-0 text-decoration-none"
                    @click="generateRandomPassword"
                  >
                    <i class="bi bi-dice-5 me-1"></i>Tạo mật khẩu ngẫu nhiên
                  </button>
                </div>
              </div>

              <div class="d-flex justify-content-end gap-2 pt-2">
                <button type="button" class="btn btn-light" @click="closeResetModal">Hủy</button>
                <button type="submit" class="btn btn-warning fw-semibold text-dark" :disabled="isSubmitting">
                  <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-1"></span>
                  <i v-else class="bi bi-check2-circle me-1"></i>
                  Lưu Mật Khẩu Mới
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Xem Lịch Sử Mượn Của Độc Giả -->
    <div v-if="showHistoryModal" class="modal-backdrop fade show"></div>
    <div v-if="showHistoryModal" class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-success text-white">
            <h5 class="modal-title fw-bold">
              <i class="bi bi-clock-history me-2"></i>Lịch Sử Mượn Sách: {{ selectedDocGia?.HoLot }} {{ selectedDocGia?.Ten }} ({{ selectedDocGia?.MaDocGia }})
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="showHistoryModal = false"></button>
          </div>
          <div class="modal-body p-4">
            <div class="table-responsive">
              <table class="table table-sm table-bordered align-middle mb-0">
                <thead class="table-light text-center">
                  <tr>
                    <th>Mã Sách</th>
                    <th>Ngày Mượn</th>
                    <th>Hạn Trả</th>
                    <th>Ngày Trả</th>
                    <th>Trạng Thái</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="phieu in historyList" :key="phieu._id">
                    <td class="fw-bold text-center font-monospace">{{ phieu.MaSach }}</td>
                    <td class="text-center">{{ formatDate(phieu.NgayMuon) }}</td>
                    <td class="text-center">{{ formatDate(phieu.HanTra) }}</td>
                    <td class="text-center">{{ phieu.NgayTra ? formatDate(phieu.NgayTra) : '—' }}</td>
                    <td class="text-center">
                      <span :class="getStatusBadge(phieu.TrangThai)">{{ phieu.TrangThai }}</span>
                    </td>
                  </tr>
                  <tr v-if="historyList.length === 0">
                    <td colspan="5" class="text-center text-muted py-4">Độc giả này chưa có lịch sử mượn sách nào.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="modal-footer bg-light">
            <button type="button" class="btn btn-secondary" @click="showHistoryModal = false">
              <i class="bi bi-x-circle me-1"></i> Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { docGiaService, muonTraService } from '@/shared/services/adminServices'
import { useConfirmStore } from '@/shared/stores/confirm'
import { useToastStore } from '@/shared/stores/toast'

const confirmStore = useConfirmStore()
const toast = useToastStore()

const docGias = ref([])
const keyword = ref('')
let searchTimer = null

// Modal Lịch sử
const showHistoryModal = ref(false)
const selectedDocGia = ref(null)
const historyList = ref([])

// Modal Cấp lại mật khẩu
const showResetModal = ref(false)
const targetDocGia = ref(null)
const newPassword = ref('')
const showPassword = ref(false)
const isSubmitting = ref(false)

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('vi-VN')
}

function getStatusBadge(st) {
  switch (st) {
    case 'DangMuon': return 'badge bg-primary'
    case 'ChoDuyet': return 'badge bg-warning text-dark'
    case 'DaTra': return 'badge bg-success'
    case 'QuaHan': return 'badge bg-danger'
    case 'TuChoi': return 'badge bg-secondary'
    default: return 'badge bg-light text-dark'
  }
}

async function fetchDocGia() {
  try {
    const res = await docGiaService.getAll({ keyword: keyword.value, limit: 100 })
    if (res.success) docGias.value = res.data
  } catch (err) {
    console.error(err)
  }
}

function handleSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    fetchDocGia()
  }, 300)
}

function clearSearch() {
  keyword.value = ''
  fetchDocGia()
}

async function viewHistory(dg) {
  selectedDocGia.value = dg
  try {
    const res = await muonTraService.getAll({ keyword: dg.MaDocGia, limit: 50 })
    if (res.success) historyList.value = res.data
    showHistoryModal.value = true
  } catch (err) {
    toast.error(err.message)
  }
}

// ============================================================
// CHỨC NĂNG KHÓA / MỞ KHÓA TÀI KHOẢN ĐỘC GIẢ
// ============================================================
async function handleToggleKhoa(dg) {
  const isCurrentlyLocked = dg.TrangThai === 'BiKhoa'
  const actionText = isCurrentlyLocked ? 'MỞ KHÓA' : 'KHÓA'
  const confirmMsg = isCurrentlyLocked
    ? `Xác nhận MỞ KHÓA tài khoản cho độc giả '${dg.HoLot} ${dg.Ten}' (${dg.MaDocGia})? Độc giả sẽ có thể đăng nhập và mượn sách trở lại.`
    : `Bạn có chắc chắn muốn KHÓA tài khoản độc giả '${dg.HoLot} ${dg.Ten}' (${dg.MaDocGia})? Khi bị khóa, độc giả sẽ không thể đăng nhập hoặc mượn sách.`

  const ok = await confirmStore.ask({
    title: `${actionText} tài khoản độc giả`,
    message: confirmMsg,
    type: isCurrentlyLocked ? 'primary' : 'warning',
    confirmText: isCurrentlyLocked ? 'Mở khóa ngay' : 'Khóa tài khoản'
  })
  if (!ok) return

  try {
    const res = await docGiaService.toggleKhoa(dg._id)
    toast.success(res.message || `Đã ${actionText.toLowerCase()} tài khoản độc giả thành công!`)
    fetchDocGia()
  } catch (err) {
    toast.error(err.message)
  }
}

// ============================================================
// CHỨC NĂNG CẤP LẠI MẬT KHẨU CHO ĐỘC GIẢ
// ============================================================
function openResetPasswordModal(dg) {
  targetDocGia.value = dg
  newPassword.value = ''
  showPassword.value = false
  showResetModal.value = true
}

function closeResetModal() {
  showResetModal.value = false
  targetDocGia.value = null
  newPassword.value = ''
}

function generateRandomPassword() {
  // Tạo mật khẩu ngẫu nhiên 8 ký tự dễ đọc: e.g. docgia + số ngẫu nhiên
  const randomNum = Math.floor(1000 + Math.random() * 9000)
  newPassword.value = `docgia${randomNum}`
  showPassword.value = true
}

async function submitResetPassword() {
  if (!newPassword.value || newPassword.value.trim().length < 6) {
    toast.warning('Mật khẩu mới phải có ít nhất 6 ký tự.')
    return
  }

  isSubmitting.value = true
  try {
    const res = await docGiaService.resetPassword(targetDocGia.value._id, {
      Password: newPassword.value.trim()
    })
    toast.success(res.message || 'Cấp lại mật khẩu mới cho độc giả thành công!')
    closeResetModal()
  } catch (err) {
    toast.error(err.message)
  } finally {
    isSubmitting.value = false
  }
}

// ============================================================
// CHỨC NĂNG XÓA ĐỘC GIẢ
// ============================================================
async function handleDelete(id) {
  const ok = await confirmStore.ask({
    title: 'Xóa độc giả',
    message: 'Bạn có chắc chắn muốn xóa hồ sơ độc giả này? Quy định: Nếu độc giả đang có sách mượn thì không thể xóa; nếu không còn mượn sách, toàn bộ thông tin cùng lịch sử mượn trả sẽ bị xóa vĩnh viễn.',
    type: 'danger',
    confirmText: 'Xóa độc giả'
  })
  if (!ok) return
  try {
    const res = await docGiaService.delete(id)
    toast.success(res.message || 'Đã xóa thông tin độc giả thành công!')
    fetchDocGia()
  } catch (err) {
    toast.error(err.message || 'Không thể xóa độc giả này.')
  }
}

onMounted(() => {
  fetchDocGia()
})
</script>
