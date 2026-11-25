<template>
  <div class="client-book-card h-100">
    <div class="position-relative book-cover-wrapper">
      <div class="book-cover-container">
        <img
          v-if="book.HinhAnhUrl"
          :src="book.HinhAnhUrl"
          class="book-cover"
          :alt="book.TenSach"
        />
        <div v-else class="book-cover-placeholder">
          <i class="bi bi-book"></i>
        </div>
      </div>
      <span
        class="position-absolute top-0 end-0 m-2 badge shadow-sm"
        :class="book.SoQuyen > 0 ? 'bg-success' : 'bg-danger'"
        style="z-index: 2; font-size: 0.72rem;"
      >
        {{ book.SoQuyen > 0 ? `Còn ${book.SoQuyen} q` : 'Hết sách' }}
      </span>
    </div>

    <div class="book-body">
      <span v-if="book.TenTheLoai || book.MaTheLoai" class="badge bg-warning bg-opacity-25 text-dark align-self-start mb-2" style="font-size: 0.75rem;">
        {{ book.TenTheLoai || book.MaTheLoai }}
      </span>
      <h6 class="book-title mb-1" :title="book.TenSach">{{ book.TenSach }}</h6>
      <small class="text-muted mb-2"><i class="bi bi-person me-1"></i>{{ book.TenTacGia || book.TacGia || 'Đang cập nhật' }}</small>
      <div class="mt-auto d-flex justify-content-between align-items-center pt-2 border-top gap-2">
        <span class="fw-bold text-danger">{{ formatPrice(book.DonGia) }} đ</span>

        <!-- Biểu tượng giỏ hàng ở giữa tiện cho độc giả -->
        <button
          type="button"
          class="btn btn-cart-quick d-flex align-items-center justify-content-center"
          :disabled="book.SoQuyen <= 0"
          :title="book.SoQuyen > 0 ? 'Thêm vào giỏ mượn' : 'Tạm hết sách'"
          @click.prevent="handleAddToCart"
        >
          <i class="bi bi-cart-plus-fill fs-6"></i>
        </button>

        <router-link :to="`/sach/${book._id}`" class="btn btn-sm btn-outline-primary">
          Chi tiết <i class="bi bi-arrow-right"></i>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCartStore } from '../stores/cart'

const props = defineProps({
  book: {
    type: Object,
    required: true
  }
})

const cartStore = useCartStore()

function formatPrice(val) {
  if (!val) return '0'
  return val.toLocaleString('vi-VN')
}

function handleAddToCart() {
  cartStore.addItem(props.book, 1)
}
</script>

<style scoped>
.btn-cart-quick {
  background-color: #fffbeb;
  border: 1.5px solid #f59e0b;
  color: #d97706;
  width: 34px;
  height: 31px;
  border-radius: 8px;
  padding: 0;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.btn-cart-quick:hover:not(:disabled) {
  background-color: #f59e0b;
  color: #1c1917;
  transform: translateY(-2px);
  box-shadow: 0 2px 6px rgba(245, 158, 11, 0.35);
}

.btn-cart-quick:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  border-color: #cbd5e1;
  color: #94a3b8;
  background-color: #f8fafc;
}
</style>

