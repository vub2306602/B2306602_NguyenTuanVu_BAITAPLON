<template>
  <div v-if="authStore.isAuthenticated && !isLoginPage" class="admin-layout d-flex min-vh-100">
    <!-- Mobile/Tablet Backdrop -->
    <div
      v-if="isSidebarOpen"
      class="sidebar-backdrop d-lg-none"
      @click="isSidebarOpen = false"
    ></div>

    <!-- Sidebar Xanh lục Emerald (#198754) -->
    <aside
      class="admin-sidebar p-3 shadow-sm d-flex flex-column"
      :class="{ show: isSidebarOpen }"
    >
      <div class="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom border-success flex-shrink-0">
        <div class="d-flex align-items-center gap-2">
          <img src="/logo.png" alt="Logo Thư Viện" class="rounded bg-white p-1" style="width: 36px; height: 36px; object-fit: contain;" />
          <div>
            <div class="fs-6 fw-bold text-white lh-sm">Quản Trị Thư Viện</div>
          </div>
        </div>
        <button
          class="btn btn-sm btn-link text-white d-lg-none"
          @click="isSidebarOpen = false"
        >
          <i class="bi bi-x-lg fs-5"></i>
        </button>
      </div>

      <ul class="nav flex-column gap-1 mb-auto flex-grow-1 overflow-y-auto" style="scrollbar-width: thin; min-height: 0;">
        <li class="nav-item">
          <router-link to="/" class="nav-link" exact-active-class="active" @click="closeOnMobile">
            <i class="bi bi-speedometer2"></i> Dashboard
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/muonsach" class="nav-link" active-class="active" @click="closeOnMobile">
            <i class="bi bi-arrow-left-right"></i> Xử Lý Mượn/Trả
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/sach" class="nav-link" active-class="active" @click="closeOnMobile">
            <i class="bi bi-journals"></i> Quản Lý Sách
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/theloai" class="nav-link" active-class="active" @click="closeOnMobile">
            <i class="bi bi-tags"></i> Thể Loại
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/tacgia" class="nav-link" active-class="active" @click="closeOnMobile">
            <i class="bi bi-pen"></i> Tác Giả
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/nhaxuatban" class="nav-link" active-class="active" @click="closeOnMobile">
            <i class="bi bi-buildings"></i> Nhà Xuất Bản
          </router-link>
        </li>
        <li class="nav-item">
          <router-link to="/docgia" class="nav-link" active-class="active" @click="closeOnMobile">
            <i class="bi bi-people"></i> Độc Giả
          </router-link>
        </li>
        <li v-if="authStore.isAdmin" class="nav-item">
          <router-link to="/nhanvien" class="nav-link" active-class="active" @click="closeOnMobile">
            <i class="bi bi-person-badge"></i> Quản Lý Nhân Viên
          </router-link>
        </li>
      </ul>

      <div class="mt-auto pt-3 border-top border-success flex-shrink-0">
        <div class="d-flex align-items-center justify-content-between text-white">
          <div class="overflow-hidden me-2">
            <div class="fw-bold text-truncate small">{{ authStore.adminUser?.HoTenNV }}</div>
            <span class="badge bg-warning text-dark" style="font-size: 0.7rem;">{{ authStore.adminUser?.ChucVu }}</span>
          </div>
          <button @click="handleLogout" class="btn btn-sm btn-outline-light" title="Đăng xuất">
            <i class="bi bi-box-arrow-right"></i>
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-grow-1 d-flex flex-column min-vh-100 bg-light" style="overflow-x: hidden;">
      <!-- Mobile Top Navbar -->
      <nav class="navbar navbar-light bg-white border-bottom px-3 d-lg-none">
        <button class="btn btn-outline-success btn-sm" @click="isSidebarOpen = true">
          <i class="bi bi-list fs-5"></i>
        </button>
        <span class="fw-bold text-success">Quản Trị Thư Viện</span>
        <div class="d-flex align-items-center gap-2">
          <span class="small fw-semibold text-muted">{{ authStore.adminUser?.HoTenNV }}</span>
        </div>
      </nav>

      <main class="flex-grow-1 p-3 p-md-4">
        <router-view />
      </main>
    </div>
  </div>

  <div v-else>
    <router-view />
  </div>

  <!-- Global Toast & Confirm Containers -->
  <ToastContainer />
  <ConfirmModal />
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAdminAuthStore } from './stores/auth'
import ToastContainer from '@/shared/components/ToastContainer.vue'
import ConfirmModal from '@/shared/components/ConfirmModal.vue'
import { useConfirmStore } from '@/shared/stores/confirm'
import { useToastStore } from '@/shared/stores/toast'

const router = useRouter()
const route = useRoute()
const authStore = useAdminAuthStore()
const confirmStore = useConfirmStore()
const toastStore = useToastStore()
const isSidebarOpen = ref(false)

const isLoginPage = computed(() => {
  return route.path === '/login' || route.name === 'AdminLogin'
})

function closeOnMobile() {
  if (window.innerWidth < 992) {
    isSidebarOpen.value = false
  }
}

async function handleLogout() {
  const confirmed = await confirmStore.ask({
    title: 'Xác nhận đăng xuất',
    message: 'Bạn có chắc chắn muốn đăng xuất khỏi hệ thống Quản Trị?',
    type: 'danger',
    confirmText: 'Đăng xuất',
    cancelText: 'Ở lại'
  })
  if (confirmed) {
    authStore.logout()
    toastStore.info('Đã đăng xuất khỏi tài khoản quản trị.')
    router.push({ name: 'AdminLogin' })
  }
}
</script>
