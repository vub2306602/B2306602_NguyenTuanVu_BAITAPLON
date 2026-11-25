<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
      <div>
        <h3 class="fw-bold text-success mb-1">Quản Lý Thể Loại Sách</h3>
        <p class="text-muted mb-0">Danh sách phân loại danh mục sách</p>
      </div>
      <button class="btn btn-primary" @click="openModal()">
        <i class="bi bi-plus-circle me-1"></i> Thêm Thể Loại
      </button>
    </div>

    <!-- Thanh tìm kiếm thể loại -->
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
              placeholder="Tìm theo mã, tên hoặc mô tả thể loại..."
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

    <!-- Bảng danh sách thể loại -->
    <div class="card border-0 shadow-sm p-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <span class="text-muted small">
          Tổng số: <strong class="text-dark">{{ theLoais.length }}</strong> thể loại
          <span v-if="searchKeyword" class="ms-1">
            (Lọc theo từ khóa: "<span class="text-success fw-semibold">{{ searchKeyword }}</span>")
          </span>
        </span>
      </div>

      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th style="width: 140px;">Mã Thể Loại</th>
              <th style="width: 220px;">Tên Thể Loại</th>
              <th style="width: 180px;" class="text-center">Số Sách Trong Kho</th>
              <th>Mô Tả</th>
              <th style="width: 130px;" class="text-end">Hành Động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tl in theLoais" :key="tl._id">
              <td class="fw-bold text-success">{{ tl.MaTheLoai }}</td>
              <td class="fw-semibold text-dark">{{ tl.TenTheLoai }}</td>
              <td class="text-center">
                <span
                  v-if="tl.soDauSach > 0"
                  class="badge bg-success bg-opacity-10 text-success border border-success py-1 px-2"
                  :title="`Gồm ${tl.soDauSach} đầu sách, tổng cộng ${tl.tongSoQuyen} cuốn trong kho`"
                >
                  <i class="bi bi-book me-1"></i><strong>{{ tl.soDauSach }}</strong> đầu sách ({{ tl.tongSoQuyen }} q)
                </span>
                <span v-else class="badge bg-light text-muted border border-secondary border-opacity-25 py-1 px-2">
                  0 cuốn
                </span>
              </td>
              <td class="text-muted small">
                <div
                  style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; max-width: 480px; line-height: 1.5;"
                  :title="tl.MoTa"
                >
                  {{ tl.MoTa || '—' }}
                </div>
              </td>
              <td class="text-end">
                <button class="btn btn-sm btn-outline-primary me-2" title="Chỉnh sửa" @click="openModal(tl)">
                  <i class="bi bi-pencil-square"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" title="Xóa" @click="handleDelete(tl._id)">
                  <i class="bi bi-trash"></i>
                </button>
              </td>
            </tr>
            <tr v-if="theLoais.length === 0">
              <td colspan="5" class="text-center text-muted py-4">
                {{ loading ? 'Đang tải dữ liệu...' : (searchKeyword ? 'Không tìm thấy thể loại nào phù hợp với từ khóa.' : 'Chưa có dữ liệu thể loại.') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Thêm/Sửa Thể Loại -->
    <div v-if="showModal" class="modal-backdrop fade show"></div>
    <div v-if="showModal" class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-success text-white">
            <h5 class="modal-title fw-bold">
              {{ isEditing ? 'Chỉnh Sửa Thể Loại' : 'Thêm Thể Loại Mới' }}
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
          </div>
          <form @submit.prevent="handleSubmit">
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label fw-semibold">Mã Thể Loại <span class="text-danger">*</span></label>
                <input
                  v-model="form.MaTheLoai"
                  type="text"
                  class="form-control"
                  placeholder="vd: TL01"
                  :disabled="isEditing"
                  required
                />
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Tên Thể Loại <span class="text-danger">*</span></label>
                <input
                  v-model="form.TenTheLoai"
                  type="text"
                  class="form-control"
                  placeholder="vd: Công nghệ thông tin"
                  required
                />
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Mô Tả</label>
                <textarea
                  v-model="form.MoTa"
                  rows="3"
                  class="form-control"
                  placeholder="Mô tả tóm tắt..."
                ></textarea>
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { theLoaiService } from '@/shared/services/adminServices'
import { useConfirmStore } from '@/shared/stores/confirm'
import { useToastStore } from '@/shared/stores/toast'

const confirmStore = useConfirmStore()
const toast = useToastStore()

const theLoais = ref([])
const searchKeyword = ref('')
const loading = ref(false)
const showModal = ref(false)
const isEditing = ref(false)
const submitting = ref(false)
const currentId = ref(null)
let debounceTimer = null

const form = ref({
  MaTheLoai: '',
  TenTheLoai: '',
  MoTa: ''
})

async function fetchTheLoai() {
  loading.value = true
  try {
    const params = {}
    if (searchKeyword.value.trim()) {
      params.keyword = searchKeyword.value.trim()
    }
    const res = await theLoaiService.getAll(params)
    if (res.success) theLoais.value = res.data
  } catch (err) {
    toast.error(err.message || 'Lỗi khi tải thể loại')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  clearTimeout(debounceTimer)
  fetchTheLoai()
}

function handleInput() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    fetchTheLoai()
  }, 350)
}

function clearSearch() {
  searchKeyword.value = ''
  fetchTheLoai()
}

function openModal(item = null) {
  if (item) {
    isEditing.value = true
    currentId.value = item._id
    form.value = { ...item }
  } else {
    isEditing.value = false
    currentId.value = null
    form.value = { MaTheLoai: '', TenTheLoai: '', MoTa: '' }
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

async function handleSubmit() {
  submitting.value = true
  try {
    if (isEditing.value) {
      await theLoaiService.update(currentId.value, form.value)
      toast.success('Cập nhật thông tin thể loại thành công!')
    } else {
      await theLoaiService.create(form.value)
      toast.success('Thêm thể loại mới thành công!')
    }
    closeModal()
    fetchTheLoai()
  } catch (err) {
    toast.error(err.message)
  } finally {
    submitting.value = false
  }
}

async function handleDelete(id) {
  const ok = await confirmStore.ask({
    title: 'Xóa thể loại',
    message: 'Bạn có chắc chắn muốn xóa thể loại này? Sách thuộc thể loại này có thể bị ảnh hưởng.',
    type: 'danger',
    confirmText: 'Xóa thể loại'
  })
  if (!ok) return
  try {
    await theLoaiService.delete(id)
    toast.success('Đã xóa thể loại thành công!')
    fetchTheLoai()
  } catch (err) {
    toast.error(err.message)
  }
}

onMounted(() => {
  fetchTheLoai()
})
</script>
