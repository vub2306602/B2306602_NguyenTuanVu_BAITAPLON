<template>
  <div class="row justify-content-center">
    <div class="col-md-7 col-lg-6">
      <div class="card border-0 shadow-sm p-4 bg-white rounded-3">
        <div class="text-center mb-4">
          <img src="/logo.png" alt="Logo Thư Viện" class="mb-3" style="width: 64px; height: 64px; object-fit: contain;" />
          <h3 class="fw-bold text-dark">Đăng Ký Thẻ Độc Giả</h3>
          <p class="text-muted small">Mở thẻ thư viện trực tuyến hoàn toàn miễn phí</p>
        </div>

        <div v-if="errorMsg" class="alert alert-danger py-2 small">
          <i class="bi bi-exclamation-triangle-fill me-1"></i> {{ errorMsg }}
        </div>

        <form @submit.prevent="handleRegister">
          <div class="row g-3 mb-3">
            <div class="col-sm-6">
              <label class="form-label fw-semibold">Họ Và Tên Đệm <span class="text-danger">*</span></label>
              <input v-model="form.HoLot" type="text" class="form-control" placeholder="Nguyễn Văn" required />
            </div>
            <div class="col-sm-6">
              <label class="form-label fw-semibold">Tên <span class="text-danger">*</span></label>
              <input v-model="form.Ten" type="text" class="form-control" placeholder="An" required />
            </div>
          </div>

          <div class="row g-3 mb-3">
            <div class="col-sm-6">
              <label class="form-label fw-semibold">Ngày Sinh <span class="text-danger">*</span></label>
              <input v-model="form.NgaySinh" type="date" class="form-control" required />
            </div>
            <div class="col-sm-6">
              <label class="form-label fw-semibold">Giới Tính</label>
              <select v-model="form.Phai" class="form-select">
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label fw-semibold">Số Điện Thoại (Tài khoản) <span class="text-danger">*</span></label>
            <input
              v-model="form.DienThoai"
              type="tel"
              class="form-control"
              placeholder="09xxxxxxxx (gồm đúng 10 chữ số)"
              maxlength="10"
              pattern="[0-9]{10}"
              title="Số điện thoại phải gồm đúng 10 chữ số từ 0 đến 9"
              required
            />
            <div class="form-text text-muted small">Nhập đúng 10 chữ số từ 0 đến 9 (dùng làm tài khoản đăng nhập).</div>
          </div>

          <div class="mb-3">
            <label class="form-label fw-semibold">Mật Khẩu <span class="text-danger">*</span></label>
            <div class="input-group">
              <input
                v-model="form.Password"
                :type="showPassword ? 'text' : 'password'"
                class="form-control border-end-0"
                placeholder="Nhập mật khẩu cho thẻ thư viện..."
                required
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

          <div class="mb-4">
            <label class="form-label fw-semibold">Địa Chỉ Liên Hệ <span class="text-danger">*</span></label>
            <textarea v-model="form.DiaChi" rows="2" class="form-control" placeholder="Số nhà, đường, phường/xã..." required></textarea>
          </div>

          <button type="submit" class="btn btn-primary w-100 py-2 fw-bold" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            <span>{{ loading ? 'Đang tạo thẻ...' : 'Đăng Ký Tài Khoản' }}</span>
          </button>
        </form>

        <div class="text-center mt-4 pt-3 border-top">
          <span class="text-muted small">Đã có tài khoản? </span>
          <router-link to="/login" class="fw-bold text-dark text-decoration-none">
            Đăng nhập ngay
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { clientAuthService } from '@/shared/services/clientServices'
import { useClientAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'
import { useToastStore } from '@/shared/stores/toast'

const router = useRouter()
const authStore = useClientAuthStore()
const cartStore = useCartStore()
const toast = useToastStore()

const form = ref({
  HoLot: '',
  Ten: '',
  NgaySinh: '',
  Phai: 'Nam',
  DienThoai: '',
  Password: '',
  DiaChi: ''
})

const loading = ref(false)
const errorMsg = ref('')
const showPassword = ref(false)

async function handleRegister() {
  loading.value = true
  errorMsg.value = ''

  const phoneRegex = /^[0-9]{10}$/
  if (!phoneRegex.test(form.value.DienThoai.trim())) {
    errorMsg.value = 'Số điện thoại phải gồm đúng 10 ký tự số từ 0 đến 9.'
    loading.value = false
    return
  }

  try {
    const res = await clientAuthService.register(form.value)
    if (res.success && res.data) {
      authStore.setLoginData(res.data.token, res.data.docGia)
      cartStore.loadCartForUser()
      await cartStore.fetchBorrowStatus()
      toast.success('Đăng ký thẻ độc giả thành công! Chào mừng bạn.')
      router.push('/')
    }
  } catch (err) {
    errorMsg.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

