<template>
  <div v-if="book" class="row g-4">
    <!-- Cột ảnh bìa lớn -->
    <div class="col-md-5 col-lg-4 text-center">
      <div class="card border-0 shadow-sm p-3 bg-white d-flex align-items-center justify-content-center h-100" style="min-height: 440px;">
        <img
          v-if="book.HinhAnhUrl"
          :src="book.HinhAnhUrl"
          class="img-fluid rounded shadow-sm"
          style="max-height: 480px; max-width: 100%; width: auto; height: auto; object-fit: contain;"
          :alt="book.TenSach"
        />
        <div
          v-else
          class="bg-light text-muted d-flex align-items-center justify-content-center rounded w-100"
          style="aspect-ratio: 3/4; font-size: 5rem;"
        >
          <i class="bi bi-book text-warning"></i>
        </div>
      </div>
    </div>

    <!-- Cột thông tin chi tiết & nút mượn sách -->
    <div class="col-md-7 col-lg-8">
      <div class="card border-0 shadow-sm p-4 bg-white h-100">
        <div class="mb-2">
          <span
            class="badge bg-warning text-dark me-2 fs-6"
            style="cursor: pointer;"
            role="button"
            @click="openCategoryModal"
            title="Nhấn để xem mô tả thể loại"
          >{{ categoryName }}</span>
          <span class="badge" :class="book.SoQuyen > 0 ? 'bg-success' : 'bg-danger'">
            {{ book.SoQuyen > 0 ? `Còn ${book.SoQuyen} cuốn trong kho` : 'Hết sách' }}
          </span>
        </div>

        <h2 class="fw-bold text-dark mb-3">{{ book.TenSach }}</h2>

        <div class="row g-3 mb-4 text-muted">
          <div class="col-sm-6">
            <i class="bi bi-person-fill text-warning me-2"></i>
            <strong>Tác giả:</strong>
            <button
              type="button"
              class="btn btn-link p-0 ms-1 text-decoration-none fw-bold text-dark text-hover-warning border-0 bg-transparent align-baseline author-btn"
              @click="openAuthorModal"
              title="Nhấn để xem tiểu sử và thông tin tác giả"
            >
              <span class="text-decoration-underline">{{ authorName }}</span>
              <i class="bi bi-info-circle ms-1 text-warning" style="font-size: 0.85rem;"></i>
            </button>
          </div>
          <div class="col-sm-6">
            <i class="bi bi-building text-warning me-2"></i>
            <strong>Nhà xuất bản:</strong> {{ publisherName }}
          </div>
          <div class="col-sm-6">
            <i class="bi bi-calendar-event text-warning me-2"></i>
            <strong>Năm xuất bản:</strong> {{ book.NamXuatBan || 'Đang cập nhật' }}
          </div>
          <div class="col-sm-6">
            <i class="bi bi-qr-code text-warning me-2"></i>
            <strong>Mã sách:</strong> {{ book.MaSach }}
          </div>
        </div>

        <div class="p-3 bg-light rounded-3 mb-4">
          <h5 class="fw-bold text-danger mb-0">Đơn giá tham khảo: {{ formatPrice(book.DonGia) }} VNĐ</h5>
        </div>

        <div class="mb-4">
          <h5 class="fw-bold text-dark mb-2">Tóm Tắt Nội Dung</h5>
          <p class="text-secondary lh-lg mb-0" style="white-space: pre-line;">
            {{ book.MoTa || 'Hiện chưa có phần tóm tắt cho cuốn sách này.' }}
          </p>
        </div>

        <!-- Khối Đặt Mượn Sách & Giỏ Hàng -->
        <div class="mt-auto pt-3 border-top">
          <!-- Cảnh báo nếu đang có sách quá hạn -->
          <div v-if="authStore.isAuthenticated && cartStore.isOverdue" class="alert alert-danger d-flex align-items-center mb-3 rounded-3 shadow-xs">
            <i class="bi bi-exclamation-triangle-fill fs-4 text-danger me-3"></i>
            <div class="small">
              <strong>Tài khoản có sách quá hạn!</strong> Bạn cần hoàn trả các sách đang quá hạn cho thư viện trước khi có thể thêm vào giỏ mượn hoặc đặt mượn mới.
            </div>
          </div>

          <!-- Nếu hết sách -->
          <div v-else-if="book.SoQuyen <= 0" class="alert alert-secondary d-flex align-items-center mb-0 rounded-3">
            <i class="bi bi-x-circle-fill fs-4 text-secondary me-3"></i>
            <div>
              <strong>Tạm hết sách!</strong> Cuốn sách này hiện tại đã hết số lượng tồn kho. Vui lòng quay lại sau khi có độc giả hoàn trả.
            </div>
          </div>

          <!-- Còn sách -->
          <div v-else>
            <div class="d-flex align-items-center gap-3 mb-3 flex-wrap">
              <div class="d-flex align-items-center gap-2">
                <label class="form-label mb-0 fw-semibold small text-muted">Số lượng mượn:</label>
                <div class="input-group input-group-sm" style="width: 110px;">
                  <button
                    class="btn btn-outline-secondary"
                    type="button"
                    :disabled="quantity <= 1"
                    @click="quantity = Math.max(1, quantity - 1)"
                  >
                    <i class="bi bi-dash"></i>
                  </button>
                  <input
                    v-model.number="quantity"
                    type="number"
                    class="form-control text-center fw-bold"
                    min="1"
                    :max="Math.min(book.SoQuyen, cartStore.maxAllowed)"
                  />
                  <button
                    class="btn btn-outline-secondary"
                    type="button"
                    :disabled="quantity >= book.SoQuyen || quantity >= cartStore.maxAllowed"
                    @click="quantity++"
                  >
                    <i class="bi bi-plus"></i>
                  </button>
                </div>
              </div>

              <span class="small text-muted">
                (Kho còn: <strong class="text-dark">{{ book.SoQuyen }}</strong> bản - Tối đa mượn: <strong class="text-success">{{ cartStore.maxAllowed }}</strong> quyển)
              </span>
            </div>

            <div class="d-flex align-items-center gap-2 flex-wrap">
              <!-- Nút Thêm Vào Giỏ Mượn -->
              <button
                class="btn btn-warning px-4 py-2 fw-bold shadow-sm rounded-pill"
                :disabled="cartStore.isOverdue || book.SoQuyen <= 0"
                @click="handleAddToCart"
              >
                <i class="bi bi-cart-plus-fill me-1"></i> Thêm Vào Giỏ Mượn
              </button>

              <!-- Nút Đặt Mượn Ngay -->
              <button
                class="btn btn-outline-dark px-4 py-2 fw-bold rounded-pill"
                :disabled="cartStore.isOverdue || book.SoQuyen <= 0 || isSubmitting"
                @click="handleDatMuonNgay"
              >
                <i class="bi bi-bookmark-check-fill me-1"></i>
                {{ isSubmitting ? 'Đang gửi...' : 'Đặt Mượn Ngay' }}
              </button>
            </div>

            <div class="small text-muted mt-2">
              <i class="bi bi-clock-history me-1"></i> Hạn mượn tối đa 14 ngày kể từ khi được thủ thư xét duyệt.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="text-center py-5">
    <div class="spinner-border text-warning" role="status">
      <span class="visually-hidden">Đang tải...</span>
    </div>
  </div>

  <!-- Modal Thông Tin Tác Giả -->
  <div
    v-if="showAuthorModal"
    class="modal fade show d-block"
    tabindex="-1"
    style="background: rgba(0, 0, 0, 0.55); backdrop-filter: blur(2px);"
    @click.self="showAuthorModal = false"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content border-0 shadow rounded-4 overflow-hidden">
        <div class="modal-header bg-warning bg-opacity-10 border-bottom border-warning border-opacity-25 py-3">
          <div class="d-flex align-items-center gap-2">
            <div class="p-2 bg-warning text-dark rounded-circle d-flex align-items-center justify-content-center" style="width: 36px; height: 36px;">
              <i class="bi bi-person-fill fs-5"></i>
            </div>
            <div>
              <h5 class="modal-title fw-bold text-dark mb-0">Thông Tin Tác Giả</h5>
              <small class="text-muted">Hồ sơ tác giả trong thư viện</small>
            </div>
          </div>
          <button
            type="button"
            class="btn-close"
            aria-label="Close"
            @click="showAuthorModal = false"
          ></button>
        </div>

        <div class="modal-body p-4">
          <div class="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
            <div>
              <h4 class="fw-bold text-dark mb-1">{{ authorName }}</h4>
              <span v-if="authorInfo?.MaTacGia" class="badge bg-light text-dark border">
                Mã tác giả: {{ authorInfo.MaTacGia }}
              </span>
            </div>
          </div>

          <div class="mb-2">
            <label class="fw-semibold text-dark small text-uppercase mb-2 d-block text-muted">
              <i class="bi bi-file-earmark-person me-1"></i> Tiểu Sử / Giới Thiệu
            </label>
            <div
              v-if="authorInfo?.MoTa"
              class="p-3 bg-light rounded-3 text-secondary lh-lg"
              style="white-space: pre-line; max-height: 280px; overflow-y: auto;"
            >
              {{ authorInfo.MoTa }}
            </div>
            <div v-else class="alert alert-light border text-muted small py-3 mb-0">
              <i class="bi bi-info-circle me-1"></i> Hiện chưa có phần tiểu sử chi tiết của tác giả này.
            </div>
          </div>
        </div>

        <div class="modal-footer bg-light border-0 py-3 d-flex justify-content-between">
          <button
            type="button"
            class="btn btn-warning btn-sm fw-semibold text-dark"
            @click="searchByAuthor"
          >
            <i class="bi bi-search me-1"></i> Xem các sách của tác giả này
          </button>
          <button
            type="button"
            class="btn btn-secondary btn-sm px-3"
            @click="showAuthorModal = false"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal Thông Tin Thể Loại -->
  <div
    v-if="showCategoryModal"
    class="modal fade show d-block"
    tabindex="-1"
    style="background: rgba(0, 0, 0, 0.55); backdrop-filter: blur(2px);"
    @click.self="showCategoryModal = false"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content border-0 shadow rounded-4 overflow-hidden">
        <div class="modal-header bg-warning bg-opacity-10 border-bottom border-warning border-opacity-25 py-3">
          <div class="d-flex align-items-center gap-2">
            <div class="p-2 bg-warning text-dark rounded-circle d-flex align-items-center justify-content-center" style="width: 36px; height: 36px;">
              <i class="bi bi-tag-fill fs-5"></i>
            </div>
            <div>
              <h5 class="modal-title fw-bold text-dark mb-0">Thông Tin Thể Loại</h5>
              <small class="text-muted">Chi tiết mô tả thể loại sách</small>
            </div>
          </div>
          <button
            type="button"
            class="btn-close"
            aria-label="Close"
            @click="showCategoryModal = false"
          ></button>
        </div>

        <div class="modal-body p-4">
          <div class="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
            <div>
              <h4 class="fw-bold text-dark mb-1">{{ categoryName }}</h4>
              <span v-if="categoryInfo?.MaTheLoai" class="badge bg-light text-dark border">
                Mã thể loại: {{ categoryInfo.MaTheLoai }}
              </span>
            </div>
          </div>

          <div class="mb-2">
            <label class="fw-semibold text-dark small text-uppercase mb-2 d-block text-muted">
              <i class="bi bi-card-text me-1"></i> Mô Tả / Nội Dung Thể Loại
            </label>
            <div
              v-if="categoryInfo?.MoTa"
              class="p-3 bg-light rounded-3 text-secondary lh-lg"
              style="white-space: pre-line; max-height: 280px; overflow-y: auto;"
            >
              {{ categoryInfo.MoTa }}
            </div>
            <div v-else class="alert alert-light border text-muted small py-3 mb-0">
              <i class="bi bi-info-circle me-1"></i> Hiện chưa có phần mô tả chi tiết cho thể loại này.
            </div>
          </div>
        </div>

        <div class="modal-footer bg-light border-0 py-3 d-flex justify-content-between">
          <button
            type="button"
            class="btn btn-warning btn-sm fw-semibold text-dark"
            @click="searchByCategory"
          >
            <i class="bi bi-grid me-1"></i> Xem các sách thuộc thể loại này
          </button>
          <button
            type="button"
            class="btn btn-secondary btn-sm px-3"
            @click="showCategoryModal = false"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { clientBookService, clientBorrowService } from '@/shared/services/clientServices'
import { useClientAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'
import { useToastStore } from '@/shared/stores/toast'
import { useConfirmStore } from '@/shared/stores/confirm'

const route = useRoute()
const router = useRouter()
const authStore = useClientAuthStore()
const cartStore = useCartStore()
const toast = useToastStore()
const confirmStore = useConfirmStore()

const book = ref(null)
const publishers = ref([])
const categories = ref([])
const quantity = ref(1)
const isSubmitting = ref(false)
const showAuthorModal = ref(false)
const detailedAuthor = ref(null)
const showCategoryModal = ref(false)
const detailedCategory = ref(null)

const publisherName = computed(() => {
  if (!book.value) return 'Chưa rõ'
  if (book.value.TenNXB) return book.value.TenNXB
  if (book.value.NhaXuatBan?.TenNXB) return book.value.NhaXuatBan.TenNXB
  if (publishers.value.length && book.value.MaNXB) {
    const found = publishers.value.find(p => p.MaNXB === book.value.MaNXB)
    if (found?.TenNXB) return found.TenNXB
  }
  return book.value.MaNXB || 'Chưa rõ'
})

const authorName = computed(() => {
  if (!book.value) return 'Chưa rõ'
  if (detailedAuthor.value?.TenTacGia) return detailedAuthor.value.TenTacGia
  if (book.value.TenTacGia) return book.value.TenTacGia
  if (book.value.TacGiaInfo?.TenTacGia) return book.value.TacGiaInfo.TenTacGia
  return book.value.TacGia || 'Chưa rõ'
})

const authorInfo = computed(() => {
  return detailedAuthor.value || book.value?.TacGiaInfo || null
})

async function openAuthorModal() {
  showAuthorModal.value = true
  if (!detailedAuthor.value && book.value) {
    try {
      const keyword = book.value.TacGia || authorName.value
      if (keyword && keyword !== 'Chưa rõ') {
        const res = await clientBookService.getAuthors({ keyword })
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const found = res.data.find(
            t => t.MaTacGia === book.value.TacGia || t.TenTacGia === authorName.value
          ) || res.data[0]
          if (found) {
            detailedAuthor.value = found
          }
        }
      }
    } catch (e) {
      // Fallback dùng TacGiaInfo có sẵn
    }
  }
}

function searchByAuthor() {
  showAuthorModal.value = false
  if (authorName.value && authorName.value !== 'Chưa rõ') {
    router.push({
      path: '/sach',
      query: { keyword: authorName.value }
    })
  }
}

const categoryName = computed(() => {
  if (!book.value) return 'Chưa phân loại'
  if (book.value.TenTheLoai) return book.value.TenTheLoai
  if (book.value.TheLoai?.TenTheLoai) return book.value.TheLoai.TenTheLoai
  if (categories.value.length && book.value.MaTheLoai) {
    const found = categories.value.find(c => c.MaTheLoai === book.value.MaTheLoai)
    if (found?.TenTheLoai) return found.TenTheLoai
  }
  return book.value.MaTheLoai || 'Chưa phân loại'
})

const categoryInfo = computed(() => {
  if (detailedCategory.value) return detailedCategory.value
  if (book.value?.TheLoai) return book.value.TheLoai
  if (categories.value.length && book.value?.MaTheLoai) {
    const found = categories.value.find(c => c.MaTheLoai === book.value.MaTheLoai)
    if (found) return found
  }
  return null
})

async function openCategoryModal() {
  showCategoryModal.value = true
  if (!detailedCategory.value && book.value) {
    const maTL = book.value.MaTheLoai || book.value.TheLoai?.MaTheLoai
    if (maTL) {
      if (categories.value.length === 0) {
        try {
          const res = await clientBookService.getCategories()
          if (res.success && Array.isArray(res.data)) {
            categories.value = res.data
          }
        } catch (e) {}
      }
      const found = categories.value.find(c => c.MaTheLoai === maTL)
      if (found) {
        detailedCategory.value = found
      }
    }
  }
}

function searchByCategory() {
  showCategoryModal.value = false
  const maTL = categoryInfo.value?.MaTheLoai || book.value?.MaTheLoai
  if (maTL) {
    router.push({
      path: '/sach',
      query: { theloai: maTL }
    })
  }
}

function formatPrice(val) {
  if (!val) return '0'
  return val.toLocaleString('vi-VN')
}

async function loadBookDetail() {
  try {
    const [resBook, resPub, resCat] = await Promise.allSettled([
      clientBookService.getById(route.params.id),
      clientBookService.getPublishers(),
      clientBookService.getCategories(),
    ])
    if (resBook.status === 'fulfilled' && resBook.value.success) {
      book.value = resBook.value.data
    }
    if (resPub.status === 'fulfilled' && resPub.value.success) {
      publishers.value = resPub.value.data || []
    }
    if (resCat.status === 'fulfilled' && resCat.value.success) {
      categories.value = resCat.value.data || []
    }
  } catch (err) {
    toast.error('Không tìm thấy thông tin cuốn sách.')
    router.push('/sach')
  }
}

function handleAddToCart() {
  if (cartStore.isOverdue) {
    toast.error('Bạn đang có sách quá hạn chưa hoàn trả! Không thể thêm vào giỏ mượn.')
    return
  }
  const added = cartStore.addItem(book.value, quantity.value)
  if (added) {
    quantity.value = 1
  }
}

async function handleDatMuonNgay() {
  if (!authStore.isAuthenticated) {
    toast.info('Vui lòng đăng nhập tài khoản độc giả để mượn sách.')
    router.push({
      path: '/login',
      query: { redirect: route.fullPath }
    })
    return
  }

  if (cartStore.isOverdue) {
    toast.error('Bạn đang có sách mượn quá hạn chưa hoàn trả! Vui lòng hoàn trả trước khi mượn tiếp.')
    return
  }

  if (quantity.value > cartStore.maxAllowed) {
    toast.warning(`Bạn chỉ có thể mượn thêm tối đa ${cartStore.maxAllowed} quyển sách!`)
    return
  }

  const ok = await confirmStore.ask({
    title: 'Xác nhận đặt mượn sách',
    message: `Bạn có chắc muốn gửi yêu cầu mượn ${quantity.value} quyển sách "${book.value.TenSach}"?`,
    type: 'primary',
    confirmText: 'Xác nhận mượn'
  })
  if (!ok) return

  isSubmitting.value = true
  try {
    // Nếu mượn 1 hoặc nhiều cuốn
    const payload = {
      items: [{ MaSach: book.value.MaSach, SoLuong: quantity.value }],
      GhiChu: 'Độc giả đặt mượn trực tiếp từ trang chi tiết'
    }
    const res = await clientBorrowService.datMuonGioHang(payload)
    toast.success(res.message || 'Đặt mượn thành công! Vui lòng chờ thủ thư phê duyệt.')
    await cartStore.fetchBorrowStatus()
    router.push('/lich-su')
  } catch (err) {
    toast.error(err.message)
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  loadBookDetail()
  if (authStore.isAuthenticated) {
    cartStore.fetchBorrowStatus()
  }
})
</script>

<style scoped>
.author-btn:hover {
  color: #d97706 !important;
}
.author-btn:hover .bi-info-circle {
  transform: scale(1.15);
  transition: transform 0.2s ease;
}
</style>

