import apiClient from '@/shared/services/api'

export const authService = {
  loginAdmin: (data) => apiClient.post('/auth/nhanvien/login', data),
  getMeAdmin: () => apiClient.get('/auth/nhanvien/me')
}

export const thongKeService = {
  getTongQuan: () => apiClient.get('/thongke/tong-quan'),
  getTheoTheLoai: () => apiClient.get('/thongke/theo-the-loai'),
  getTheoTacGia: () => apiClient.get('/thongke/theo-tac-gia'),
  getTheoNhaXuatBan: () => apiClient.get('/thongke/theo-nha-xuat-ban'),
  getSachMuonNhieu: () => apiClient.get('/thongke/sach-muon-nhieu'),
  getQuaHan: () => apiClient.get('/thongke/qua-han')
}

export const theLoaiService = {
  getAll: (params) => apiClient.get('/theloai', { params }),
  create: (data) => apiClient.post('/theloai', data),
  update: (id, data) => apiClient.put(`/theloai/${id}`, data),
  delete: (id) => apiClient.delete(`/theloai/${id}`)
}

export const tacGiaService = {
  getAll: (params) => apiClient.get('/tacgia', { params }),
  getById: (id) => apiClient.get(`/tacgia/${id}`),
  create: (data) => apiClient.post('/tacgia', data),
  update: (id, data) => apiClient.put(`/tacgia/${id}`, data),
  delete: (id) => apiClient.delete(`/tacgia/${id}`)
}

export const nxbService = {
  getAll: (params) => apiClient.get('/nhaxuatban', { params }),
  create: (data) => apiClient.post('/nhaxuatban', data),
  update: (id, data) => apiClient.put(`/nhaxuatban/${id}`, data),
  delete: (id) => apiClient.delete(`/nhaxuatban/${id}`)
}

export const sachService = {
  getAll: (params) => apiClient.get('/sach', { params }),
  getById: (id) => apiClient.get(`/sach/${id}`),
  create: (formData) => apiClient.post('/sach', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, formData) => apiClient.put(`/sach/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => apiClient.delete(`/sach/${id}`)
}

export const docGiaService = {
  getAll: (params) => apiClient.get('/docgia', { params }),
  getById: (id) => apiClient.get(`/docgia/${id}`),
  update: (id, data) => apiClient.put(`/docgia/${id}`, data),
  toggleKhoa: (id) => apiClient.put(`/docgia/${id}/khoa`),
  resetPassword: (id, data) => apiClient.put(`/docgia/${id}/reset-password`, data),
  delete: (id) => apiClient.delete(`/docgia/${id}`)
}

export const nhanVienService = {
  getAll: (params) => apiClient.get('/nhanvien', { params }),
  create: (data) => apiClient.post('/nhanvien', data),
  update: (id, data) => apiClient.put(`/nhanvien/${id}`, data),
  doiQuyen: (id, data) => apiClient.put(`/nhanvien/${id}/quyen`, data),
  toggleKhoa: (id) => apiClient.put(`/nhanvien/${id}/khoa`),
  delete: (id) => apiClient.delete(`/nhanvien/${id}`)
}

export const muonTraService = {
  getAll: (params) => apiClient.get('/muontra', { params }),
  getById: (id) => apiClient.get(`/muontra/${id}`),
  duyet: (id, data) => apiClient.put(`/muontra/duyet/${id}`, data || {}),
  tuChoi: (id, data) => apiClient.put(`/muontra/tu-choi/${id}`, data),
  xacNhanTra: (id, data) => apiClient.put(`/muontra/tra-sach/${id}`, data || {})
}

