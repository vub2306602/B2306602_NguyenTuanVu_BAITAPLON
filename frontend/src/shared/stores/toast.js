import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([])

  function show(message, type = 'success', duration = 3000) {
    const id = Date.now() + Math.random()
    toasts.value.push({ id, message, type })
    setTimeout(() => {
      remove(id)
    }, duration)
  }

  function remove(id) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  function success(msg) { show(msg, 'success') }
  function error(msg) { show(msg, 'danger') }
  function warning(msg) { show(msg, 'warning') }
  function info(msg) { show(msg, 'info') }

  return { toasts, show, remove, success, error, warning, info }
})

