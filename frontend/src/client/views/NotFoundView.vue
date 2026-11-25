<template>
  <div class="client-not-found py-5 d-flex align-items-center min-vh-75">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-7 col-md-9 text-center">
          <div class="card border-0 shadow-lg p-4 p-md-5 rounded-4 not-found-box">
            <div class="icon-bubble mx-auto mb-3">
              <i class="bi bi-book text-warning"></i>
            </div>

            <div class="code-404 mb-2">404</div>

            <h2 class="fw-bold text-dark mb-3">Trang Bạn Tìm Không Tồn Tại</h2>

            <p class="text-muted mb-4 fs-6">
              Có vẻ như cuốn sách hoặc trang bạn đang tìm kiếm đã được mượn, chuyển sang vị trí khác hoặc liên kết này không chính xác.
            </p>

            <div class="d-flex justify-content-center gap-3 flex-wrap">
              <router-link to="/" class="btn btn-warning px-4 py-2 rounded-pill fw-semibold shadow-sm">
                <i class="bi bi-house-door-fill me-1"></i> Trang Chủ
              </router-link>
              <router-link to="/sach" class="btn btn-outline-dark px-4 py-2 rounded-pill fw-semibold">
                <i class="bi bi-collection me-1"></i> Danh Mục Sách
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.client-not-found {
  min-height: calc(100vh - 220px);
}

.not-found-box {
  background: #ffffff;
  border: 1px solid rgba(245, 158, 11, 0.15) !important;
  box-shadow: 0 20px 45px -10px rgba(245, 158, 11, 0.12) !important;
}

.icon-bubble {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #fffbeb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
}

.code-404 {
  font-size: 5.5rem;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -2px;
  color: #f59e0b;
}
</style>

