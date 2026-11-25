<template>
  <div class="not-found-container d-flex align-items-center justify-content-center min-vh-100 p-4">
    <div class="not-found-card text-center p-5 shadow-sm">
      <div class="not-found-badge mb-3">
        <span class="badge bg-danger-subtle text-danger px-3 py-2 rounded-pill fw-bold">
          <i class="bi bi-shield-slash-fill me-1"></i> Lỗi 404 - Không Tìm Thấy
        </span>
      </div>

      <div class="error-code text-gradient mb-2">404</div>

      <h3 class="fw-bold text-dark mb-3">Trang Quản Trị Không Tồn Tại</h3>

      <p class="text-muted mx-auto mb-4" style="max-width: 480px;">
        Đường dẫn bạn truy cập không tồn tại trong hệ thống quản trị hoặc bạn không có quyền truy cập vào chức năng này.
      </p>

      <div class="d-flex justify-content-center gap-3 flex-wrap">
        <button class="btn btn-outline-secondary px-4 py-2 rounded-pill fw-semibold" @click="goBack">
          <i class="bi bi-arrow-left me-1"></i> Quay lại
        </button>
        <router-link to="/" class="btn btn-admin-primary px-4 py-2 rounded-pill fw-semibold">
          <i class="bi bi-speedometer2 me-1"></i> Về Dashboard
        </router-link>
      </div>

      <div class="mt-5 pt-3 border-top text-muted small">
        <i class="bi bi-info-circle me-1"></i> Hệ Thống Quản Trị Thư Viện - CT449
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}
</script>

<style scoped>
.not-found-container {
  background: linear-gradient(135deg, #f0fdf4 0%, #e2e8f0 100%);
}

.not-found-card {
  max-width: 580px;
  width: 100%;
  background: #ffffff;
  border-radius: 24px;
  border: 1px solid rgba(25, 135, 84, 0.15);
  box-shadow: 0 20px 40px -15px rgba(25, 135, 84, 0.12);
}

.error-code {
  font-size: 6rem;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -2px;
  background: linear-gradient(135deg, #198754 0%, #0f5132 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.btn-admin-primary {
  background: #198754;
  color: #ffffff;
  border: none;
  box-shadow: 0 4px 14px rgba(25, 135, 84, 0.3);
  transition: all 0.2s ease;
}

.btn-admin-primary:hover {
  background: #157347;
  color: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(25, 135, 84, 0.4);
}
</style>

