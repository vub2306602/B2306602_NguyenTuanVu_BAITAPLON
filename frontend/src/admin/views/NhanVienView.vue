<template>
  <div>
    <!-- Tiêu đề trang -->
    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
      <div>
        <h3 class="fw-bold text-success mb-1">Quản Lý Nhân Viên</h3>
        <p class="text-muted mb-0">Chỉ tài khoản quyền Admin mới có thể quản lý danh sách nhân viên</p>
      </div>
      <button class="btn btn-primary" @click="openCreateModal()">
        <i class="bi bi-person-plus me-1"></i> Thêm Nhân Viên
      </button>
    </div>

    <!-- Thanh tìm kiếm nhân viên -->
    <div class="card border-0 shadow-sm p-3 mb-4">
      <div class="row g-2 align-items-center">
        <div class="col-md-6 col-lg-4">
          <div class="input-group">
            <span class="input-group-text bg-light border-end-0">
              <i class="bi bi-search text-muted"></i>
            </span>
            <input
              v-model="searchKeyword"
              type="text"
              class="form-control border-start-0 ps-0"
              placeholder="Tìm theo MSNV, họ tên, SĐT, chức vụ..."
              @keyup.enter="handleSearch"
              @input="handleInput"
            />
            <button
              v-if="searchKeyword"
              class="btn btn-outline-secondary"
              type="button"
              @click="clearSearch"
              title="Xóa tìm kiếm"
            >
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
        </div>
        <div class="col-auto">
          <button class="btn btn-outline-success" @click="handleSearch">
            <i class="bi bi-search me-1"></i> Tìm kiếm
          </button>
        </div>
      </div>
    </div>

    <!-- Bảng danh sách nhân viên -->
    <div class="card border-0 shadow-sm p-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <span class="text-muted small">
          Tổng số: <strong class="text-dark">{{ nhanViens.length }}</strong> nhân viên
          <span v-if="searchKeyword" class="ms-1">
            (Lọc theo từ khóa: "<span class="text-success fw-semibold">{{ searchKeyword }}</span>")
          </span>
        </span>
      </div>
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>MSNV</th>
              <th>Họ Tên</th>
              <th>Chức Vụ</th>
              <th>Trạng Thái</th>
              <th>Số Điện Thoại</th>
              <th>Địa Chỉ</th>
              <th class="text-end" style="min-width: 280px;">Hành Động</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="nv in nhanViens"
              :key="nv._id"
              :class="{ 'table-secondary opacity-75': nv.TrangThai === 'BiKhoa' }"
            >
              <td class="fw-bold text-success">{{ nv.MSNV }}</td>
              <td class="fw-semibold text-dark">
                {{ nv.HoTenNV }}
                <span
                  v-if="nv.MSNV === authStore.adminUser?.MSNV"
                  class="badge bg-secondary ms-1"
                  style="font-size: 0.7rem;"
                >
                  (Bạn)
                </span>
              </td>
              <td>
                <span
                  class="badge"
                  :class="nv.ChucVu === 'Admin'
                    ? 'bg-danger bg-opacity-10 text-danger border border-danger'
                    : 'bg-primary bg-opacity-10 text-primary border border-primary'"
                >
                  <i :class="nv.ChucVu === 'Admin' ? 'bi bi-shield-check me-1' : 'bi bi-person me-1'"></i>
                  {{ nv.ChucVu }}
                </span>
              </td>
              <td>
                <span
                  v-if="nv.TrangThai === 'BiKhoa'"
                  class="badge bg-danger bg-opacity-10 text-danger border border-danger"
                >
                  <i class="bi bi-lock-fill me-1"></i> Đã khóa
                </span>
                <span
                  v-else
                  class="badge bg-success bg-opacity-10 text-success border border-success"
                >
                  <i class="bi bi-check-circle-fill me-1"></i> Hoạt động
                </span>
              </td>
              <td><i class="bi bi-telephone text-muted me-1"></i>{{ nv.SoDienThoai }}</td>
              <td class="text-muted small">{{ nv.DiaChi || '—' }}</td>
              <td class="text-end">
                <!-- Nút 1: Sửa thông tin cá nhân -->
                <button
                  class="btn btn-sm btn-outline-primary me-1"
                  @click="openEditModal(nv)"
                  title="Sửa thông tin nhân viên"
                >
                  <i class="bi bi-pencil-square"></i> Sửa
                </button>

                <!-- Nút 2: Tách riêng nút Đổi Quyền -->
                <button
                  class="btn btn-sm btn-outline-warning text-dark me-1"
                  @click="openQuyenModal(nv)"
                  title="Phân quyền chức vụ (Admin / Thủ thư)"
                >
                  <i class="bi bi-shield-lock"></i> Đổi Quyền
                </button>

                <!-- Nút 3: Khóa / Mở khóa tài khoản -->
                <button
                  v-if="nv.TrangThai === 'BiKhoa'"
                  class="btn btn-sm btn-outline-success me-1"
                  @click="handleToggleKhoa(nv)"
                  :disabled="nv.MSNV === authStore.adminUser?.MSNV"
                  title="Mở khóa tài khoản nhân viên"
                >
                  <i class="bi bi-unlock"></i> Mở khóa
                </button>
                <button
                  v-else
                  class="btn btn-sm btn-outline-secondary me-1"
                  @click="handleToggleKhoa(nv)"
                  :disabled="nv.MSNV === authStore.adminUser?.MSNV"
                  title="Khóa tài khoản nhân viên"
                >
                  <i class="bi bi-lock"></i> Khóa
                </button>

                <!-- Nút 4: Xóa nhân viên -->
                <button
                  class="btn btn-sm btn-outline-danger"
                  @click="handleDelete(nv)"
                  :disabled="nv.MSNV === authStore.adminUser?.MSNV"
                  title="Xóa tài khoản nhân viên"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </td>
            </tr>
            <tr v-if="nhanViens.length === 0">
              <td colspan="7" class="text-center text-muted py-4">
                {{ loading ? 'Đang tải dữ liệu...' : (searchKeyword ? 'Không tìm thấy nhân viên nào phù hợp với từ khóa.' : 'Chưa có dữ liệu nhân viên.') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal 1: Thêm Mới / Sửa Thông Tin Nhân Viên -->
    <div v-if="showModal" class="modal-backdrop fade show"></div>
    <div v-if="showModal" class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-success text-white">
            <h5 class="modal-title fw-bold">
              {{ isEditing ? 'Cập Nhật Thông Tin Nhân Viên' : 'Thêm Nhân Viên Mới' }}
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
          </div>
          <form @submit.prevent="handleSubmit">
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label fw-semibold">MSNV <span class="text-danger">*</span></label>
                <input
                  v-model="form.MSNV"
                  type="text"
                  class="form-control"
                  placeholder="vd: NV002"
                  :disabled="isEditing"
                  required
                />
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold">Họ Tên Nhân Viên <span class="text-danger">*</span></label>
                <input v-model="form.HoTenNV" type="text" class="form-control" required />
              </div>

              <!-- Chỉ chọn Chức Vụ khi tạo mới; khi sửa sẽ dùng nút Đổi Quyền riêng -->
              <div v-if="!isEditing" class="mb-3">
                <label class="form-label fw-semibold">Chức Vụ Phân Quyền <span class="text-danger">*</span></label>
                <select v-model="form.ChucVu" class="form-select" required>
                  <option value="Thủ thư">Thủ thư</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold">
                  Mật Khẩu <span v-if="!isEditing" class="text-danger">*</span>
                  <small v-else class="text-muted fw-normal">(để trống nếu không đổi)</small>
                </label>
                <div class="input-group">
                  <input
                    v-model="form.Password"
                    :type="showPassword ? 'text' : 'password'"
                    class="form-control border-end-0"
                    placeholder="Nhập mật khẩu..."
                    :required="!isEditing"
                  />
                  <button
                    class="btn btn-outline-secondary border-start-0 bg-white text-muted"
                    type="button"
                    @click="showPassword = !showPassword"
                    title="Bật/tắt hiển thị mật khẩu"
                  >
                    <i :class="showPassword ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill'"></i>
                  </button>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold">Số Điện Thoại <span class="text-danger">*</span></label>
                <input
                  v-model="form.SoDienThoai"
                  type="tel"
                  class="form-control"
                  placeholder="09xxxxxxxx"
                  maxlength="10"
                  pattern="[0-9]{10}"
                  title="Số điện thoại phải gồm đúng 10 chữ số từ 0 đến 9"
                  required
                />
                <div class="form-text text-muted small">Nhập đúng 10 chữ số từ 0 đến 9.</div>
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold">Địa Chỉ</label>
                <input v-model="form.DiaChi" type="text" class="form-control" />
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-light" @click="closeModal">Hủy</button>
              <button type="submit" class="btn btn-primary" :disabled="submitting">
                {{ submitting ? 'Đang lưu...' : 'Lưu Dữ Liệu' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal 2: Tách Riêng Đổi Quyền Nhân Viên -->
    <div v-if="showQuyenModalState" class="modal-backdrop fade show"></div>
    <div v-if="showQuyenModalState" class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-warning text-dark">
            <h5 class="modal-title fw-bold">
              <i class="bi bi-shield-lock me-1"></i> Phân Quyền Nhân Viên
            </h5>
            <button type="button" class="btn-close" @click="closeQuyenModal"></button>
          </div>
          <form @submit.prevent="handleSaveQuyen">
            <div class="modal-body">
              <div class="alert alert-info py-2 small mb-3">
                <i class="bi bi-info-circle-fill me-1"></i>
                Bạn đang phân quyền cho nhân viên:
                <strong>{{ selectedNv?.HoTenNV }}</strong> ({{ selectedNv?.MSNV }})
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold">Chọn Quyền Hạn Mới <span class="text-danger">*</span></label>
                <div class="form-check p-3 border rounded mb-2" :class="{ 'bg-light border-primary': selectedChucVu === 'Thủ thư' }">
                  <input
                    class="form-check-input"
                    type="radio"
                    name="quyenOptions"
                    id="quyenThuThu"
                    value="Thủ thư"
                    v-model="selectedChucVu"
                  />
                  <label class="form-check-label fw-semibold d-block" for="quyenThuThu">
                    <span class="badge bg-primary bg-opacity-10 text-primary border border-primary me-2">Thủ thư</span>
                    <small class="d-block text-muted fw-normal mt-1">
                      Quản lý sách, thể loại, NXB, độc giả, duyệt mượn và xác nhận trả sách.
                    </small>
                  </label>
                </div>

                <div class="form-check p-3 border rounded" :class="{ 'bg-light border-danger': selectedChucVu === 'Admin' }">
                  <input
                    class="form-check-input"
                    type="radio"
                    name="quyenOptions"
                    id="quyenAdmin"
                    value="Admin"
                    v-model="selectedChucVu"
                  />
                  <label class="form-check-label fw-semibold d-block" for="quyenAdmin">
                    <span class="badge bg-danger bg-opacity-10 text-danger border border-danger me-2">Admin</span>
                    <small class="d-block text-muted fw-normal mt-1">
                      Toàn quyền quản trị hệ thống, bao gồm tạo, sửa, xóa, đổi quyền và khóa tài khoản nhân viên.
                    </small>
                  </label>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-light" @click="closeQuyenModal">Hủy</button>
              <button type="submit" class="btn btn-warning text-dark fw-semibold" :disabled="submittingQuyen">
                {{ submittingQuyen ? 'Đang cập nhật...' : 'Cập Nhật Quyền' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { nhanVienService } from '@/shared/services/adminServices'
import { useAdminAuthStore } from '../stores/auth'
import { useConfirmStore } from '@/shared/stores/confirm'
import { useToastStore } from '@/shared/stores/toast'

const authStore = useAdminAuthStore()
const confirmStore = useConfirmStore()
const toast = useToastStore()

const nhanViens = ref([])
const searchKeyword = ref('')
const loading = ref(false)
let debounceTimer = null

const showModal = ref(false)
const isEditing = ref(false)
const submitting = ref(false)
const currentId = ref(null)
const showPassword = ref(false)

// State riêng cho Modal Đổi Quyền
const showQuyenModalState = ref(false)
const selectedNv = ref(null)
const selectedChucVu = ref('Thủ thư')
const submittingQuyen = ref(false)

const form = ref({
  MSNV: '',
  HoTenNV: '',
  ChucVu: 'Thủ thư',
  Password: '',
  SoDienThoai: '',
  DiaChi: ''
})

async function fetchNhanVien() {
  loading.value = true
  try {
    const params = {}
    if (searchKeyword.value.trim()) {
      params.keyword = searchKeyword.value.trim()
    }
    const res = await nhanVienService.getAll(params)
    if (res.success) nhanViens.value = res.data
  } catch (err) {
    toast.error(err.message)
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  clearTimeout(debounceTimer)
  fetchNhanVien()
}

function handleInput() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    fetchNhanVien()
  }, 350)
}

function clearSearch() {
  searchKeyword.value = ''
  fetchNhanVien()
}

// 1. Mở Modal Thêm mới
function openCreateModal() {
  isEditing.value = false
  currentId.value = null
  showPassword.value = false
  form.value = {
    MSNV: '',
    HoTenNV: '',
    ChucVu: 'Thủ thư',
    Password: '',
    SoDienThoai: '',
    DiaChi: ''
  }
  showModal.value = true
}

// 2. Mở Modal Sửa thông tin cá nhân (không đổi quyền ở đây)
function openEditModal(item) {
  isEditing.value = true
  currentId.value = item._id
  showPassword.value = false
  form.value = {
    MSNV: item.MSNV,
    HoTenNV: item.HoTenNV,
    ChucVu: item.ChucVu,
    Password: '',
    SoDienThoai: item.SoDienThoai,
    DiaChi: item.DiaChi || ''
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

// Lưu Thêm mới hoặc Sửa thông tin
async function handleSubmit() {
  submitting.value = true

  const phoneRegex = /^[0-9]{10}$/
  if (!phoneRegex.test(form.value.SoDienThoai.trim())) {
    toast.error('Số điện thoại không hợp lệ (phải gồm đúng 10 ký tự số từ 0 đến 9)!')
    submitting.value = false
    return
  }

  try {
    if (isEditing.value) {
      const payload = {
        HoTenNV: form.value.HoTenNV,
        SoDienThoai: form.value.SoDienThoai,
        DiaChi: form.value.DiaChi
      }
      if (form.value.Password && form.value.Password.trim()) {
        payload.Password = form.value.Password
      }
      const res = await nhanVienService.update(currentId.value, payload)
      toast.success(res.message || 'Cập nhật thông tin nhân viên thành công!')
    } else {
      const res = await nhanVienService.create(form.value)
      toast.success(res.message || 'Thêm nhân viên mới thành công!')
    }
    closeModal()
    fetchNhanVien()
  } catch (err) {
    toast.error(err.message)
  } finally {
    submitting.value = false
  }
}

// 3. Xử lý Đổi quyền riêng biệt
function openQuyenModal(nv) {
  selectedNv.value = nv
  selectedChucVu.value = nv.ChucVu || 'Thủ thư'
  showQuyenModalState.value = true
}

function closeQuyenModal() {
  showQuyenModalState.value = false
  selectedNv.value = null
}

async function handleSaveQuyen() {
  if (!selectedNv.value) return
  submittingQuyen.value = true
  try {
    const res = await nhanVienService.doiQuyen(selectedNv.value._id, {
      ChucVu: selectedChucVu.value
    })
    toast.success(res.message || 'Cập nhật quyền nhân viên thành công!')
    closeQuyenModal()
    fetchNhanVien()
  } catch (err) {
    toast.error(err.message)
  } finally {
    submittingQuyen.value = false
  }
}

// 4. Xử lý Khóa / Mở khóa tài khoản
async function handleToggleKhoa(nv) {
  if (nv.MSNV === authStore.adminUser?.MSNV) {
    toast.warning('Bạn không thể tự khóa tài khoản của chính mình!')
    return
  }

  const isLocked = nv.TrangThai === 'BiKhoa'
  const actionText = isLocked ? 'Mở khóa' : 'Khóa'
  const confirmed = await confirmStore.ask({
    title: `${actionText} tài khoản nhân viên`,
    message: isLocked
      ? `Bạn có chắc muốn MỞ KHÓA tài khoản cho nhân viên "${nv.HoTenNV}" (${nv.MSNV})? Nhân viên này sẽ có thể đăng nhập lại vào hệ thống.`
      : `Bạn có chắc muốn KHÓA tài khoản của nhân viên "${nv.HoTenNV}" (${nv.MSNV})? Sau khi khóa, nhân viên này sẽ bị từ chối đăng nhập.`,
    type: isLocked ? 'success' : 'warning',
    confirmText: actionText,
    cancelText: 'Hủy'
  })

  if (!confirmed) return

  try {
    const res = await nhanVienService.toggleKhoa(nv._id)
    toast.success(res.message || `Đã ${actionText.toLowerCase()} tài khoản thành công!`)
    fetchNhanVien()
  } catch (err) {
    toast.error(err.message)
  }
}

// 5. Xử lý Xóa nhân viên
async function handleDelete(nv) {
  if (nv.MSNV === authStore.adminUser?.MSNV) {
    toast.warning('Bạn không thể tự xóa tài khoản của chính mình!')
    return
  }

  const ok = await confirmStore.ask({
    title: 'Xóa nhân viên',
    message: `Bạn có chắc chắn muốn xóa tài khoản nhân viên "${nv.HoTenNV}" (${nv.MSNV}) khỏi hệ thống?`,
    type: 'danger',
    confirmText: 'Xóa nhân viên'
  })
  if (!ok) return
  try {
    await nhanVienService.delete(nv._id)
    toast.success('Đã xóa nhân viên thành công!')
    fetchNhanVien()
  } catch (err) {
    toast.error(err.message)
  }
}

onMounted(() => {
  fetchNhanVien()
})
</script>
