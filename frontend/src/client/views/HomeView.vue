<template>
  <div>
    <!-- Hero Banner Chào Đón Có Ảnh Nền & Hiệu Ứng Glassmorphism -->
    <section class="client-hero mb-5">
      <div class="row align-items-center g-4">
        <div class="col-lg-7">
          <div class="client-hero-badge mb-3">
            <i class="bi bi-stars"></i> Thư Viện Sách Trực Tuyến 2026
          </div>
          <h1 class="mb-3">Khám Phá Tri Thức & Đặt Mượn Sách Dễ Dàng</h1>
          <p class="fs-5 text-dark fw-medium mb-4" style="text-shadow: 0 1px 1px rgba(255, 255, 255, 0.6);">
            Hàng ngàn đầu sách phong phú từ Công nghệ thông tin, Kinh tế, Văn học cho đến Kỹ năng sống.
            Tra cứu nhanh chóng, đặt mượn tiện lợi ngay tại nhà.
          </p>
          <div class="d-flex flex-wrap gap-2">
            <router-link to="/sach" class="btn btn-dark btn-lg px-4 fw-bold shadow-sm">
              <i class="bi bi-search me-1"></i> Tìm Sách Ngay
            </router-link>
            <router-link v-if="!authStore.isAuthenticated" to="/register" class="btn btn-outline-dark btn-lg px-4 fw-bold shadow-sm">
              Đăng Ký Độc Giả
            </router-link>
          </div>
        </div>

        <div class="col-lg-5">
          <div class="client-hero-card text-center">
            <img src="/logo.png" alt="Logo" class="mb-3" style="width: 72px; height: 72px; object-fit: contain;" />
            <h5 class="fw-bold text-dark mb-1">Mượn Sách Trực Tuyến</h5>
            <p class="small text-muted mb-3">Hỗ trợ độc giả tra cứu tồn kho theo thời gian thực và đặt mượn nhanh chóng</p>
            <div class="d-flex justify-content-around text-center pt-2 border-top">
              <div>
                <div class="fw-bold fs-5 text-warning-emphasis">10+</div>
                <small class="text-muted" style="font-size: 0.75rem;">Đầu Sách Mẫu</small>
              </div>
              <div class="vr"></div>
              <div>
                <div class="fw-bold fs-5 text-warning-emphasis">14 Ngày</div>
                <small class="text-muted" style="font-size: 0.75rem;">Thời Hạn Mượn</small>
              </div>
              <div class="vr"></div>
              <div>
                <div class="fw-bold fs-5 text-success">Miễn Phí</div>
                <small class="text-muted" style="font-size: 0.75rem;">Mở Thẻ Online</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Danh Mục Thể Loại Nổi Bật -->
    <section class="mb-5">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 class="fw-bold text-dark mb-0"><i class="bi bi-grid-fill text-warning me-2"></i>Danh Mục Thể Loại Nổi Bật</h4>
          <small class="text-muted">Lựa chọn sách theo sở thích của bạn</small>
        </div>
        <router-link to="/sach" class="btn btn-sm btn-link text-dark fw-bold text-decoration-none">
          Xem tất cả <i class="bi bi-chevron-right"></i>
        </router-link>
      </div>

      <div class="d-flex flex-wrap gap-2">
        <div
          v-for="tl in categories"
          :key="tl.MaTheLoai"
          @click="goToCategory(tl.MaTheLoai)"
          class="category-chip"
        >
          <i class="bi bi-bookmark-fill text-warning me-1"></i>
          <span>{{ tl.TenTheLoai }}</span>
        </div>
      </div>
    </section>

    <!-- Sách Mới Cập Nhật -->
    <section class="mb-5">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 class="fw-bold text-dark mb-0"><i class="bi bi-stars text-warning me-2"></i>Sách Mới Cập Nhật</h4>
          <small class="text-muted">Các đầu sách mới được đưa vào thư viện</small>
        </div>
        <router-link to="/sach" class="btn btn-sm btn-outline-dark fw-semibold">
          Xem Toàn Bộ Sách
        </router-link>
      </div>

      <div class="row g-4">
        <div
          v-for="book in latestBooks"
          :key="book._id"
          class="col-6 col-md-4 col-lg-3"
        >
          <BookCard :book="book" />
        </div>
        <div v-if="latestBooks.length === 0" class="col-12 text-center text-muted py-5">
          <i class="bi bi-inbox fs-1 d-block mb-2"></i>
          Đang tải dữ liệu sách mới...
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { clientBookService } from '@/shared/services/clientServices'
import { useClientAuthStore } from '../stores/auth'
import BookCard from '../components/BookCard.vue'

const router = useRouter()
const authStore = useClientAuthStore()
const categories = ref([])
const latestBooks = ref([])

function goToCategory(maTheLoai) {
  router.push({ path: '/sach', query: { theloai: maTheLoai } })
}

async function loadHomeData() {
  try {
    const [catRes, bookRes] = await Promise.all([
      clientBookService.getCategories(),
      clientBookService.getAll({ limit: 8, page: 1 })
    ])

    if (catRes.success) categories.value = catRes.data
    if (bookRes.success) latestBooks.value = bookRes.data
  } catch (err) {
    console.error('Lỗi tải trang chủ:', err)
  }
}

onMounted(() => {
  loadHomeData()
})
</script>

