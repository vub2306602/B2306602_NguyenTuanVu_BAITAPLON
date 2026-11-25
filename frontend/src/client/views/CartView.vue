<template>
  <div class="cart-view py-3">
    <!-- Header -->
    <div class="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
      <div>
        <h2 class="fw-bold mb-1 d-flex align-items-center gap-2">
          <i class="bi bi-cart3 text-warning"></i> Giỏ Sách Đặt Mượn
        </h2>
        <p class="text-muted mb-0 small">
          Tối đa 5 quyển sách cho mỗi độc giả (bao gồm cả các sách đang mượn/chờ duyệt).
        </p>
      </div>
      <router-link to="/sach" class="btn btn-outline-dark rounded-pill fw-semibold btn-sm px-3">
        <i class="bi bi-arrow-left me-1"></i> Tiếp tục chọn sách
      </router-link>
    </div>

    <!-- Alert Quá Hạn -->
    <div v-if="authStore.isAuthenticated && cartStore.isOverdue" class="alert alert-danger rounded-4 p-3 mb-4 d-flex align-items-center shadow-sm">
      <i class="bi bi-exclamation-octagon-fill fs-2 text-danger me-3"></i>
      <div>
        <div class="fw-bold fs-6">Tài khoản có sách quá hạn chưa hoàn trả!</div>
        <div class="small">
          Bạn đang có phiếu mượn sách quá hạn với thư viện. Vui lòng hoàn trả các sách quá hạn trước khi có thể gửi yêu cầu mượn sách mới.
        </div>
      </div>
    </div>

    <!-- Hạn Mức Mượn Thư Viện -->
    <div class="card border-0 shadow-sm rounded-4 mb-4 bg-white quota-card">
      <div class="card-body p-3 p-md-4">
        <div class="row align-items-center g-3">
          <div class="col-md-7">
            <div class="d-flex align-items-center gap-2 mb-2">
              <span class="badge bg-warning text-dark fw-bold px-3 py-2 rounded-pill">
                <i class="bi bi-shield-check me-1"></i> Hạn Mức Mượn
              </span>
              <span v-if="authStore.isAuthenticated" class="text-muted small">
                Độc giả: <strong>{{ authStore.user?.HoLot }} {{ authStore.user?.Ten }}</strong>
              </span>
              <span v-else class="text-muted small">
                (Chưa đăng nhập — đăng nhập để kiểm tra số sách đang mượn)
              </span>
            </div>
            <div class="text-secondary small">
              Số lượng trong giỏ: <strong>{{ cartStore.totalCount }}</strong> / Còn được mượn thêm:
              <strong class="text-success fs-6">{{ cartStore.maxAllowed }}</strong> quyển
              (Đang giữ: <strong>{{ cartStore.borrowStatus.dangMuonCount }}</strong>/5 quyển)
            </div>
          </div>
          <div class="col-md-5">
            <div class="progress" style="height: 12px; border-radius: 6px;">
              <div
                class="progress-bar bg-warning progress-bar-striped progress-bar-animated"
                role="progressbar"
                :style="{ width: `${quotaPercent}%` }"
              ></div>
            </div>
            <div class="d-flex justify-content-between text-muted small mt-1">
              <span>Đang giữ: {{ cartStore.borrowStatus.dangMuonCount }}</span>
              <span>Trong giỏ: {{ cartStore.totalCount }}</span>
              <span>Tối đa: 5 quyển</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="cartStore.items.length === 0" class="card border-0 shadow-sm rounded-4 p-5 text-center my-4 bg-white">
      <div class="empty-icon mx-auto mb-3">
        <i class="bi bi-cart-x text-muted"></i>
      </div>
      <h4 class="fw-bold text-dark mb-2">Giỏ mượn sách đang trống</h4>
      <p class="text-muted mx-auto mb-4" style="max-width: 420px;">
        Bạn chưa chọn cuốn sách nào vào giỏ mượn. Hãy dạo quanh kho sách để tìm những tựa sách yêu thích nhé!
      </p>
      <div>
        <router-link to="/sach" class="btn btn-warning rounded-pill px-4 py-2 fw-semibold shadow-sm">
          <i class="bi bi-journals me-1"></i> Khám Phá Kho Sách
        </router-link>
      </div>
    </div>

    <!-- Items List & Checkout -->
    <div v-else class="row g-4">
      <!-- Items table -->
      <div class="col-lg-8">
        <div class="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div class="table-responsive">
            <table class="table align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th class="ps-4">Cuốn Sách</th>
                  <th class="text-center" style="width: 140px;">Số Lượng</th>
                  <th class="text-center" style="width: 110px;">Kho Còn</th>
                  <th class="text-end pe-4" style="width: 80px;">Xóa</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in cartStore.items" :key="item.book.MaSach">
                  <td class="ps-4 py-3">
                    <div class="d-flex align-items-center gap-3">
                      <img
                        :src="item.book.HinhAnhUrl || 'https://placehold.co/80x110?text=Sach'"
                        :alt="item.book.TenSach"
                        class="rounded-3 shadow-xs"
                        style="width: 55px; height: 75px; object-fit: contain; background-color: #f8fafc;"
                      />
                      <div>
                        <router-link :to="`/sach/${item.book.MaSach}`" class="fw-bold text-dark text-decoration-none hover-primary d-block">
                          {{ item.book.TenSach }}
                        </router-link>
                        <div class="text-muted small">
                          <i class="bi bi-person me-1"></i> {{ item.book.TenTacGia || item.book.TacGia || 'Đang cập nhật' }}
                        </div>
                        <div class="text-muted small">
                          Mã: <code class="text-secondary">{{ item.book.MaSach }}</code>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="text-center">
                    <div class="input-group input-group-sm quantity-group mx-auto">
                      <button
                        class="btn btn-outline-secondary"
                        type="button"
                        @click="changeQuantity(item.book.MaSach, item.quantity - 1)"
                      >
                        <i class="bi bi-dash"></i>
                      </button>
                      <input
                        type="number"
                        class="form-control text-center fw-bold"
                        :value="item.quantity"
                        min="1"
                        :max="item.book.SoQuyen"
                        @change="(e) => changeQuantity(item.book.MaSach, e.target.value)"
                      />
                      <button
                        class="btn btn-outline-secondary"
                        type="button"
                        :disabled="item.quantity >= item.book.SoQuyen || cartStore.totalCount >= cartStore.maxAllowed"
                        @click="changeQuantity(item.book.MaSach, item.quantity + 1)"
                      >
                        <i class="bi bi-plus"></i>
                      </button>
                    </div>
                  </td>
                  <td class="text-center">
                    <span class="badge bg-light text-dark border">
                      {{ item.book.SoQuyen }} bản
                    </span>
                  </td>
                  <td class="text-end pe-4">
                    <button
                      type="button"
                      class="btn btn-outline-danger btn-sm rounded-circle p-1"
                      title="Xóa cuốn này"
                      @click="handleRemove(item.book.MaSach, item.book.TenSach)"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="p-3 bg-light border-top d-flex justify-content-between align-items-center">
            <button
              type="button"
              class="btn btn-outline-secondary btn-sm rounded-pill px-3"
              @click="handleClearCart"
            >
              <i class="bi bi-trash3 me-1"></i> Làm trống giỏ
            </button>
            <span class="small text-muted">
              Tổng số sách trong giỏ: <strong class="text-dark">{{ cartStore.totalCount }} quyển</strong>
            </span>
          </div>
        </div>

        <!-- Ghi chú mượn sách -->
        <div class="card border-0 shadow-sm rounded-4 mt-3 p-3 bg-white">
          <label class="form-label fw-bold small text-secondary mb-1">
            <i class="bi bi-chat-left-text me-1"></i> Ghi chú cho thủ thư (tùy chọn):
          </label>
          <textarea
            v-model="ghiChu"
            rows="2"
            class="form-control"
            placeholder="Ví dụ: Cần mượn để nghiên cứu môn học, lấy sách vào sáng thứ Hai..."
          ></textarea>
        </div>
      </div>

      <!-- Checkout summary box -->
      <div class="col-lg-4">
        <div class="card border-0 shadow-sm rounded-4 p-4 bg-white sticky-top" style="top: 20px;">
          <h5 class="fw-bold mb-3 text-dark">Tóm Tắt Yêu Cầu Mượn</h5>

          <div class="d-flex justify-content-between py-2 border-bottom small">
            <span class="text-muted">Tổng số tựa sách:</span>
            <span class="fw-semibold">{{ cartStore.totalUniqueBooks }} cuốn</span>
          </div>

          <div class="d-flex justify-content-between py-2 border-bottom small">
            <span class="text-muted">Tổng số quyển mượn:</span>
            <span class="fw-bold fs-6 text-primary">{{ cartStore.totalCount }} quyển</span>
          </div>

          <div class="d-flex justify-content-between py-2 border-bottom small">
            <span class="text-muted">Hạn mượn tối đa:</span>
            <span class="fw-semibold text-success">14 ngày</span>
          </div>

          <div class="d-flex justify-content-between py-2 border-bottom small">
            <span class="text-muted">Phí mượn thư viện:</span>
            <span class="badge bg-success-subtle text-success fw-bold">Miễn phí 100%</span>
          </div>

          <!-- Checkout Button -->
          <div class="mt-4">
            <button
              v-if="!authStore.isAuthenticated"
              type="button"
              class="btn btn-warning w-100 py-2 rounded-pill fw-bold shadow-sm"
              @click="redirectToLogin"
            >
              <i class="bi bi-box-arrow-in-right me-1"></i> Đăng Nhập Để Mượn
            </button>

            <button
              v-else
              type="button"
              class="btn btn-warning w-100 py-2 rounded-pill fw-bold shadow-sm"
              :disabled="submitting || cartStore.isOverdue || cartStore.totalCount === 0 || cartStore.totalCount > cartStore.maxAllowed"
              @click="handleCheckout"
            >
              <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
              <i v-else class="bi bi-send-check me-1"></i>
              {{ submitting ? 'Đang gửi yêu cầu...' : 'Gửi Yêu Cầu Mượn Sách' }}
            </button>
          </div>

          <div class="mt-3 text-muted small text-center">
            <i class="bi bi-info-circle me-1"></i> Thủ thư sẽ kiểm tra và phê duyệt yêu cầu của bạn trong vòng 24h.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useClientAuthStore } from '../stores/auth'
import { clientBorrowService } from '@/shared/services/clientServices'
import { useToastStore } from '@/shared/stores/toast'
import { useConfirmStore } from '@/shared/stores/confirm'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useClientAuthStore()
const toast = useToastStore()
const confirmStore = useConfirmStore()

const ghiChu = ref('')
const submitting = ref(false)

const quotaPercent = computed(() => {
  const currentTotal = cartStore.borrowStatus.dangMuonCount + cartStore.totalCount
  return Math.min(100, Math.round((currentTotal / 5) * 100))
})

function changeQuantity(maSach, newQty) {
  cartStore.updateQuantity(maSach, newQty)
}

async function handleRemove(maSach, tenSach) {
  const ok = await confirmStore.ask({
    title: 'Xóa sách khỏi giỏ',
    message: `Bạn có muốn bỏ cuốn sách "${tenSach}" ra khỏi giỏ mượn?`,
    type: 'warning',
    confirmText: 'Bỏ sách'
  })
  if (ok) {
    cartStore.removeItem(maSach)
  }
}

async function handleClearCart() {
  const ok = await confirmStore.ask({
    title: 'Làm trống giỏ mượn',
    message: 'Bạn có chắc chắn muốn xóa toàn bộ sách đang chọn trong giỏ?',
    type: 'danger',
    confirmText: 'Xóa toàn bộ'
  })
  if (ok) {
    cartStore.clearCart()
  }
}

function redirectToLogin() {
  router.push({
    path: '/login',
    query: { redirect: '/gio-hang' }
  })
}

async function handleCheckout() {
  if (!authStore.isAuthenticated) {
    redirectToLogin()
    return
  }

  if (cartStore.isOverdue) {
    toast.error('Bạn đang có sách mượn quá hạn chưa hoàn trả! Vui lòng trả sách trước.')
    return
  }

  if (cartStore.totalCount === 0) {
    toast.warning('Giỏ mượn sách đang trống!')
    return
  }

  if (cartStore.totalCount > cartStore.maxAllowed) {
    toast.warning(`Bạn chỉ có thể mượn thêm tối đa ${cartStore.maxAllowed} quyển sách!`)
    return
  }

  const ok = await confirmStore.ask({
    title: 'Xác nhận đặt mượn sách',
    message: `Bạn có chắc muốn gửi yêu cầu mượn ${cartStore.totalCount} quyển sách này tới thư viện?`,
    type: 'primary',
    confirmText: 'Xác nhận gửi'
  })
  if (!ok) return

  submitting.value = true
  try {
    const payload = {
      items: cartStore.items.map(i => ({
        MaSach: i.book.MaSach,
        SoLuong: i.quantity
      })),
      GhiChu: ghiChu.value || 'Đặt mượn từ giỏ hàng trực tuyến'
    }

    const res = await clientBorrowService.datMuonGioHang(payload)
    toast.success(res.message || 'Gửi yêu cầu mượn sách thành công!')
    cartStore.clearCart()
    await cartStore.fetchBorrowStatus()
    router.push('/lich-su')
  } catch (err) {
    toast.error(err.message)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  cartStore.fetchBorrowStatus()
})
</script>

<style scoped>
.quota-card {
  border-left: 5px solid #f59e0b !important;
}

.empty-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
}

.quantity-group {
  max-width: 110px;
}

.quantity-group input::-webkit-outer-spin-button,
.quantity-group input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.hover-primary:hover {
  color: #d97706 !important;
}
</style>

