<template>
  <div class="login-wrapper min-vh-100 d-flex justify-content-center align-items-center bg-light">
    <div class="card shadow border-0 p-4" style="max-width: 420px; width: 100%;">
      <div class="text-center mb-4">
        <img src="/logo.png" alt="Logo" class="mb-3" style="width: 64px; height: 64px; object-fit: contain;" />
        <h3 class="fw-bold text-success">Đăng Nhập Quản Trị</h3>
        <p class="text-muted small">Dành cho Quản trị viên và Thủ thư hệ thống</p>
      </div>

      <div v-if="errorMessage" class="alert alert-danger py-2 small" role="alert">
        <i class="bi bi-exclamation-triangle-fill me-1"></i> {{ errorMessage }}
      </div>

      <form @submit.prevent="handleLogin">
        <div class="mb-3">
          <label class="form-label fw-semibold">Mã số nhân viên (MSNV)</label>
          <div class="input-group">
            <span class="input-group-text bg-white"><i class="bi bi-person text-muted"></i></span>
            <input
              v-model="msnv"
              type="text"
              class="form-control"
              placeholder="Nhập MSNV"
              required
            />
          </div>
        </div>

        <div class="mb-4">
          <label class="form-label fw-semibold">Mật khẩu</label>
          <div class="input-group">
            <span class="input-group-text bg-white"><i class="bi bi-key text-muted"></i></span>
            <input
              v-model="password"
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

        <button type="submit" class="btn btn-primary w-100 py-2 fw-semibold" :disabled="isLoading">
          <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
          <span>{{ isLoading ? 'Đang xác thực...' : 'Đăng nhập hệ thống' }}</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAdminAuthStore } from '../stores/auth'
import { authService } from '@/shared/services/adminServices'

const router = useRouter()
const route = useRoute()
const authStore = useAdminAuthStore()

const msnv = ref('')
const password = ref('')
const errorMessage = ref('')
const isLoading = ref(false)
const showPassword = ref(false)

async function handleLogin() {
  errorMessage.value = ''
  isLoading.value = true
  try {
    const res = await authService.loginAdmin({
      MSNV: msnv.value.trim(),
      Password: password.value
    })

    if (res.success && res.data) {
      authStore.setLoginData(res.data.token, res.data.nhanVien)
      // Mặc định luôn chuyển đến Dashboard ('/') khi đăng nhập thành công
      router.push('/')
    }
  } catch (error) {
    errorMessage.value = error.message || 'MSNV hoặc mật khẩu không chính xác.'
  } finally {
    isLoading.value = false
  }
}
</script>
