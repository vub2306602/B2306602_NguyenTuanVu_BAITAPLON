<template>
  <div class="row justify-content-center">
    <div class="col-md-6 col-lg-5">
      <div class="card border-0 shadow-sm p-4 bg-white rounded-3">
        <div class="text-center mb-4">
          <img src="/logo.png" alt="Logo Thư Viện" class="mb-3" style="width: 64px; height: 64px; object-fit: contain;" />
          <h3 class="fw-bold text-dark">Đăng Nhập Độc Giả</h3>
          <p class="text-muted small">Đăng nhập để tra cứu lịch sử và đặt mượn sách</p>
        </div>

        <div v-if="errorMsg" class="alert alert-danger py-2 small">
          <i class="bi bi-exclamation-triangle-fill me-1"></i> {{ errorMsg }}
        </div>

        <form @submit.prevent="handleLogin">
          <div class="mb-3">
            <label class="form-label fw-semibold">Số Điện Thoại</label>
            <div class="input-group">
              <span class="input-group-text bg-white"><i class="bi bi-telephone text-muted"></i></span>
              <input
                v-model="form.DienThoai"
                type="tel"
                class="form-control"
                placeholder="0987654321"
                required
              />
            </div>
          </div>

          <div class="mb-4">
            <label class="form-label fw-semibold">Mật Khẩu</label>
            <div class="input-group">
              <span class="input-group-text bg-white"><i class="bi bi-key text-muted"></i></span>
              <input
                v-model="form.Password"
                :type="showPassword ? 'text' : 'password'"
                class="form-control border-end-0"
                placeholder="Nhập mật khẩu..."
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

          <button type="submit" class="btn btn-primary w-100 py-2 fw-bold" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            <span>{{ loading ? 'Đang đăng nhập...' : 'Đăng Nhập' }}</span>
          </button>
        </form>

        <div class="text-center mt-4 pt-3 border-top">
          <span class="text-muted small">Chưa có thẻ thư viện? </span>
          <router-link to="/register" class="fw-bold text-dark text-decoration-none">
            Đăng ký tài khoản mới
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { clientAuthService } from '@/shared/services/clientServices'
import { useClientAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'
import { useToastStore } from '@/shared/stores/toast'

const router = useRouter()
const route = useRoute()
const authStore = useClientAuthStore()
const cartStore = useCartStore()
const toast = useToastStore()

const form = ref({
  DienThoai: '',
  Password: ''
})

const loading = ref(false)
const errorMsg = ref('')
const showPassword = ref(false)

async function handleLogin() {
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await clientAuthService.login(form.value)
    if (res.success && res.data) {
      authStore.setLoginData(res.data.token, res.data.docGia)
      cartStore.loadCartForUser()
      await cartStore.fetchBorrowStatus()
      toast.success(`Chào mừng bạn đọc ${res.data.docGia.Ten}!`)
      const redirect = route.query.redirect || '/'
      router.push(redirect)
    }
  } catch (err) {
    errorMsg.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

