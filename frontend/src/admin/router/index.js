import { createRouter, createWebHistory } from 'vue-router'
import { useAdminAuthStore } from '../stores/auth'
import { useToastStore } from '@/shared/stores/toast'

const routes = [
  {
    path: '/login',
    name: 'AdminLogin',
    component: () => import('../views/LoginView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/theloai',
    name: 'TheLoai',
    component: () => import('../views/TheLoaiView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/tacgia',
    name: 'TacGia',
    component: () => import('../views/TacGiaView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/nhaxuatban',
    name: 'NhaXuatBan',
    component: () => import('../views/NhaXuatBanView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/sach',
    name: 'Sach',
    component: () => import('../views/SachView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/docgia',
    name: 'DocGia',
    component: () => import('../views/DocGiaView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/nhanvien',
    name: 'NhanVien',
    component: () => import('../views/NhanVienView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/muonsach',
    name: 'MuonSach',
    component: () => import('../views/MuonSachView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFoundView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAdminAuthStore()
  const token = localStorage.getItem('admin_token') || authStore.token
  const user = JSON.parse(localStorage.getItem('admin_user') || 'null')

  // 1. Kiểm tra đăng nhập
  if (to.meta.requiresAuth && !token) {
    return next({
      name: 'AdminLogin'
    })
  }

  // 2. Kiểm tra quyền Admin (cho trang NhanVien)
  if (to.meta.requiresAdmin && user?.ChucVu !== 'Admin') {
    const toast = useToastStore()
    toast.warning('Bạn không có quyền truy cập vào mục Quản lý Nhân viên (chỉ dành cho Admin)!')
    return next({ name: 'Dashboard' })
  }

  // 3. Nếu đã đăng nhập không cho vào lại /login
  if (to.meta.requiresGuest && token) {
    return next({ name: 'Dashboard' })
  }

  next()
})

router.onError((error, to) => {
  console.error('Router error:', error)
  // Ngăn chặn vòng lặp reload vô tận (infinite reload loop)
  const isChunkError = error.message?.includes('Failed to fetch dynamically imported module') || error.message?.includes('504')
  if (isChunkError) {
    const reloadKey = 'chunk_reload_count'
    const count = parseInt(sessionStorage.getItem(reloadKey) || '0', 10)
    if (count < 1) {
      sessionStorage.setItem(reloadKey, (count + 1).toString())
      window.location.reload()
      return
    }
  }
  sessionStorage.removeItem('chunk_reload_count')
})

export default router
