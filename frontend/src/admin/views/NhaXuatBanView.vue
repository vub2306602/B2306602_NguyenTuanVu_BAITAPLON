<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
      <div>
        <h3 class="fw-bold text-success mb-1">Quản Lý Nhà Xuất Bản</h3>
        <p class="text-muted mb-0">Danh sách các đối tác xuất bản sách</p>
      </div>
      <button class="btn btn-primary" @click="openModal()">
        <i class="bi bi-plus-circle me-1"></i> Thêm Nhà Xuất Bản
      </button>
    </div>

    <!-- Thanh tìm kiếm NXB -->
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
              placeholder="Tìm theo mã, tên NXB hoặc địa chỉ..."
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

    <!-- Bảng danh sách NXB -->
    <div class="card border-0 shadow-sm p-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <span class="text-muted small">
          Tổng số: <strong class="text-dark">{{ nxbs.length }}</strong> nhà xuất bản
          <span v-if="searchKeyword" class="ms-1">
            (Lọc theo từ khóa: "<span class="text-success fw-semibold">{{ searchKeyword }}</span>")
          </span>
        </span>
      </div>

      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th style="width: 140px;">Mã NXB</th>
              <th style="width: 220px;">Tên Nhà Xuất Bản</th>
              <th style="width: 180px;" class="text-center">Số Sách Trong Kho</th>
              <th>Địa Chỉ</th>
              <th style="width: 130px;" class="text-end">Hành Động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="nxb in nxbs" :key="nxb._id">
              <td class="fw-bold text-success">{{ nxb.MaNXB }}</td>
              <td class="fw-semibold text-dark">{{ nxb.TenNXB }}</td>
              <td class="text-center">
                <span
                  v-if="nxb.soDauSach > 0"
                  class="badge bg-success bg-opacity-10 text-success border border-success py-1 px-2"
                  :title="`Gồm ${nxb.soDauSach} đầu sách, tổng cộng ${nxb.tongSoQuyen} cuốn trong kho`"
                >
                  <i class="bi bi-book me-1"></i><strong>{{ nxb.soDauSach }}</strong> đầu sách ({{ nxb.tongSoQuyen }} q)
                </span>
                <span v-else class="badge bg-light text-muted border border-secondary border-opacity-25 py-1 px-2">
                  0 cuốn
                </span>
              </td>
              <td class="text-muted">{{ nxb.DiaChi }}</td>
              <td class="text-end">
                <button class="btn btn-sm btn-outline-primary me-2" title="Chỉnh sửa" @click="openModal(nxb)">
                  <i class="bi bi-pencil-square"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" title="Xóa" @click="handleDelete(nxb._id)">
                  <i class="bi bi-trash"></i>
                </button>
              </td>
            </tr>
            <tr v-if="nxbs.length === 0">
              <td colspan="5" class="text-center text-muted py-4">
                {{ loading ? 'Đang tải dữ liệu...' : (searchKeyword ? 'Không tìm thấy nhà xuất bản nào phù hợp với từ khóa.' : 'Chưa có dữ liệu nhà xuất bản.') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Thêm/Sửa NXB -->
    <div v-if="showModal" class="modal-backdrop fade show"></div>
    <div v-if="showModal" class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-success text-white">
            <h5 class="modal-title fw-bold">
              {{ isEditing ? 'Chỉnh Sửa Nhà Xuất Bản' : 'Thêm Nhà Xuất Bản Mới' }}
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
          </div>
          <form @submit.prevent="handleSubmit">
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label fw-semibold">Mã NXB <span class="text-danger">*</span></label>
                <input
                  v-model="form.MaNXB"
                  type="text"
                  class="form-control"
                  placeholder="vd: NXB01"
                  :disabled="isEditing"
                  required
                />
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Tên Nhà Xuất Bản <span class="text-danger">*</span></label>
                <input
                  v-model="form.TenNXB"
                  type="text"
                  class="form-control"
                  placeholder="vd: NXB Kim Đồng"
                  required
                />
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Địa Chỉ <span class="text-danger">*</span></label>
                <input
                  v-model="form.DiaChi"
                  type="text"
                  class="form-control"
                  placeholder="vd: 55 Quang Trung, Hà Nội"
                  required
                />
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
import { nxbService } from '@/shared/services/adminServices'
import { useConfirmStore } from '@/shared/stores/confirm'
import { useToastStore } from '@/shared/stores/toast'

const confirmStore = useConfirmStore()
const toast = useToastStore()

const nxbs = ref([])
const searchKeyword = ref('')
const loading = ref(false)
const showModal = ref(false)
const isEditing = ref(false)
const submitting = ref(false)
const currentId = ref(null)
let debounceTimer = null

const form = ref({
  MaNXB: '',
  TenNXB: '',
  DiaChi: ''
})

async function fetchNXB() {
  loading.value = true
  try {
    const params = {}
    if (searchKeyword.value.trim()) {
      params.keyword = searchKeyword.value.trim()
    }
    const res = await nxbService.getAll(params)
    if (res.success) nxbs.value = res.data
  } catch (err) {
    toast.error(err.message || 'Lỗi khi tải nhà xuất bản')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  clearTimeout(debounceTimer)
  fetchNXB()
}

function handleInput() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    fetchNXB()
  }, 350)
}

function clearSearch() {
  searchKeyword.value = ''
  fetchNXB()
}

function openModal(item = null) {
  if (item) {
    isEditing.value = true
    currentId.value = item._id
    form.value = { ...item }
  } else {
    isEditing.value = false
    currentId.value = null
    form.value = { MaNXB: '', TenNXB: '', DiaChi: '' }
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
      await nxbService.update(currentId.value, form.value)
      toast.success('Cập nhật nhà xuất bản thành công!')
    } else {
      await nxbService.create(form.value)
      toast.success('Thêm nhà xuất bản mới thành công!')
    }
    closeModal()
    fetchNXB()
  } catch (err) {
    toast.error(err.message)
  } finally {
    submitting.value = false
  }
}

async function handleDelete(id) {
  const ok = await confirmStore.ask({
    title: 'Xóa nhà xuất bản',
    message: 'Bạn có chắc chắn muốn xóa nhà xuất bản này? Các cuốn sách liên quan có thể bị ảnh hưởng.',
    type: 'danger',
    confirmText: 'Xóa nhà xuất bản'
  })
  if (!ok) return
  try {
    await nxbService.delete(id)
    toast.success('Đã xóa nhà xuất bản thành công!')
    fetchNXB()
  } catch (err) {
    toast.error(err.message)
  }
}

onMounted(() => {
  fetchNXB()
})
</script>
