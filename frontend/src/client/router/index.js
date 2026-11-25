import { createRouter, createWebHistory } from 'vue-router'
import { useClientAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue')
  },
  {
    path: '/sach',
    name: 'BookList',
    component: () => import('../views/BookListView.vue')
  },
  {
    path: '/sach/:id',
    name: 'BookDetail',
    component: () => import('../views/BookDetailView.vue')
  },
  {
    path: '/login',
    name: 'ClientLogin',
    component: () => import('../views/LoginView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'ClientRegister',
    component: () => import('../views/RegisterView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/lich-su',
    name: 'BorrowHistory',
    component: () => import('../views/BorrowHistoryView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/gio-hang',
    name: 'Cart',
    component: () => import('../views/CartView.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFoundView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach((to, from, next) => {
  const authStore = useClientAuthStore()
  const token = localStorage.getItem('client_token') || authStore.token

  if (to.meta.requiresAuth && !token) {
    return next({
      name: 'ClientLogin',
      query: { redirect: to.fullPath }
    })
  }

  if (to.meta.requiresGuest && token) {
    return next({ name: 'Home' })
  }

  next()
})

export default router

