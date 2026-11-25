<template>
  <div>
    <!-- Tiêu đề & Ô Tìm Kiếm -->
    <div class="row align-items-center mb-4 g-3">
      <div class="col-md-6">
        <h3 class="fw-bold text-dark mb-1">Tra Cứu Danh Mục Sách</h3>
        <p class="text-muted mb-0">Tìm thấy {{ totalBooks }} cuốn sách trong thư viện</p>
      </div>
      <div class="col-md-6">
        <div class="input-group">
          <span class="input-group-text bg-white border-warning"><i class="bi bi-search text-warning"></i></span>
          <input
            v-model="filters.keyword"
            @input="handleSearch"
            type="text"
            class="form-control border-warning"
            placeholder="Nhập tên sách, tác giả hoặc mã sách..."
          />
        </div>
      </div>
    </div>

    <!-- Bộ Lọc Thể Loại & NXB -->
    <div class="card border-0 shadow-sm p-3 mb-4 bg-white border-start border-4 border-warning">
      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label small fw-bold text-muted text-uppercase mb-1">Thể loại sách</label>
          <select v-model="filters.theloai" @change="changeFilter" class="form-select">
            <option value="">-- Tất cả thể loại --</option>
            <option v-for="tl in categories" :key="tl.MaTheLoai" :value="tl.MaTheLoai">
              {{ tl.TenTheLoai }}
            </option>
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label small fw-bold text-muted text-uppercase mb-1">Nhà xuất bản</label>
          <select v-model="filters.nxb" @change="changeFilter" class="form-select">
            <option value="">-- Tất cả nhà xuất bản --</option>
            <option v-for="nxb in publishers" :key="nxb.MaNXB" :value="nxb.MaNXB">
              {{ nxb.TenNXB }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Lưới Sách -->
    <div class="row g-4 mb-4">
      <div
        v-for="book in books"
        :key="book._id"
        class="col-6 col-md-4 col-lg-3"
      >
        <BookCard :book="book" />
      </div>
      <div v-if="books.length === 0" class="col-12 text-center text-muted py-5 bg-white rounded shadow-sm">
        <i class="bi bi-search fs-1 text-warning d-block mb-2"></i>
        Không tìm thấy cuốn sách nào phù hợp với điều kiện tìm kiếm.
      </div>
    </div>

    <!-- Phân Trang Mượt Mà -->
    <div v-if="totalPages > 1" class="d-flex justify-content-center mt-4">
      <nav aria-label="Page navigation">
        <ul class="pagination">
          <li class="page-item" :class="{ disabled: currentPage <= 1 }">
            <button class="page-link" @click="changePage(currentPage - 1)">
              <i class="bi bi-chevron-left"></i>
            </button>
          </li>
          <li
            v-for="page in totalPages"
            :key="page"
            class="page-item"
            :class="{ active: page === currentPage }"
          >
            <button class="page-link" @click="changePage(page)">{{ page }}</button>
          </li>
          <li class="page-item" :class="{ disabled: currentPage >= totalPages }">
            <button class="page-link" @click="changePage(currentPage + 1)">
              <i class="bi bi-chevron-right"></i>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { clientBookService } from '@/shared/services/clientServices'
import BookCard from '../components/BookCard.vue'

const route = useRoute()

const books = ref([])
const categories = ref([])
const publishers = ref([])
const totalBooks = ref(0)
const totalPages = ref(1)
const currentPage = ref(1)

const filters = ref({
  keyword: '',
  theloai: route.query.theloai || '',
  nxb: ''
})

let searchTimer = null

async function loadFiltersData() {
  try {
    const [catRes, pubRes] = await Promise.all([
      clientBookService.getCategories(),
      clientBookService.getPublishers()
    ])
    if (catRes.success) categories.value = catRes.data
    if (pubRes.success) publishers.value = pubRes.data
  } catch (err) {
    console.error(err)
  }
}

async function fetchBooks() {
  try {
    const res = await clientBookService.getAll({
      page: currentPage.value,
      limit: 8,
      keyword: filters.value.keyword,
      theloai: filters.value.theloai,
      nxb: filters.value.nxb
    })

    if (res.success) {
      books.value = res.data
      totalBooks.value = res.total
      totalPages.value = res.totalPages || 1
    }
  } catch (err) {
    console.error(err)
  }
}

function handleSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    currentPage.value = 1
    fetchBooks()
  }, 350)
}

function changeFilter() {
  currentPage.value = 1
  fetchBooks()
}

function changePage(p) {
  if (p >= 1 && p <= totalPages.value) {
    currentPage.value = p
    fetchBooks()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

watch(() => route.query.theloai, (newVal) => {
  if (newVal !== undefined) {
    filters.value.theloai = newVal
    currentPage.value = 1
    fetchBooks()
  }
})

onMounted(() => {
  loadFiltersData()
  fetchBooks()
})
</script>

