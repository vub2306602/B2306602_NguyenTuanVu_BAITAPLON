<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
      <div>
        <h3 class="fw-bold text-success mb-1">Quản Lý Tác Giả</h3>
        <p class="text-muted mb-0">Danh sách tác giả và thông tin tiểu sử</p>
      </div>
      <button class="btn btn-primary" @click="openModal()">
        <i class="bi bi-plus-circle me-1"></i> Thêm Tác Giả
      </button>
    </div>

    <!-- Thanh tìm kiếm -->
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
              placeholder="Tìm theo mã hoặc tên tác giả..."
              @keyup.enter="handleSearch"
            />
            <button
              v-if="searchKeyword"
              class="btn btn-outline-secondary"
              type="button"
              @click="clearSearch"
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

    <!-- Bảng danh sách tác giả -->
    <div class="card border-0 shadow-sm p-4">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th style="width: 140px;">Mã Tác Giả</th>
              <th style="width: 220px;">Tên Tác Giả</th>
              <th style="width: 180px;" class="text-center">Số Sách Trong Kho</th>
              <th>Tiểu Sử / Mô Tả</th>
              <th style="width: 130px;" class="text-end">Hành Động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tg in tacGias" :key="tg._id">
              <td class="fw-bold text-success">{{ tg.MaTacGia }}</td>
              <td class="fw-semibold text-dark">{{ tg.TenTacGia }}</td>
              <td class="text-center">
                <span
                  v-if="tg.soDauSach > 0"
                  class="badge bg-success bg-opacity-10 text-success border border-success py-1 px-2"
                  :title="`Gồm ${tg.soDauSach} đầu sách, tổng cộng ${tg.tongSoQuyen} cuốn trong kho`"
                >
                  <i class="bi bi-book me-1"></i><strong>{{ tg.soDauSach }}</strong> đầu sách ({{ tg.tongSoQuyen }} q)
                </span>
                <span v-else class="badge bg-light text-muted border border-secondary border-opacity-25 py-1 px-2">
                  0 cuốn
                </span>
              </td>
              <td class="text-muted small">
                <div
                  style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; max-width: 480px; line-height: 1.5;"
                  :title="tg.MoTa"
                >
                  {{ tg.MoTa || '—' }}
                </div>
              </td>
              <td class="text-end">
                <button
                  class="btn btn-sm btn-outline-primary me-2"
                  title="Chỉnh sửa"
                  @click="openModal(tg)"
                >
                  <i class="bi bi-pencil-square"></i>
                </button>
                <button
                  class="btn btn-sm btn-outline-danger"
                  title="Xóa tác giả"
                  @click="handleDelete(tg)"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </td>
            </tr>
            <tr v-if="tacGias.length === 0">
              <td colspan="5" class="text-center text-muted py-4">
                {{ loading ? 'Đang tải dữ liệu...' : 'Không tìm thấy tác giả nào.' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Thêm/Sửa Tác Giả -->
    <div v-if="showModal" class="modal-backdrop fade show"></div>
    <div v-if="showModal" class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-success text-white">
            <h5 class="modal-title fw-bold">
              {{ isEditing ? 'Chỉnh Sửa Tác Giả' : 'Thêm Tác Giả Mới' }}
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
          </div>
          <form @submit.prevent="handleSubmit">
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label fw-semibold">Mã Tác Giả <span class="text-danger">*</span></label>
                <input
                  v-model="form.MaTacGia"
                  type="text"
                  class="form-control"
                  placeholder="vd: TG001"
                  :disabled="isEditing"
                  required
                />
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Tên Tác Giả <span class="text-danger">*</span></label>
                <input
                  v-model="form.TenTacGia"
                  type="text"
                  class="form-control"
                  placeholder="vd: Nam Cao"
                  required
                />
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Tiểu Sử / Mô Tả</label>
                <textarea
                  v-model="form.MoTa"
                  rows="3"
                  class="form-control"
                  placeholder="Thông tin tóm tắt về tác giả..."
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
import { tacGiaService } from '@/shared/services/adminServices'
import { useConfirmStore } from '@/shared/stores/confirm'
import { useToastStore } from '@/shared/stores/toast'

const confirmStore = useConfirmStore()
const toast = useToastStore()

const tacGias = ref([])
const loading = ref(false)
const searchKeyword = ref('')
const showModal = ref(false)
const isEditing = ref(false)
const submitting = ref(false)
const currentId = ref(null)

const form = ref({
  MaTacGia: '',
  TenTacGia: '',
  MoTa: ''
})

async function fetchTacGia() {
  loading.value = true
  try {
    const params = {}
    if (searchKeyword.value.trim()) {
      params.keyword = searchKeyword.value.trim()
    }
    const res = await tacGiaService.getAll(params)
    if (res.success) {
      tacGias.value = res.data
    }
  } catch (err) {
    toast.error(err.message || 'Không thể tải danh sách tác giả')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  fetchTacGia()
}

function clearSearch() {
  searchKeyword.value = ''
  fetchTacGia()
}

function openModal(item = null) {
  if (item) {
    isEditing.value = true
    currentId.value = item._id
    form.value = { ...item }
  } else {
    isEditing.value = false
    currentId.value = null
    form.value = { MaTacGia: '', TenTacGia: '', MoTa: '' }
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
      await tacGiaService.update(currentId.value, form.value)
      toast.success('Cập nhật thông tin tác giả thành công!')
    } else {
      await tacGiaService.create(form.value)
      toast.success('Thêm tác giả mới thành công!')
    }
    closeModal()
    fetchTacGia()
  } catch (err) {
    toast.error(err.message || 'Lỗi xử lý')
  } finally {
    submitting.value = false
  }
}

async function handleDelete(item) {
  const ok = await confirmStore.ask({
    title: 'Xóa tác giả',
    message: `Bạn có chắc chắn muốn xóa tác giả "${item.TenTacGia}" (${item.MaTacGia})? Lưu ý: Nếu tác giả đang có sách trong thư viện thì hệ thống sẽ chặn xóa.`,
    type: 'danger',
    confirmText: 'Xóa tác giả'
  })
  if (!ok) return
  try {
    await tacGiaService.delete(item._id)
    toast.success('Đã xóa tác giả thành công!')
    fetchTacGia()
  } catch (err) {
    toast.error(err.message || 'Không thể xóa tác giả')
  }
}

onMounted(() => {
  fetchTacGia()
})
</script>
