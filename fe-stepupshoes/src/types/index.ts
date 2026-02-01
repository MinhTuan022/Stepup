// Auth types
export interface LoginRequest {
  tenDangNhap: string
  matKhau: string
}

export interface JwtResponse {
  accessToken: string
  tokenType: string
  maNguoiDung: number
  tenDangNhap: string
  email: string
  vaiTro: 'khach_hang' | 'nhan_vien' | 'quan_tri'
}

export interface AuthContextType {
  user: JwtResponse | null
  isLoading: boolean
  error: string | null
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}
// Admin types
export interface User {
  maNguoiDung: number
  tenDangNhap: string
  matKhau?: string
  hoTen: string
  email: string
  soDienThoai: string
  diaChi: string
  vaiTro: string
  ngayTao?: string
  trangThai?: boolean
}

export interface Order {
  maDonHang: number
  maNguoiDung: number
  hoTen: string
  soDienThoai: string
  diaChi: string
  trangThai: string
  tongTien: number
  ghiChu?: string
  ngayTao?: string
}

export interface OrderDetail {
  chiTietDonHang: ChiTietDonHangItem[]
  maDonHang: number
  hoTen: string
  soDienThoai: string
  diaChi: string
  trangThai: string
  tongTien: number
}

export interface ChiTietDonHangItem {
  maSanPham: number
  tenSanPham: string
  soLuong: number
  giaBan: number
}

export interface Voucher {
  maVoucher: number
  maNguoiDung?: number
  maVoucherCode: string
  moTa: string
  giaTriGiam: number
  loaiGiam: string
  dieuKienThamGia: number
  ngayBatDau: string
  ngayKetThuc: string
  soLuong: number
  soLuongSuDung?: number
  trangThai?: boolean
}

export interface Review {
  maDanhGia: number
  maSanPham: number
  maNguoiDung: number
  tenSanPham?: string
  tenNguoiDung?: string
  diem: number
  nhanXet: string
  trangThai: number
  ngayTao?: string
}

export interface Statistics {
  totalUsers?: number
  totalOrders?: number
  totalProducts?: number
  totalRevenue?: number
  ordersThisMonth?: number
  activeProducts?: number
  inactiveProducts?: number
  ordersByStatus?: Record<string, number>
  topProducts?: Array<{ tenSanPham: string; soLuong: number }>
}

export interface PaginationResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  currentPage: number
  pageSize: number
}