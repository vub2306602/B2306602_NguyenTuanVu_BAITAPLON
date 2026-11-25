import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useConfirmStore = defineStore('confirm', () => {
  const isOpen = ref(false)
  const title = ref('Xác nhận')
  const message = ref('')
  const type = ref('primary') // 'primary' | 'danger' | 'warning' | 'info' | 'success'
  const confirmText = ref('Xác nhận')
  const cancelText = ref('Hủy bỏ')
  const showCancel = ref(true)
  const requiresInput = ref(false)
  const inputPlaceholder = ref('')
  const inputLabel = ref('')
  const inputValue = ref('')
  let resolvePromise = null

  function ask(options = {}) {
    title.value = options.title || 'Xác nhận hành động'
    message.value = options.message || 'Bạn có chắc chắn muốn thực hiện hành động này?'
    type.value = options.type || 'primary'
    confirmText.value = options.confirmText || 'Xác nhận'
    cancelText.value = options.cancelText || 'Hủy bỏ'
    showCancel.value = options.showCancel !== false
    requiresInput.value = !!options.requiresInput
    inputPlaceholder.value = options.inputPlaceholder || ''
    inputLabel.value = options.inputLabel || ''
    inputValue.value = options.inputValue || ''
    isOpen.value = true

    return new Promise((resolve) => {
      resolvePromise = resolve
    })
  }

  function alert(options = {}) {
    return ask({
      title: options.title || 'Thông báo',
      message: typeof options === 'string' ? options : (options.message || ''),
      type: options.type || 'info',
      confirmText: options.confirmText || 'Đã hiểu',
      showCancel: false
    })
  }

  function prompt(options = {}) {
    return ask({
      title: options.title || 'Yêu cầu thông tin',
      message: options.message || '',
      type: options.type || 'warning',
      confirmText: options.confirmText || 'Xác nhận',
      cancelText: options.cancelText || 'Hủy',
      requiresInput: true,
      inputPlaceholder: options.inputPlaceholder || '',
      inputLabel: options.inputLabel || '',
      inputValue: options.inputValue || ''
    })
  }

  function confirm() {
    isOpen.value = false
    if (resolvePromise) {
      if (requiresInput.value) {
        resolvePromise(inputValue.value)
      } else {
        resolvePromise(true)
      }
      resolvePromise = null
    }
  }

  function cancel() {
    isOpen.value = false
    if (resolvePromise) {
      if (requiresInput.value) {
        resolvePromise(null)
      } else {
        resolvePromise(false)
      }
      resolvePromise = null
    }
  }

  return {
    isOpen,
    title,
    message,
    type,
    confirmText,
    cancelText,
    showCancel,
    requiresInput,
    inputPlaceholder,
    inputLabel,
    inputValue,
    ask,
    alert,
    prompt,
    confirm,
    cancel
  }
})

