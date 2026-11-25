import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAdminAuthStore = defineStore('adminAuth', () => {
  const token = ref(localStorage.getItem('admin_token') || '')
  const adminUser = ref(JSON.parse(localStorage.getItem('admin_user') || 'null'))

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => adminUser.value?.ChucVu === 'Admin')

  function setLoginData(tokenData, userData) {
    token.value = tokenData
    adminUser.value = userData
    localStorage.setItem('admin_token', tokenData)
    localStorage.setItem('admin_user', JSON.stringify(userData))
  }

  function logout() {
    token.value = ''
    adminUser.value = null
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
  }

  return {
    token,
    adminUser,
    isAuthenticated,
    isAdmin,
    setLoginData,
    logout
  }
})

