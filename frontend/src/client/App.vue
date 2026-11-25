<template>
  <div class="client-layout min-vh-100 d-flex flex-column">
    <!-- Navbar Tone Vàng Hổ Phách (#f59e0b) -->
    <nav class="navbar navbar-expand-lg client-navbar navbar-light py-3">
      <div class="container">
        <router-link to="/" class="navbar-brand d-flex align-items-center gap-2">
          <img src="/logo.png" alt="Logo Thư Viện" style="width: 38px; height: 38px; object-fit: contain;" />
          <span>Thư Viện Sách</span>
        </router-link>

        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#clientNavbarContent"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="clientNavbarContent">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3">
            <li class="nav-item">
              <router-link to="/" class="nav-link" exact-active-class="active">
                <i class="bi bi-house-door me-1"></i> Trang Chủ
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/sach" class="nav-link" active-class="active">
                <i class="bi bi-journals me-1"></i> Danh Mục Sách
              </router-link>
            </li>
            <li v-if="authStore.isAuthenticated" class="nav-item">
              <router-link to="/lich-su" class="nav-link" active-class="active">
                <i class="bi bi-clock-history me-1"></i> Lịch Sử Mượn
              </router-link>
            </li>
          </ul>

          <div class="d-flex align-items-center gap-2">
            <!-- Biểu tượng giỏ hàng nằm kế bên trái nút đăng nhập -->
            <router-link
              to="/gio-hang"
              class="btn btn-cart-icon position-relative me-1"
              title="Giỏ sách đặt mượn"
            >
              <i class="bi bi-cart3 fs-5"></i>
              <span
                v-if="cartStore.totalCount > 0"
                class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-white"
                style="font-size: 0.72rem; padding: 0.25em 0.5em;"
              >
                {{ cartStore.totalCount }}
                <span class="visually-hidden">quyển trong giỏ</span>
              </span>
            </router-link>

            <!-- Đã đăng nhập -->
            <template v-if="authStore.isAuthenticated">
              <div class="dropdown">
                <button
                  class="btn btn-dark dropdown-toggle d-flex align-items-center gap-2"
                  type="button"
                  data-bs-toggle="dropdown"
                >
                  <i class="bi bi-person-circle"></i>
                  <span>{{ authStore.user?.HoLot }} {{ authStore.user?.Ten }}</span>
                </button>
                <ul class="dropdown-menu dropdown-menu-end shadow border-0">
                  <li>
                    <router-link to="/gio-hang" class="dropdown-item">
                      <i class="bi bi-cart3 me-2 text-warning"></i> Giỏ mượn sách
                      <span v-if="cartStore.totalCount > 0" class="badge bg-warning text-dark ms-2">{{ cartStore.totalCount }}</span>
                    </router-link>
                  </li>
                  <li>
                    <router-link to="/lich-su" class="dropdown-item">
                      <i class="bi bi-journal-bookmark me-2"></i> Lịch sử mượn
                    </router-link>
                  </li>
                  <li>
                    <button class="dropdown-item" @click="showChangePasswordModal = true">
                      <i class="bi bi-key-fill me-2 text-warning"></i> Đổi mật khẩu
                    </button>
                  </li>
                  <li><hr class="dropdown-divider" /></li>
                  <li>
                    <button class="dropdown-item text-danger" @click="handleLogout">
                      <i class="bi bi-box-arrow-right me-2"></i> Đăng xuất
                    </button>
                  </li>
                </ul>
              </div>
            </template>

            <!-- Chưa đăng nhập -->
            <template v-else>
              <router-link to="/login" class="btn btn-outline-dark fw-bold">
                Đăng Nhập
              </router-link>
              <router-link to="/register" class="btn btn-dark fw-bold">
                Đăng ký tài khoản
              </router-link>
            </template>
          </div>
        </div>
      </div>
    </nav>

    <!-- Dải thông báo cảnh báo / khóa quá hạn tài khoản độc giả -->
    <div
      v-if="authStore.isAuthenticated && (cartStore.borrowStatus?.isKhoaDoQuaHan || authStore.user?.TrangThai === 'BiKhoa')"
      class="bg-danger text-white py-2 px-3 shadow-sm"
    >
      <div class="container d-flex align-items-center justify-content-between flex-wrap gap-2 small">
        <div class="d-flex align-items-center gap-2">
          <i class="bi bi-shield-lock-fill fs-5"></i>
          <span>
            <strong>Tài khoản đã bị tự động khóa!</strong> Bạn có sách mượn quá hạn <strong>{{ cartStore.borrowStatus?.maxOverdueDays ? cartStore.borrowStatus.maxOverdueDays + ' ngày' : 'trên 20 ngày' }}</strong> (vượt quá hạn mức tối đa 20 ngày). Vui lòng liên hệ thủ thư thư viện để trả sách và mở lại tài khoản.
          </span>
        </div>
        <router-link to="/lich-su" class="btn btn-sm btn-light text-danger fw-bold py-0 px-3">
          <i class="bi bi-journal-text me-1"></i>Xem phiếu mượn
        </router-link>
      </div>
    </div>

    <div
      v-else-if="authStore.isAuthenticated && cartStore.borrowStatus?.isCanhBao"
      class="bg-warning text-dark py-2 px-3 shadow-sm border-bottom border-dark border-opacity-10"
    >
      <div class="container d-flex align-items-center justify-content-between flex-wrap gap-2 small">
        <div class="d-flex align-items-center gap-2">
          <i class="bi bi-exclamation-triangle-fill fs-5 text-danger"></i>
          <span>
            <strong>Nhắc nhở trả sách:</strong> Bạn đang có {{ cartStore.borrowStatus?.overdueCount || 1 }} quyển sách mượn quá hạn <strong>{{ cartStore.borrowStatus?.maxOverdueDays }} ngày</strong> (mức nhắc nhở ≤ 20 ngày). Phí phạt trễ hạn là 1.000đ/ngày (tối đa 20.000đ). Vui lòng mang sách trả thư viện sớm để tránh bị tự động khóa tài khoản khi vượt quá 20 ngày!
          </span>
        </div>
        <router-link to="/lich-su" class="btn btn-sm btn-dark text-warning fw-bold py-0 px-3">
          <i class="bi bi-clock-history me-1"></i>Xem lịch sử
        </router-link>
      </div>
    </div>

    <!-- Main Content -->
    <main class="container my-4 flex-grow-1">
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="client-footer">
      <div class="container">
        <div class="row g-4 mb-4">
          <div class="col-md-6">
            <h5 class="fw-bold text-warning mb-3 d-flex align-items-center">
              <img src="/logo.png" alt="Logo Thư Viện" class="me-2" style="width: 32px; height: 32px; object-fit: contain;" />
              <span>Hệ Thống Thư Viện Trực Tuyến</span>
            </h5>
            <p class="small mb-0" style="color: #e4e4e7; line-height: 1.6;">
              Cung cấp giải pháp tra cứu sách điện tử, mượn trả tiện lợi và thông minh dành cho bạn đọc.
            </p>
          </div>
          <div class="col-md-3">
            <h6 class="fw-bold text-white mb-3">Liên Kết Nhanh</h6>
            <ul class="list-unstyled small mb-0 d-flex flex-column gap-2">
              <li>
                <router-link to="/" class="footer-link">
                  <i class="bi bi-chevron-right me-1 text-warning" style="font-size: 0.75rem;"></i> Trang chủ
                </router-link>
              </li>
              <li>
                <router-link to="/sach" class="footer-link">
                  <i class="bi bi-chevron-right me-1 text-warning" style="font-size: 0.75rem;"></i> Danh mục sách
                </router-link>
              </li>
              <li>
                <router-link to="/lich-su" class="footer-link">
                  <i class="bi bi-chevron-right me-1 text-warning" style="font-size: 0.75rem;"></i> Lịch sử mượn
                </router-link>
              </li>
            </ul>
          </div>
          <div class="col-md-3">
            <h6 class="fw-bold text-white mb-3">Hỗ Trợ Bạn Đọc</h6>
            <p class="small mb-2" style="color: #e4e4e7;">
              <i class="bi bi-geo-alt-fill text-warning me-2"></i>Khu II, Đ. 3/2, Xuân Khánh, Ninh Kiều, Cần Thơ
            </p>
            <p class="small mb-0" style="color: #e4e4e7;">
              <i class="bi bi-telephone-fill text-warning me-2"></i>(0292) 3832663
            </p>
          </div>
        </div>
        <hr class="border-secondary opacity-50" />
        <div class="text-center small" style="color: #cbd5e1;">
          © 2026 Quản Lý Mượn Trả Sách - CT449 Phát Triển Ứng Dụng Web (MEVN Stack).
        </div>
      </div>
    </footer>

    <!-- Global Toast & Confirm Containers -->
    <ToastContainer />
    <ConfirmModal />

    <!-- Modal Đổi Mật Khẩu -->
    <div v-if="showChangePasswordModal" class="modal fade show d-block" tabindex="-1" style="background:rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"><i class="bi bi-key-fill me-2 text-warning"></i>Đổi Mật Khẩu</h5>
            <button type="button" class="btn-close" @click="closeChangePwdModal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label fw-semibold">Mật khẩu hiện tại</label>
              <div class="input-group">
                <input
                  :type="showCu ? 'text' : 'password'"
                  v-model="matKhauCu"
                  class="form-control"
                  placeholder="Nhập mật khẩu hiện tại"
                />
                <button class="btn btn-outline-secondary" type="button" @click="showCu = !showCu">
                  <i :class="showCu ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                </button>
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold">Mật khẩu mới</label>
              <div class="input-group">
                <input
                  :type="showMoi ? 'text' : 'password'"
                  v-model="matKhauMoi"
                  class="form-control"
                  placeholder="Ít nhất 6 ký tự"
                />
                <button class="btn btn-outline-secondary" type="button" @click="showMoi = !showMoi">
                  <i :class="showMoi ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                </button>
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold">Xác nhận mật khẩu mới</label>
              <div class="input-group">
                <input
                  :type="showXacNhan ? 'text' : 'password'"
                  v-model="matKhauXacNhan"
                  class="form-control"
                  placeholder="Nhập lại mật khẩu mới"
                />
                <button class="btn btn-outline-secondary" type="button" @click="showXacNhan = !showXacNhan">
                  <i :class="showXacNhan ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                </button>
              </div>
              <div v-if="matKhauXacNhan && matKhauMoi !== matKhauXacNhan" class="text-danger small mt-1">
                <i class="bi bi-exclamation-circle me-1"></i>Mật khẩu xác nhận không khớp.
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeChangePwdModal">Hủy</button>
            <button
              class="btn btn-warning fw-bold"
              @click="submitChangePassword"
              :disabled="isChangingPwd || !matKhauCu || !matKhauMoi || matKhauMoi !== matKhauXacNhan"
            >
              <span v-if="isChangingPwd" class="spinner-border spinner-border-sm me-1"></span>
              <i v-else class="bi bi-check-circle me-1"></i>
              Xác nhận đổi
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useClientAuthStore } from './stores/auth'
import { useCartStore } from './stores/cart'
import ToastContainer from '@/shared/components/ToastContainer.vue'
import ConfirmModal from '@/shared/components/ConfirmModal.vue'
import { useConfirmStore } from '@/shared/stores/confirm'
import { useToastStore } from '@/shared/stores/toast'
import { clientAuthService } from '@/shared/services/clientServices'

const router = useRouter()
const authStore = useClientAuthStore()
const cartStore = useCartStore()
const confirmStore = useConfirmStore()
const toastStore = useToastStore()

// --- Đổi mật khẩu ---
const showChangePasswordModal = ref(false)
const matKhauCu = ref('')
const matKhauMoi = ref('')
const matKhauXacNhan = ref('')
const showCu = ref(false)
const showMoi = ref(false)
const showXacNhan = ref(false)
const isChangingPwd = ref(false)

function closeChangePwdModal() {
  showChangePasswordModal.value = false
  matKhauCu.value = ''
  matKhauMoi.value = ''
  matKhauXacNhan.value = ''
  showCu.value = false
  showMoi.value = false
  showXacNhan.value = false
}

async function submitChangePassword() {
  if (matKhauMoi.value !== matKhauXacNhan.value) {
    toastStore.error('Mật khẩu xác nhận không khớp.')
    return
  }
  if (matKhauMoi.value.length < 6) {
    toastStore.error('Mật khẩu mới phải có ít nhất 6 ký tự.')
    return
  }
  isChangingPwd.value = true
  try {
    await clientAuthService.changePassword({
      MatKhauCu: matKhauCu.value,
      MatKhauMoi: matKhauMoi.value,
    })
    toastStore.success('Đổi mật khẩu thành công!')
    closeChangePwdModal()
  } catch (err) {
    const msg = err.response?.data?.message || 'Đổi mật khẩu thất bại.'
    toastStore.error(msg)
  } finally {
    isChangingPwd.value = false
  }
}

onMounted(() => {
  if (authStore.isAuthenticated) {
    cartStore.fetchBorrowStatus()
  }
})

async function handleLogout() {
  const confirmed = await confirmStore.ask({
    title: 'Xác nhận đăng xuất',
    message: 'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản Độc giả?',
    type: 'danger',
    confirmText: 'Đăng xuất',
    cancelText: 'Ở lại'
  })
  if (confirmed) {
    authStore.logout()
    cartStore.loadCartForUser()
    cartStore.fetchBorrowStatus()
    toastStore.info('Đã đăng xuất tài khoản độc giả.')
    router.push('/')
  }
}
</script>

<style scoped>
.btn-cart-icon {
  background: rgba(0, 0, 0, 0.05);
  border: 1.5px solid rgba(0, 0, 0, 0.15);
  color: #1e293b;
  border-radius: 10px;
  width: 44px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-cart-icon:hover,
.btn-cart-icon.router-link-active {
  background: #1e293b;
  color: #ffffff;
  border-color: #1e293b;
}

.footer-link {
  color: #e4e4e7;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  transition: all 0.2s ease;
}

.footer-link:hover {
  color: #f59e0b !important;
  transform: translateX(4px);
}
</style>
