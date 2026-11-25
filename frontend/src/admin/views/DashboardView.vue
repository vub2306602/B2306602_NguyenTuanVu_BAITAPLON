<template>
  <div>
    <!-- Title -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h3 class="fw-bold text-success mb-1">Bảng Điều Khiển Tổng Quan</h3>
        <p class="text-muted mb-0">Hệ thống Thống kê & Quản lý Thư viện</p>
      </div>
      <button class="btn btn-outline-success btn-sm" @click="fetchData" :disabled="loading">
        <i class="bi bi-arrow-clockwise" :class="{ 'spin-icon': loading }"></i> Làm mới
      </button>
    </div>

    <!-- 4 Thẻ Thống Kê Tổng Quan -->
    <div class="row g-3 mb-4">
      <div class="col-sm-6 col-xl-3">
        <div class="card border-0 shadow-sm p-3 h-100 border-start border-4 border-success">
          <div class="d-flex align-items-center justify-content-between">
            <div>
              <span class="text-muted small fw-semibold text-uppercase">Tổng Đầu Sách</span>
              <h3 class="fw-bold mb-0 text-dark mt-1">{{ stats.tongDauSach || 0 }}</h3>
              <small class="text-success">{{ stats.tongSoLuongKho || 0 }} bản sách trong kho</small>
            </div>
            <div class="p-3 bg-success bg-opacity-10 rounded-circle text-success fs-3">
              <i class="bi bi-journal-bookmark-fill"></i>
            </div>
          </div>
        </div>
      </div>

      <div class="col-sm-6 col-xl-3">
        <div class="card border-0 shadow-sm p-3 h-100 border-start border-4 border-primary">
          <div class="d-flex align-items-center justify-content-between">
            <div>
              <span class="text-muted small fw-semibold text-uppercase">Đang Cho Mượn</span>
              <h3 class="fw-bold mb-0 text-dark mt-1">{{ stats.sachDangMuon || 0 }}</h3>
              <small class="text-primary">Phiếu đang mượn</small>
            </div>
            <div class="p-3 bg-primary bg-opacity-10 rounded-circle text-primary fs-3">
              <i class="bi bi-book-half"></i>
            </div>
          </div>
        </div>
      </div>

      <div class="col-sm-6 col-xl-3">
        <div class="card border-0 shadow-sm p-3 h-100 border-start border-4 border-warning">
          <div class="d-flex align-items-center justify-content-between">
            <div>
              <span class="text-muted small fw-semibold text-uppercase">Phiếu Chờ Duyệt</span>
              <h3 class="fw-bold mb-0 text-dark mt-1">{{ stats.phieuChoDuyet || 0 }}</h3>
              <small class="text-warning">Yêu cầu cần xử lý</small>
            </div>
            <div class="p-3 bg-warning bg-opacity-10 rounded-circle text-warning fs-3">
              <i class="bi bi-hourglass-split"></i>
            </div>
          </div>
        </div>
      </div>

      <div class="col-sm-6 col-xl-3">
        <div class="card border-0 shadow-sm p-3 h-100 border-start border-4 border-info">
          <div class="d-flex align-items-center justify-content-between">
            <div>
              <span class="text-muted small fw-semibold text-uppercase">Tổng Độc Giả</span>
              <h3 class="fw-bold mb-0 text-dark mt-1">{{ stats.tongDocGia || 0 }}</h3>
              <small class="text-info">Tài khoản đã đăng ký</small>
            </div>
            <div class="p-3 bg-info bg-opacity-10 rounded-circle text-info fs-3">
              <i class="bi bi-people-fill"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Biểu đồ Thể loại & Phiếu cần duyệt -->
    <div class="row g-4">
      <!-- Biểu đồ Phân bổ Thể loại bằng Chart.js -->
      <div class="col-lg-5">
        <div class="card border-0 shadow-sm p-4 h-100">
          <h5 class="fw-bold text-dark mb-3"><i class="bi bi-pie-chart-fill text-success me-2"></i>Phân Bổ Sách Theo Thể Loại</h5>
          <div class="chart-container d-flex justify-content-center align-items-center" style="position: relative; height: 280px;">
            <canvas ref="chartCanvasRef" v-show="hasChartData"></canvas>
            <div v-if="!hasChartData" class="text-muted small">Đang tải biểu đồ thể loại...</div>
          </div>
        </div>
      </div>

      <!-- Bảng Phiếu Mượn Chờ Duyệt -->
      <div class="col-lg-7">
        <div class="card border-0 shadow-sm p-4 h-100">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="fw-bold text-dark mb-0"><i class="bi bi-clock-history text-warning me-2"></i>Yêu Cầu Mượn Chờ Duyệt</h5>
            <router-link to="/muonsach" class="btn btn-sm btn-link text-success text-decoration-none fw-semibold">Xem tất cả</router-link>
          </div>

          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th>Mã Độc Giả</th>
                  <th>Mã Sách</th>
                  <th>Ngày Đặt</th>
                  <th>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="phieu in pendingPhieus" :key="phieu._id">
                  <td class="fw-semibold text-dark">{{ phieu.MaDocGia }}</td>
                  <td><span class="badge bg-light text-dark border">{{ phieu.MaSach }}</span></td>
                  <td class="small text-muted">{{ formatDate(phieu.createdAt) }}</td>
                  <td>
                    <button class="btn btn-sm btn-success me-1" @click="handleQuickDuyet(phieu._id)" title="Duyệt">
                      <i class="bi bi-check-lg"></i> Duyệt
                    </button>
                    <button class="btn btn-sm btn-outline-danger" @click="handleQuickTuChoi(phieu._id)" title="Từ chối">
                      <i class="bi bi-x-lg"></i>
                    </button>
                  </td>
                </tr>
                <tr v-if="pendingPhieus.length === 0">
                  <td colspan="4" class="text-center text-muted py-4">Hiện không có yêu cầu nào chờ duyệt.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Thống Kê Cơ Cấu Số Sách: Thể Loại, Tác Giả, Nhà Xuất Bản -->
    <div class="card border-0 shadow-sm p-4 mt-4">
      <div class="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        <div>
          <h5 class="fw-bold text-dark mb-1">
            <i class="bi bi-bar-chart-line-fill text-success me-2"></i>Thống Kê Cơ Cấu Số Sách
          </h5>
          <small class="text-muted">Chi tiết phân bổ số đầu sách và số lượng tồn kho theo từng đối tượng</small>
        </div>

        <!-- 3 Tabs chuyển đổi: Thể Loại / Tác Giả / NXB -->
        <ul class="nav nav-pills bg-light p-1 rounded-3 small">
          <li class="nav-item">
            <button
              class="nav-link py-1 px-3 fw-semibold"
              :class="{ 'active bg-success text-white': thongKeTab === 'theloai' }"
              @click="thongKeTab = 'theloai'"
            >
              <i class="bi bi-tag-fill me-1"></i> Theo Thể Loại ({{ statTheLoai.length }})
            </button>
          </li>
          <li class="nav-item">
            <button
              class="nav-link py-1 px-3 fw-semibold"
              :class="{ 'active bg-success text-white': thongKeTab === 'tacgia' }"
              @click="thongKeTab = 'tacgia'"
            >
              <i class="bi bi-pen-fill me-1"></i> Theo Tác Giả ({{ statTacGia.length }})
            </button>
          </li>
          <li class="nav-item">
            <button
              class="nav-link py-1 px-3 fw-semibold"
              :class="{ 'active bg-success text-white': thongKeTab === 'nxb' }"
              @click="thongKeTab = 'nxb'"
            >
              <i class="bi bi-building me-1"></i> Theo NXB ({{ statNXB.length }})
            </button>
          </li>
        </ul>
      </div>

      <!-- Bảng thống kê theo Thể Loại -->
      <div v-if="thongKeTab === 'theloai'" class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th style="width: 140px;">Mã Thể Loại</th>
              <th>Tên Thể Loại</th>
              <th class="text-center" style="width: 160px;">Số Đầu Sách</th>
              <th class="text-center" style="width: 160px;">Tổng Số Quyển</th>
              <th style="width: 200px;">Tỷ Lệ Tồn Kho</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in statTheLoai" :key="item.MaTheLoai">
              <td class="fw-bold text-success">{{ item.MaTheLoai }}</td>
              <td class="fw-semibold text-dark">{{ item.TenTheLoai }}</td>
              <td class="text-center">
                <span class="badge bg-success bg-opacity-10 text-success border border-success">
                  {{ item.soDauSach }} đầu sách
                </span>
              </td>
              <td class="text-center fw-bold text-dark">{{ item.tongSoQuyen }} cuốn</td>
              <td>
                <div class="d-flex align-items-center gap-2">
                  <div class="progress flex-grow-1" style="height: 6px;">
                    <div
                      class="progress-bar bg-success"
                      :style="{ width: getPercentage(item.tongSoQuyen, stats.tongSoLuongKho) + '%' }"
                    ></div>
                  </div>
                  <small class="text-muted fw-semibold" style="min-width: 40px;">
                    {{ getPercentage(item.tongSoQuyen, stats.tongSoLuongKho) }}%
                  </small>
                </div>
              </td>
            </tr>
            <tr v-if="statTheLoai.length === 0">
              <td colspan="5" class="text-center text-muted py-4">Chưa có dữ liệu thống kê thể loại.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Bảng thống kê theo Tác Giả -->
      <div v-else-if="thongKeTab === 'tacgia'" class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th style="width: 140px;">Mã Tác Giả</th>
              <th>Tên Tác Giả</th>
              <th class="text-center" style="width: 160px;">Số Đầu Sách</th>
              <th class="text-center" style="width: 160px;">Tổng Số Quyển</th>
              <th style="width: 200px;">Tỷ Lệ Tồn Kho</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in statTacGia" :key="item.MaTacGia">
              <td class="fw-bold text-success">{{ item.MaTacGia }}</td>
              <td class="fw-semibold text-dark">{{ item.TenTacGia }}</td>
              <td class="text-center">
                <span class="badge bg-primary bg-opacity-10 text-primary border border-primary">
                  {{ item.soDauSach }} đầu sách
                </span>
              </td>
              <td class="text-center fw-bold text-dark">{{ item.tongSoQuyen }} cuốn</td>
              <td>
                <div class="d-flex align-items-center gap-2">
                  <div class="progress flex-grow-1" style="height: 6px;">
                    <div
                      class="progress-bar bg-primary"
                      :style="{ width: getPercentage(item.tongSoQuyen, stats.tongSoLuongKho) + '%' }"
                    ></div>
                  </div>
                  <small class="text-muted fw-semibold" style="min-width: 40px;">
                    {{ getPercentage(item.tongSoQuyen, stats.tongSoLuongKho) }}%
                  </small>
                </div>
              </td>
            </tr>
            <tr v-if="statTacGia.length === 0">
              <td colspan="5" class="text-center text-muted py-4">Chưa có dữ liệu thống kê tác giả.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Bảng thống kê theo Nhà Xuất Bản -->
      <div v-else class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th style="width: 140px;">Mã NXB</th>
              <th>Tên Nhà Xuất Bản</th>
              <th class="text-center" style="width: 160px;">Số Đầu Sách</th>
              <th class="text-center" style="width: 160px;">Tổng Số Quyển</th>
              <th style="width: 200px;">Tỷ Lệ Tồn Kho</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in statNXB" :key="item.MaNXB">
              <td class="fw-bold text-success">{{ item.MaNXB }}</td>
              <td class="fw-semibold text-dark">{{ item.TenNXB }}</td>
              <td class="text-center">
                <span class="badge bg-warning bg-opacity-10 text-dark border border-warning">
                  {{ item.soDauSach }} đầu sách
                </span>
              </td>
              <td class="text-center fw-bold text-dark">{{ item.tongSoQuyen }} cuốn</td>
              <td>
                <div class="d-flex align-items-center gap-2">
                  <div class="progress flex-grow-1" style="height: 6px;">
                    <div
                      class="progress-bar bg-warning"
                      :style="{ width: getPercentage(item.tongSoQuyen, stats.tongSoLuongKho) + '%' }"
                    ></div>
                  </div>
                  <small class="text-muted fw-semibold" style="min-width: 40px;">
                    {{ getPercentage(item.tongSoQuyen, stats.tongSoLuongKho) }}%
                  </small>
                </div>
              </td>
            </tr>
            <tr v-if="statNXB.length === 0">
              <td colspan="5" class="text-center text-muted py-4">Chưa có dữ liệu thống kê nhà xuất bản.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import Chart from 'chart.js/auto'
import { thongKeService, muonTraService } from '@/shared/services/adminServices'
import { useConfirmStore } from '@/shared/stores/confirm'
import { useToastStore } from '@/shared/stores/toast'

const confirmStore = useConfirmStore()
const toastStore = useToastStore()
const stats = ref({})
const pendingPhieus = ref([])
const loading = ref(false)
const hasChartData = ref(false)
const chartCanvasRef = ref(null)
let chartInstance = null

const thongKeTab = ref('theloai')
const statTheLoai = ref([])
const statTacGia = ref([])
const statNXB = ref([])

function getPercentage(value, total) {
  if (!total || total <= 0 || !value) return 0
  return Math.round((value / total) * 100)
}

function updateChart(labels, data) {
  nextTick(() => {
    if (!chartCanvasRef.value) return
    if (chartInstance) {
      chartInstance.destroy()
      chartInstance = null
    }
    chartInstance = new Chart(chartCanvasRef.value, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: ['#198754', '#20c997', '#0dcaf0', '#ffc107', '#fd7e14', '#6f42c1']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    })
  })
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('vi-VN')
}

async function fetchData() {
  loading.value = true
  try {
    const [tqRes, tlRes, tgRes, nxbRes, mtRes] = await Promise.all([
      thongKeService.getTongQuan(),
      thongKeService.getTheoTheLoai(),
      thongKeService.getTheoTacGia(),
      thongKeService.getTheoNhaXuatBan(),
      muonTraService.getAll({ trangthai: 'ChoDuyet', limit: 5 })
    ])

    if (tqRes?.success) stats.value = tqRes.data
    if (tlRes?.success && Array.isArray(tlRes.data)) {
      statTheLoai.value = tlRes.data
      if (tlRes.data.length > 0) {
        hasChartData.value = true
        const labels = tlRes.data.map(item => item.TenTheLoai)
        const data = tlRes.data.map(item => item.tongSoQuyen)
        updateChart(labels, data)
      }
    }
    if (tgRes?.success && Array.isArray(tgRes.data)) {
      statTacGia.value = tgRes.data
    }
    if (nxbRes?.success && Array.isArray(nxbRes.data)) {
      statNXB.value = nxbRes.data
    }
    if (mtRes?.success && Array.isArray(mtRes.data)) {
      // Sắp xếp: yêu cầu ĐẶT SỚM NHẤT lên đầu để duyệt theo thứ tự FIFO
      pendingPhieus.value = [...mtRes.data].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      )
    }
  } catch (err) {
    console.error('Lỗi tải dữ liệu dashboard:', err)
  } finally {
    loading.value = false
  }
}

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
})

async function handleQuickDuyet(id) {
  const ok = await confirmStore.ask({
    title: 'Xác nhận duyệt mượn',
    message: 'Bạn có chắc muốn duyệt mượn cuốn sách này?',
    type: 'success',
    confirmText: 'Duyệt mượn'
  })
  if (!ok) return
  try {
    await muonTraService.duyet(id)
    toastStore.success('Đã duyệt phiếu mượn thành công!')
    fetchData()
  } catch (err) {
    toastStore.error(err.message)
  }
}

async function handleQuickTuChoi(id) {
  const lyDo = await confirmStore.prompt({
    title: 'Từ chối duyệt mượn',
    message: 'Vui lòng nhập lý do từ chối phiếu mượn (nếu có):',
    inputPlaceholder: 'Lý do từ chối...',
    type: 'warning',
    confirmText: 'Từ chối mượn',
    cancelText: 'Quay lại'
  })
  if (lyDo === null) return
  try {
    await muonTraService.tuChoi(id, { LyDo: lyDo })
    toastStore.warning('Đã từ chối phiếu mượn.')
    fetchData()
  } catch (err) {
    toastStore.error(err.message)
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.spin-icon {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
