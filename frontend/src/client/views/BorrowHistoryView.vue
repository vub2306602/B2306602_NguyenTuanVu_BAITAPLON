<template>
  <div>
    <!-- Tiêu đề -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 class="fw-bold text-dark mb-1">Lịch Sử Mượn Sách Của Tôi</h3>
        <p class="text-muted mb-0">Theo dõi trạng thái các phiếu đặt mượn và hạn hẹn trả</p>
      </div>
      <button class="btn btn-outline-dark btn-sm" @click="fetchHistory">
        <i class="bi bi-arrow-clockwise"></i> Cập nhật
      </button>
    </div>

    <!-- Cảnh báo quá hạn > 20 ngày (Khóa tài khoản) -->
    <div v-if="hasOverdueOver20" class="alert alert-danger d-flex align-items-center mb-4 shadow-sm border-danger">
      <i class="bi bi-shield-lock-fill fs-2 text-danger me-3 flex-shrink-0"></i>
      <div>
        <h5 class="alert-heading fw-bold mb-1">Tài khoản của bạn đã bị khóa tự động!</h5>
        <p class="mb-0 small">
          Bạn đang có sách mượn quá hạn <strong>{{ maxOverdueDays }} ngày</strong> (vượt quá hạn mức 20 ngày).
          Hệ thống đã tự động khóa tài khoản độc giả của bạn. Vui lòng mang sách đến thư viện hoàn trả cho thủ thư để giải quyết và mở lại tài khoản.
        </p>
      </div>
    </div>

    <!-- Nhắc nhở quá hạn <= 20 ngày -->
    <div v-else-if="hasOverdueUnder20" class="alert alert-warning d-flex align-items-center mb-4 shadow-sm border-warning">
      <i class="bi bi-exclamation-triangle-fill fs-2 text-warning me-3 flex-shrink-0"></i>
      <div>
        <h5 class="alert-heading fw-bold mb-1">Nhắc nhở: Bạn đang có sách mượn quá hạn!</h5>
        <p class="mb-0 small">
          Số ngày quá hạn cao nhất hiện tại là <strong>{{ maxOverdueDays }} ngày</strong> (tiền phạt dự kiến: <strong>{{ (Math.min(maxOverdueDays * 1000, 20000)).toLocaleString('vi-VN') }}đ</strong>).
          <br />
          <span class="text-danger fw-semibold">Lưu ý quan trọng: Nếu quá hạn vượt quá 20 ngày, tài khoản độc giả sẽ bị tự động khóa!</span> Vui lòng nhanh chóng hoàn trả sách cho thư viện.
        </p>
      </div>
    </div>

    <!-- Hệ Thống Tabs: Đang Chờ Duyệt, Đang Mượn (Kèm Hạn Trả), Đã Trả -->
    <ul class="nav nav-pills mb-4 bg-white p-2 rounded shadow-sm border">
      <li class="nav-item">
        <button
          class="nav-link fw-semibold"
          :class="{ active: currentTab === 'ChoDuyet' }"
          @click="currentTab = 'ChoDuyet'"
        >
          <i class="bi bi-hourglass-split me-1 text-warning"></i> Đang Chờ Duyệt
          <span v-if="counts.ChoDuyet > 0" class="badge bg-warning text-dark ms-1">{{ counts.ChoDuyet }}</span>
        </button>
      </li>
      <li class="nav-item">
        <button
          class="nav-link fw-semibold"
          :class="{ active: currentTab === 'DangMuon' }"
          @click="currentTab = 'DangMuon'"
        >
          <i class="bi bi-book me-1 text-primary"></i> Đang Mượn
          <span v-if="counts.DangMuon > 0" class="badge bg-primary ms-1">{{ counts.DangMuon }}</span>
        </button>
      </li>
      <li class="nav-item">
        <button
          class="nav-link fw-semibold"
          :class="{ active: currentTab === 'QuaHan' }"
          @click="currentTab = 'QuaHan'"
        >
          <i class="bi bi-exclamation-triangle me-1 text-danger"></i> Quá Hạn
          <span v-if="counts.QuaHan > 0" class="badge bg-danger ms-1">{{ counts.QuaHan }}</span>
        </button>
      </li>
      <li class="nav-item">
        <button
          class="nav-link fw-semibold"
          :class="{ active: currentTab === 'DaTra' }"
          @click="currentTab = 'DaTra'"
        >
          <i class="bi bi-check-circle me-1 text-success"></i> Đã Trả
          <span v-if="counts.DaTra > 0" class="badge bg-success ms-1">{{ counts.DaTra }}</span>
        </button>
      </li>
      <li class="nav-item">
        <button
          class="nav-link fw-semibold"
          :class="{ active: currentTab === 'TuChoi' }"
          @click="currentTab = 'TuChoi'"
        >
          <i class="bi bi-x-circle me-1 text-secondary"></i> Bị Từ Chối / Đã Hủy
          <span v-if="counts.TuChoi > 0" class="badge bg-secondary ms-1">{{ counts.TuChoi }}</span>
        </button>
      </li>
      <li class="nav-item">
        <button
          class="nav-link fw-semibold"
          :class="{ active: currentTab === 'TatCa' }"
          @click="currentTab = 'TatCa'"
        >
          <i class="bi bi-journal-text me-1"></i> Tất Cả
        </button>
      </li>
    </ul>

    <!-- Bảng danh sách phiếu mượn cá nhân -->
    <div class="card border-0 shadow-sm p-4 bg-white">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Mã Phiếu</th>
              <th>Mã Sách</th>
              <th>Ngày Đặt/Mượn</th>
              <th>Hạn Trả Sách</th>
              <th>Ngày Trả Thực Tế</th>
              <th>Trạng Thái</th>
              <th>Ghi Chú</th>
              <th class="text-end" style="min-width: 140px;">Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in filteredList" :key="p._id">
              <td class="small text-muted font-monospace">{{ p._id.slice(-6).toUpperCase() }}</td>
              <td class="fw-bold text-dark">
                {{ p.MaSach }}
                <div v-if="p.TenSach" class="small fw-semibold text-secondary mt-1" style="max-width: 180px;">
                  {{ p.TenSach }}
                </div>
              </td>
              <td>{{ formatDate(p.NgayMuon) }}</td>
              <td>
                <span v-if="p.HanTra" class="fw-bold" :class="isOverdue(p) ? 'text-danger' : 'text-primary'">
                  {{ formatDate(p.HanTra) }}
                  <small v-if="isOverdue(p)" class="d-block text-danger fw-semibold">
                    (Quá hạn {{ getOverdueDays(p) }} ngày{{ getOverdueDays(p) > 20 ? ' - Tự động khóa' : '' }})
                  </small>
                </span>
                <span v-else-if="p.TrangThai === 'ChoDuyet'" class="text-primary fw-semibold" title="Hạn trả dự kiến (+14 ngày)">
                  {{ getDisplayHanTra(p) }}
                  <small class="d-block text-muted fw-normal">(Dự kiến)</small>
                </span>
                <span v-else class="text-muted">—</span>
              </td>
              <td class="text-muted">
                <template v-if="p.NgayTra">
                  <div>{{ formatDate(p.NgayTra) }}</div>
                  <small v-if="p.TinhTrangSach === 'Không hư'" class="d-block text-success mt-1">
                    <i class="bi bi-shield-check me-1"></i>Nguyên vẹn
                  </small>
                  <small v-else-if="p.TinhTrangSach" class="d-block text-danger fw-semibold mt-1">
                    <i class="bi bi-exclamation-triangle-fill me-1"></i>{{ p.TinhTrangSach }}
                    <span v-if="p.TienPhat > 0" class="d-block">(Phạt: {{ formatPrice(p.TienPhat) }}đ)</span>
                  </small>
                </template>
                <span v-else>—</span>
              </td>
              <td>
                <span :class="getStatusBadgeClass(p.TrangThai)">{{ p.TrangThai === 'DaHuy' ? 'Đã Hủy' : p.TrangThai }}</span>
              </td>
              <td class="small text-muted">{{ p.GhiChu || '—' }}</td>
              <td class="text-end">
                <button
                  v-if="p.TrangThai === 'ChoDuyet'"
                  class="btn btn-sm btn-outline-danger"
                  @click="handleCancel(p)"
                  title="Hủy yêu cầu mượn cuốn sách này"
                >
                  <i class="bi bi-x-circle me-1"></i> Hủy yêu cầu
                </button>
                <span v-else class="text-muted small">—</span>
              </td>
            </tr>
            <tr v-if="filteredList.length === 0">
              <td colspan="8" class="text-center text-muted py-5">
                <i class="bi bi-inbox fs-1 d-block mb-2 text-warning"></i>
                Không có phiếu mượn nào ở mục này.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { clientBorrowService } from '@/shared/services/clientServices'
import { useToastStore } from '@/shared/stores/toast'
import { useConfirmStore } from '@/shared/stores/confirm'

const toast = useToastStore()
const confirmStore = useConfirmStore()
const history = ref([])
const currentTab = ref('ChoDuyet')

const counts = computed(() => {
  return {
    ChoDuyet: history.value.filter(p => p.TrangThai === 'ChoDuyet').length,
    DangMuon: history.value.filter(p => p.TrangThai === 'DangMuon' && !isOverdue(p)).length,
    QuaHan: history.value.filter(p => isOverdue(p)).length,
    DaTra: history.value.filter(p => p.TrangThai === 'DaTra').length,
    TuChoi: history.value.filter(p => ['TuChoi', 'DaHuy'].includes(p.TrangThai)).length
  }
})

const maxOverdueDays = computed(() => {
  let max = 0
  const now = new Date()
  history.value.forEach(p => {
    if ((p.TrangThai === 'QuaHan' || p.TrangThai === 'DangMuon') && p.HanTra) {
      const han = new Date(p.HanTra)
      if (han < now) {
        const diff = Math.max(1, Math.ceil((now.getTime() - han.getTime()) / (1000 * 60 * 60 * 24)))
        if (diff > max) max = diff
      }
    }
  })
  return max
})

const hasOverdueOver20 = computed(() => maxOverdueDays.value > 20)
const hasOverdueUnder20 = computed(() => maxOverdueDays.value > 0 && maxOverdueDays.value <= 20)

function getOverdueDays(p) {
  if (!p || !p.HanTra) return 0
  const han = new Date(p.HanTra)
  const now = new Date()
  if (han >= now) return 0
  return Math.max(1, Math.ceil((now.getTime() - han.getTime()) / (1000 * 60 * 60 * 24)))
}

const filteredList = computed(() => {
  if (currentTab.value === 'ChoDuyet') {
    return history.value.filter(p => p.TrangThai === 'ChoDuyet')
  }
  if (currentTab.value === 'DangMuon') {
    return history.value.filter(p => p.TrangThai === 'DangMuon' && !isOverdue(p))
  }
  if (currentTab.value === 'QuaHan') {
    return history.value.filter(p => isOverdue(p))
  }
  if (currentTab.value === 'DaTra') {
    return history.value.filter(p => p.TrangThai === 'DaTra')
  }
  if (currentTab.value === 'TuChoi') {
    return history.value.filter(p => ['TuChoi', 'DaHuy'].includes(p.TrangThai))
  }
  return history.value
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

function formatPrice(val) {
  if (!val) return '0'
  return val.toLocaleString('vi-VN')
}

function getDisplayHanTra(p) {
  if (!p) return '—'
  if (p.HanTra) return formatDate(p.HanTra)
  if (p.NgayMuon) {
    const d = new Date(p.NgayMuon)
    d.setDate(d.getDate() + 14)
    return formatDate(d)
  }
  return '—'
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

async function handleCancel(phieu) {
  const ok = await confirmStore.ask({
    title: 'Hủy yêu cầu mượn sách',
    message: `Bạn có chắc chắn muốn hủy yêu cầu đặt mượn cuốn sách "${phieu.TenSach || phieu.MaSach}" không?`,
    type: 'warning',
    confirmText: 'Xác nhận hủy',
    cancelText: 'Quay lại'
  })
  if (!ok) return

  try {
    const res = await clientBorrowService.huyYeuCau(phieu._id)
    toast.success(res.message || 'Đã hủy yêu cầu mượn sách thành công!')
    fetchHistory()
  } catch (err) {
    toast.error(err.message || 'Có lỗi xảy ra khi hủy yêu cầu.')
  }
}

async function fetchHistory() {
  try {
    const res = await clientBorrowService.getLichSu()
    if (res.success) history.value = res.data
  } catch (err) {
    toast.error(err.message)
  }
}

onMounted(() => {
  fetchHistory()
})
</script>

<style scoped>
.nav-pills .nav-link {
  color: #495057;
  border-radius: 6px;
  padding: 0.5rem 1.25rem;
}
.nav-pills .nav-link.active {
  background-color: #f59e0b;
  color: #1c1917;
  font-weight: 700;
}
</style>

