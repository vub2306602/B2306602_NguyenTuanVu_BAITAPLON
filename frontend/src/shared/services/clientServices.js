import apiClient from '@/shared/services/api'

export const clientAuthService = {
  register: (data) => apiClient.post('/auth/docgia/register', data),
  login: (data) => apiClient.post('/auth/docgia/login', data),
  getMe: () => apiClient.get('/auth/docgia/me'),
  changePassword: (data) => apiClient.put('/auth/docgia/change-password', data),
}

export const clientBookService = {
  getAll: (params) => apiClient.get('/sach', { params }),
  getById: (id) => apiClient.get(`/sach/${id}`),
  getCategories: () => apiClient.get('/theloai'),
  getPublishers: () => apiClient.get('/nhaxuatban'),
  getAuthors: (params) => apiClient.get('/tacgia', { params })
}

export const clientBorrowService = {
  datMuon: (data) => apiClient.post('/muontra/dat-muon', data),
  datMuonGioHang: (data) => apiClient.post('/muontra/dat-muon-gio-hang', data),
  getTrangThaiDocGia: () => apiClient.get('/muontra/trang-thai-doc-gia'),
  getLichSu: () => apiClient.get('/muontra/lich-su-ca-nhan'),
  huyYeuCau: (id) => apiClient.put(`/muontra/huy-yeu-cau/${id}`),
}

