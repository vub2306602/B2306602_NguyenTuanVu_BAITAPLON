import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { clientBorrowService } from '@/shared/services/clientServices'
import { useToastStore } from '@/shared/stores/toast'
import { useClientAuthStore } from './auth'

export const useCartStore = defineStore('cart', () => {
  const authStore = useClientAuthStore()
  const toast = useToastStore()

  // Xác định key lưu trữ giỏ hàng riêng biệt theo từng độc giả (tránh trùng lặp khi đổi tài khoản)
  function getStorageKey() {
    return authStore.user?.MaDocGia
      ? `client_cart_${authStore.user.MaDocGia}`
      : 'client_cart_guest'
  }

  function getStoredItems() {
    // Dọn dẹp key cũ dùng chung nếu còn tồn tại
    if (localStorage.getItem('client_cart')) {
      localStorage.removeItem('client_cart')
    }
    const key = getStorageKey()
    try {
      return JSON.parse(localStorage.getItem(key) || '[]')
    } catch {
      return []
    }
  }

  const items = ref(getStoredItems())
  const borrowStatus = ref({
    isQuaHan: false,
    dangMuonCount: 0,
    soLuongConLai: 5,
    toiDa: 5
  })
  const loadingStatus = ref(false)

  function saveToStorage() {
    const key = getStorageKey()
    localStorage.setItem(key, JSON.stringify(items.value))
  }

  // Chuyển đổi giỏ hàng khi người dùng thay đổi
  function loadCartForUser() {
    items.value = getStoredItems()
  }

  // Tự động lắng nghe sự thay đổi tài khoản độc giả (Đăng nhập / Đăng xuất / Đổi tài khoản)
  watch(
    () => authStore.user?.MaDocGia,
    () => {
      loadCartForUser()
      fetchBorrowStatus()
    }
  )

  const totalCount = computed(() => {
    return items.value.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0)
  })

  const totalUniqueBooks = computed(() => items.value.length)

  const isOverdue = computed(() => borrowStatus.value.isQuaHan)

  const maxAllowed = computed(() => {
    if (!authStore.isAuthenticated) return 5
    return borrowStatus.value.soLuongConLai
  })

  async function fetchBorrowStatus() {
    if (!authStore.isAuthenticated) {
      borrowStatus.value = {
        isQuaHan: false,
        dangMuonCount: 0,
        soLuongConLai: 5,
        toiDa: 5
      }
      return
    }

    loadingStatus.value = true
    try {
      const res = await clientBorrowService.getTrangThaiDocGia()
      if (res.success && res.data) {
        borrowStatus.value = res.data
      }
    } catch (err) {
      console.error('Lỗi lấy trạng thái mượn sách:', err)
    } finally {
      loadingStatus.value = false
    }
  }

  function addItem(book, quantity = 1) {
    const authStore = useClientAuthStore()

    // 1. Kiểm tra sách còn hàng không
    if (book.SoQuyen <= 0) {
      toast.error(`Sách "${book.TenSach}" hiện đã hết hàng trong kho.`)
      return false
    }

    // 2. Nếu độc giả đăng nhập và đang có sách quá hạn
    if (authStore.isAuthenticated && isOverdue.value) {
      toast.error('Bạn đang có sách quá hạn chưa hoàn trả! Không thể thêm sách vào giỏ mượn.')
      return false
    }

    // 3. Kiểm tra hạn mức tối đa 5 quyển
    const addQty = parseInt(quantity) || 1
    const allowed = maxAllowed.value
    if (totalCount.value + addQty > allowed) {
      if (authStore.isAuthenticated) {
        toast.warning(
          `Mỗi độc giả chỉ được mượn tối đa 5 quyển. Bạn đang mượn/chờ duyệt ${borrowStatus.value.dangMuonCount} quyển, nên chỉ có thể chọn thêm tối đa ${allowed} quyển!`
        )
      } else {
        toast.warning(`Giỏ hàng chỉ được chứa tối đa 5 quyển sách!`)
      }
      return false
    }

    // 4. Tìm sách trong giỏ
    const existingIndex = items.value.findIndex(i => i.book.MaSach === book.MaSach)
    if (existingIndex > -1) {
      const existing = items.value[existingIndex]
      if (existing.quantity + addQty > book.SoQuyen) {
        toast.warning(`Sách "${book.TenSach}" trong kho chỉ còn ${book.SoQuyen} quyển!`)
        return false
      }
      existing.quantity += addQty
    } else {
      if (addQty > book.SoQuyen) {
        toast.warning(`Sách "${book.TenSach}" trong kho chỉ còn ${book.SoQuyen} quyển!`)
        return false
      }
      items.value.push({
        book: {
          _id: book._id,
          MaSach: book.MaSach,
          TenSach: book.TenSach,
          TacGia: book.TacGia,
          TenTacGia: book.TenTacGia || book.TacGia,
          DonGia: book.DonGia,
          SoQuyen: book.SoQuyen,
          NamXuatBan: book.NamXuatBan,
          HinhAnhUrl: book.HinhAnhUrl,
          MaTheLoai: book.MaTheLoai,
          MaNXB: book.MaNXB
        },
        quantity: addQty
      })
    }

    saveToStorage()
    toast.success(`Đã thêm "${book.TenSach}" vào giỏ mượn thành công!`)
    return true
  }

  function updateQuantity(maSach, newQuantity) {
    const qty = parseInt(newQuantity)
    const existingIndex = items.value.findIndex(i => i.book.MaSach === maSach)
    if (existingIndex === -1) return false

    if (qty <= 0) {
      removeItem(maSach)
      return true
    }

    const item = items.value[existingIndex]
    if (qty > item.book.SoQuyen) {
      toast.warning(`Sách "${item.book.TenSach}" chỉ còn ${item.book.SoQuyen} quyển trong kho!`)
      return false
    }

    // Tính tổng số lượng nếu thay đổi
    const otherQty = items.value
      .filter(i => i.book.MaSach !== maSach)
      .reduce((s, i) => s + i.quantity, 0)

    if (otherQty + qty > maxAllowed.value) {
      toast.warning(`Tổng số sách mượn không được vượt quá ${maxAllowed.value} quyển!`)
      return false
    }

    item.quantity = qty
    saveToStorage()
    return true
  }

  function removeItem(maSach) {
    items.value = items.value.filter(i => i.book.MaSach !== maSach)
    saveToStorage()
    toast.info('Đã xóa sách khỏi giỏ mượn.')
  }

  function clearCart() {
    items.value = []
    const key = getStorageKey()
    localStorage.removeItem(key)
    localStorage.removeItem('client_cart')
  }

  return {
    items,
    borrowStatus,
    loadingStatus,
    totalCount,
    totalUniqueBooks,
    isOverdue,
    maxAllowed,
    loadCartForUser,
    fetchBorrowStatus,
    addItem,
    updateQuantity,
    removeItem,
    clearCart
  }
})

