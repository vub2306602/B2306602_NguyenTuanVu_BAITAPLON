<template>
  <div>
    <!-- Header -->
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <h3 class="fw-bold text-success mb-1">Quản Lý Sách</h3>
        <p class="text-muted mb-0">Quản lý kho sách, thông tin bìa, giá và tồn kho</p>
      </div>
      <button class="btn btn-primary" @click="openModal()">
        <i class="bi bi-plus-circle me-1"></i> Thêm Sách Mới
      </button>
    </div>

    <!-- Bộ Lọc & Tìm Kiếm -->
    <div class="card border-0 shadow-sm p-3 mb-4">
      <div class="row g-3">
        <div class="col-md-3">
          <div class="input-group">
            <span class="input-group-text bg-white"><i class="bi bi-search text-muted"></i></span>
            <input
              v-model="filters.keyword"
              @input="handleSearch"
              type="text"
              class="form-control"
              placeholder="Tìm tên, tác giả, mã..."
            />
          </div>
        </div>
        <div class="col-md-3">
          <select v-model="filters.theloai" @change="currentPage = 1; fetchSach()" class="form-select">
            <option value="">-- Tất cả thể loại --</option>
            <option v-for="tl in theLoais" :key="tl.MaTheLoai" :value="tl.MaTheLoai">
              {{ tl.TenTheLoai }}
            </option>
          </select>
        </div>
        <div class="col-md-3">
          <select v-model="filters.tacgia" @change="currentPage = 1; fetchSach()" class="form-select">
            <option value="">-- Tất cả tác giả --</option>
            <option v-for="tg in tacGias" :key="tg.MaTacGia" :value="tg.MaTacGia">
              {{ tg.TenTacGia }}
            </option>
          </select>
        </div>
        <div class="col-md-3">
          <select v-model="filters.nxb" @change="currentPage = 1; fetchSach()" class="form-select">
            <option value="">-- Tất cả nhà xuất bản --</option>
            <option v-for="nxb in nxbs" :key="nxb.MaNXB" :value="nxb.MaNXB">
              {{ nxb.TenNXB }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Bảng Sách -->
    <div class="card border-0 shadow-sm p-4">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th style="width: 80px;">Ảnh Bìa</th>
              <th style="width: 100px;">Mã Sách</th>
              <th>Tên Sách</th>
              <th>Tác Giả</th>
              <th>Đơn Giá</th>
              <th>Tồn Kho</th>
              <th style="width: 130px;" class="text-end">Hành Động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sach in sachList" :key="sach._id">
              <td>
                <img
                  v-if="sach.HinhAnhUrl"
                  :src="sach.HinhAnhUrl"
                  class="rounded shadow-sm"
                  style="width: 48px; height: 64px; object-fit: contain; background-color: #f8fafc;"
                  alt="Bìa sách"
                />
                <div
                  v-else
                  class="bg-light text-muted d-flex align-items-center justify-content-center rounded"
                  style="width: 48px; height: 64px; font-size: 1.2rem;"
                >
                  <i class="bi bi-book"></i>
                </div>
              </td>
              <td class="fw-bold text-success">{{ sach.MaSach }}</td>
              <td>
                <div class="fw-semibold text-dark">{{ sach.TenSach }}</div>
                <small class="text-muted">{{ sach.NamXuatBan ? 'Năm XB: ' + sach.NamXuatBan : '' }}</small>
              </td>
              <td class="text-secondary">{{ sach.TenTacGia || sach.TacGia || '—' }}</td>
              <td class="fw-semibold text-danger">{{ formatPrice(sach.DonGia) }} đ</td>
              <td>
                <span
                  class="badge"
                  :class="sach.SoQuyen > 0 ? 'bg-success bg-opacity-10 text-success border border-success' : 'bg-danger bg-opacity-10 text-danger border border-danger'"
                >
                  {{ sach.SoQuyen > 0 ? `Còn ${sach.SoQuyen} q` : 'Hết hàng' }}
                </span>
              </td>
              <td class="text-end">
                <button class="btn btn-sm btn-outline-primary me-2" @click="openModal(sach)">
                  <i class="bi bi-pencil-square"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" @click="handleDelete(sach._id)">
                  <i class="bi bi-trash"></i>
                </button>
              </td>
            </tr>
            <tr v-if="sachList.length === 0">
              <td colspan="7" class="text-center text-muted py-4">Không tìm thấy đầu sách nào.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Phân Trang -->
    <div v-if="totalPages > 1" class="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
      <small class="text-muted">
        Hiển thị {{ (currentPage - 1) * pageSize + 1 }}–{{ Math.min(currentPage * pageSize, totalItems) }} / {{ totalItems }} cuốn sách
      </small>
      <nav>
        <ul class="pagination pagination-sm mb-0">
          <li class="page-item" :class="{ disabled: currentPage <= 1 }">
            <button class="page-link" @click="changePage(currentPage - 1)"><i class="bi bi-chevron-left"></i></button>
          </li>
          <li v-for="p in totalPages" :key="p" class="page-item" :class="{ active: p === currentPage }">
            <button class="page-link" @click="changePage(p)">{{ p }}</button>
          </li>
          <li class="page-item" :class="{ disabled: currentPage >= totalPages }">
            <button class="page-link" @click="changePage(currentPage + 1)"><i class="bi bi-chevron-right"></i></button>
          </li>
        </ul>
      </nav>
    </div>

    <!-- Modal Thêm/Sửa Sách Có Xem Trước (Preview) Ảnh Bìa -->
    <div v-if="showModal" class="modal-backdrop fade show"></div>
    <div v-if="showModal" class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-success text-white">
            <h5 class="modal-title fw-bold">
              {{ isEditing ? 'Chỉnh Sửa Thông Tin Sách' : 'Thêm Sách Mới Vào Kho' }}
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
          </div>
          <form @submit.prevent="handleSubmit">
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-md-4">
                  <label class="form-label fw-semibold">Mã Sách <span class="text-danger">*</span></label>
                  <input
                    v-model="form.MaSach"
                    type="text"
                    class="form-control"
                    placeholder="vd: S001"
                    :disabled="isEditing"
                    required
                  />
                </div>
                <div class="col-md-8">
                  <label class="form-label fw-semibold">Tên Cuốn Sách <span class="text-danger">*</span></label>
                  <input
                    v-model="form.TenSach"
                    type="text"
                    class="form-control"
                    placeholder="vd: Lập trình Vue.js 3"
                    required
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Tác Giả <span class="text-danger">*</span></label>
                  <select v-model="form.TacGia" class="form-select" required>
                    <option value="">-- Chọn tác giả --</option>
                    <option v-for="tg in tacGias" :key="tg.MaTacGia" :value="tg.MaTacGia">
                      {{ tg.TenTacGia }} ({{ tg.MaTacGia }})
                    </option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label fw-semibold">Đơn Giá (VNĐ)</label>
                  <input v-model.number="form.DonGia" type="number" min="0" class="form-control" />
                </div>
                <div class="col-md-3">
                  <label class="form-label fw-semibold">Số Quyển Tồn <span class="text-danger">*</span></label>
                  <input v-model.number="form.SoQuyen" type="number" min="0" class="form-control" required />
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-semibold">Năm Xuất Bản</label>
                  <input v-model.number="form.NamXuatBan" type="number" class="form-control" placeholder="2024" />
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-semibold">Thể Loại</label>
                  <select v-model="form.MaTheLoai" class="form-select">
                    <option value="">-- Chọn thể loại --</option>
                    <option v-for="tl in theLoais" :key="tl.MaTheLoai" :value="tl.MaTheLoai">
                      {{ tl.TenTheLoai }}
                    </option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label fw-semibold">Nhà Xuất Bản</label>
                  <select v-model="form.MaNXB" class="form-select">
                    <option value="">-- Chọn NXB --</option>
                    <option v-for="nxb in nxbs" :key="nxb.MaNXB" :value="nxb.MaNXB">
                      {{ nxb.TenNXB }}
                    </option>
                  </select>
                </div>

                <!-- Chọn và Xem Trước Ảnh Bìa Trước Khi Upload -->
                <div class="col-12">
                  <label class="form-label fw-semibold">Ảnh Bìa Sách</label>
                  <input type="file" @change="handleFileChange" accept="image/*" class="form-control mb-2" />
                  <div v-if="imagePreview" class="mt-2 text-center p-2 border rounded bg-light">
                    <small class="text-muted d-block mb-1">Xem trước ảnh bìa:</small>
                    <img :src="imagePreview" class="rounded shadow-sm" style="max-height: 160px; max-width: 100%; object-fit: contain;" alt="Preview" />
                  </div>
                </div>

                <div class="col-12">
                  <label class="form-label fw-semibold">Mô Tả Tóm Tắt</label>
                  <textarea v-model="form.MoTa" rows="3" class="form-control" placeholder="Nội dung giới thiệu cuốn sách..."></textarea>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-light" @click="closeModal">Hủy</button>
              <button type="submit" class="btn btn-primary" :disabled="submitting">
                {{ submitting ? 'Đang lưu...' : 'Lưu Sách' }}
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
import { sachService, theLoaiService, nxbService, tacGiaService } from '@/shared/services/adminServices'
import { useConfirmStore } from '@/shared/stores/confirm'
import { useToastStore } from '@/shared/stores/toast'

const confirmStore = useConfirmStore()
const toast = useToastStore()

const sachList = ref([])
const theLoais = ref([])
const nxbs = ref([])
const tacGias = ref([])
const showModal = ref(false)
const isEditing = ref(false)
const submitting = ref(false)
const currentId = ref(null)

const currentPage = ref(1)
const totalPages = ref(1)
const totalItems = ref(0)
const pageSize = 10

const filters = ref({
  keyword: '',
  theloai: '',
  tacgia: '',
  nxb: ''
})

const form = ref({
  MaSach: '',
  TenSach: '',
  TacGia: '',
  DonGia: 0,
  SoQuyen: 1,
  NamXuatBan: new Date().getFullYear(),
  MaTheLoai: '',
  MaNXB: '',
  MoTa: ''
})

const selectedFile = ref(null)
const imagePreview = ref('')
let searchTimeout = null

function formatPrice(val) {
  if (!val) return '0'
  return val.toLocaleString('vi-VN')
}

async function fetchSach() {
  try {
    const res = await sachService.getAll({
      keyword: filters.value.keyword,
      theloai: filters.value.theloai,
      tacgia: filters.value.tacgia,
      nxb: filters.value.nxb,
      page: currentPage.value,
      limit: pageSize
    })
    if (res.success) {
      sachList.value = res.data
      totalPages.value = res.totalPages || 1
      totalItems.value = res.total || res.data.length
    }
  } catch (err) {
    console.error(err)
  }
}

function changePage(p) {
  if (p < 1 || p > totalPages.value) return
  currentPage.value = p
  fetchSach()
}

async function fetchDropdowns() {
  try {
    const [tlRes, nxbRes, tgRes] = await Promise.all([
      theLoaiService.getAll(),
      nxbService.getAll(),
      tacGiaService.getAll()
    ])
    if (tlRes.success) theLoais.value = tlRes.data
    if (nxbRes.success) nxbs.value = nxbRes.data
    if (tgRes.success) tacGias.value = tgRes.data
  } catch (err) {
    console.error(err)
  }
}

function handleSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchSach()
  }, 350)
}

function handleFileChange(e) {
  const file = e.target.files[0]
  if (file) {
    selectedFile.value = file
    imagePreview.value = URL.createObjectURL(file)
  }
}

function openModal(item = null) {
  selectedFile.value = null
  if (item) {
    isEditing.value = true
    currentId.value = item._id
    form.value = { ...item }
    imagePreview.value = item.HinhAnhUrl || ''
  } else {
    isEditing.value = false
    currentId.value = null
    form.value = {
      MaSach: '',
      TenSach: '',
      TacGia: '',
      DonGia: 0,
      SoQuyen: 1,
      NamXuatBan: new Date().getFullYear(),
      MaTheLoai: '',
      MaNXB: '',
      MoTa: ''
    }
    imagePreview.value = ''
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

async function handleSubmit() {
  submitting.value = true
  try {
    const fd = new FormData()
    Object.keys(form.value).forEach(k => {
      if (form.value[k] !== undefined && form.value[k] !== null) {
        fd.append(k, form.value[k])
      }
    })
    if (selectedFile.value) {
      fd.append('HinhAnh', selectedFile.value)
    }

    if (isEditing.value) {
      await sachService.update(currentId.value, fd)
      toast.success('Cập nhật thông tin sách thành công!')
    } else {
      await sachService.create(fd)
      toast.success('Thêm sách mới vào kho thành công!')
    }
    closeModal()
    fetchSach()
  } catch (err) {
    toast.error(err.message)
  } finally {
    submitting.value = false
  }
}

async function handleDelete(id) {
  const ok = await confirmStore.ask({
    title: 'Xóa sách',
    message: 'Bạn có chắc chắn muốn xóa cuốn sách này khỏi kho dữ liệu?',
    type: 'danger',
    confirmText: 'Xóa sách'
  })
  if (!ok) return
  try {
    await sachService.delete(id)
    toast.success('Đã xóa cuốn sách thành công!')
    fetchSach()
  } catch (err) {
    toast.error(err.message)
  }
}

onMounted(() => {
  fetchSach()
  fetchDropdowns()
})
</script>

