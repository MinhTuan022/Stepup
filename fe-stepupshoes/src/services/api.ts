// ...existing code...
export const orderService = {
  createOrder: async (cart: any[]) => {
    // Tùy backend, có thể cần truyền thêm thông tin địa chỉ, phương thức thanh toán...
    const response = await fetch(`${API_BASE_URL}/v1/orders/create`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ items: cart }),
    });
    if (!response.ok) throw new Error("Lỗi khi tạo đơn hàng");
    return await response.json();
  },
};
import type { LoginRequest, JwtResponse, ApiResponse } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'




const getHeaders = (): HeadersInit => {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Admin Services

export const cartService = {
  getCart: async (maNguoiDung: number) => {
    const response = await fetch(`${API_BASE_URL}/v1/gio-hang/${maNguoiDung}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Lỗi khi tải giỏ hàng');
    return await response.json();
  },
  addToCart: async (maNguoiDung: number, maChiTiet: number, soLuong: number) => {
    const response = await fetch(`${API_BASE_URL}/v1/gio-hang/add?maNguoiDung=${maNguoiDung}&maChiTiet=${maChiTiet}&soLuong=${soLuong}`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Lỗi khi thêm vào giỏ hàng');
    return await response.json();
  },
  updateCartItem: async (maNguoiDung: number, maChiTiet: number, soLuong: number) => {
    const response = await fetch(`${API_BASE_URL}/v1/gio-hang/update?maNguoiDung=${maNguoiDung}&maChiTiet=${maChiTiet}&soLuong=${soLuong}`, {
      method: 'PUT',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Lỗi khi cập nhật giỏ hàng');
    return await response.json();
  },
  removeCartItem: async (maNguoiDung: number, maChiTiet: number) => {
    const response = await fetch(`${API_BASE_URL}/v1/gio-hang/remove?maNguoiDung=${maNguoiDung}&maChiTiet=${maChiTiet}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Lỗi khi xóa sản phẩm khỏi giỏ hàng');
    // API trả về ResponseEntity<Void> nên không có body
    return true;
  },
  clearCart: async (maNguoiDung: number) => {
    const response = await fetch(`${API_BASE_URL}/v1/gio-hang/clear/${maNguoiDung}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Lỗi khi xóa toàn bộ giỏ hàng');
    // API trả về ResponseEntity<Void> nên không có body
    return true;
  },
};
export const authService = {
    register: async (userData: any) => {
      const response = await fetch(`${API_BASE_URL}/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Đăng ký thất bại');
      }
      const data: ApiResponse<any> = await response.json();
      return data.data;
    },
  login: async (credentials: LoginRequest): Promise<JwtResponse> => {
    const response = await fetch(`${API_BASE_URL}/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Đăng nhập thất bại')
    }

    const data: ApiResponse<JwtResponse> = await response.json()
    if (data.data) {
      localStorage.setItem('token', data.data.accessToken)
      localStorage.setItem('user', JSON.stringify(data.data))
    }
    return data.data
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  getToken: (): string | null => {
    return localStorage.getItem('token')
  },

  getUser: (): JwtResponse | null => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },
}

// User Services
export const userService = {
  getUserProfile: async (userId: number) => {
    const response = await fetch(`${API_BASE_URL}/v1/users/${userId}/profile`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Lỗi khi tải thông tin người dùng');
    const data: ApiResponse<any> = await response.json();
    return data.data;
  },

  updateUserProfile: async (userId: number, userData: any) => {
    const response = await fetch(`${API_BASE_URL}/v1/users/${userId}/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Lỗi khi cập nhật thông tin');
    const data: ApiResponse<any> = await response.json();
    return data.data;
  },

  changePassword: async (userId: number, oldPassword: string, newPassword: string) => {
    const response = await fetch(`${API_BASE_URL}/v1/users/${userId}/change-password`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ oldPassword, newPassword }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Lỗi khi đổi mật khẩu');
    }
    const data: ApiResponse<string> = await response.json();
    return data;
  },

  getUserOrders: async (userId: number, status?: string) => {
    const url = status 
      ? `${API_BASE_URL}/v1/users/${userId}/orders?status=${status}`
      : `${API_BASE_URL}/v1/users/${userId}/orders`;
    const response = await fetch(url, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Lỗi khi tải danh sách đơn hàng');
    const data: ApiResponse<any[]> = await response.json();
    return data.data;
  },

  getOrderDetail: async (userId: number, orderId: number) => {
    const response = await fetch(`${API_BASE_URL}/v1/users/${userId}/orders/${orderId}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Lỗi khi tải chi tiết đơn hàng');
    const data: ApiResponse<any> = await response.json();
    return data.data;
  },

  getUserStats: async (userId: number) => {
    const response = await fetch(`${API_BASE_URL}/v1/users/${userId}/stats`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Lỗi khi tải thống kê');
    const data: ApiResponse<any> = await response.json();
    return data.data;
  },

  createOrder: async (userId: number, orderData: {
    nguoiNhan: string;
    soDienThoaiNhan: string;
    diaChiGiaoHang: string;
    ghiChu?: string;
    maVoucher?: string;
    items: Array<{ maChiTiet: number; soLuong: number }>;
  }) => {
    const response = await fetch(`${API_BASE_URL}/v1/users/${userId}/orders`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(orderData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Lỗi khi tạo đơn hàng');
    }
    const data: ApiResponse<any> = await response.json();
    return data.data;
  },

  validateVoucher: async (code: string, tongTien: number) => {
    const response = await fetch(`${API_BASE_URL}/v1/users/validate-voucher`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ code, tongTien }),
    });
    if (!response.ok) {
      throw new Error('Lỗi khi kiểm tra voucher');
    }
    const data: ApiResponse<any> = await response.json();
    return data.data;
  },
};

// Admin Services
export const adminService = {
  // Statistics APIs
  getStatistics: async () => {
    const response = await fetch(`${API_BASE_URL}/v1/admin/statistics/overview`, {
      headers: getHeaders(),
    })
    if (!response.ok) throw new Error('Failed to fetch statistics')
    const data: ApiResponse<any> = await response.json()
    return data.data
  },

  getRevenueStats: async (fromDate: string, toDate: string) => {
    const response = await fetch(
      `${API_BASE_URL}/v1/admin/statistics/revenue?fromDate=${fromDate}&toDate=${toDate}`,
      { headers: getHeaders() }
    )
    if (!response.ok) throw new Error('Failed to fetch revenue stats')
    const data: ApiResponse<any> = await response.json()
    return data.data
  },

  getTopProducts: async (limit: number = 10) => {
    const response = await fetch(
      `${API_BASE_URL}/v1/admin/statistics/top-products?limit=${limit}`,
      { headers: getHeaders() }
    )
    if (!response.ok) throw new Error('Failed to fetch top products')
    const data: ApiResponse<any> = await response.json()
    return data.data
  },

  // Category (DanhMuc) APIs
  getAllCategories: async () => {
    const response = await fetch(`${API_BASE_URL}/v1/danh-muc`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Lỗi khi tải danh mục');
    const data: ApiResponse<any> = await response.json();
    return data.data;
  },

  createCategory: async (categoryData: any) => {
    const response = await fetch(`${API_BASE_URL}/v1/danh-muc`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(categoryData),
    });
    if (!response.ok) throw new Error('Thêm danh mục thất bại');
    const data: ApiResponse<any> = await response.json();
    return data.data;
  },

  updateCategory: async (id: number, categoryData: any) => {
    const response = await fetch(`${API_BASE_URL}/v1/danh-muc/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(categoryData),
    });
    if (!response.ok) throw new Error('Cập nhật danh mục thất bại');
    const data: ApiResponse<any> = await response.json();
    return data.data;
  },

  deleteCategory: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/v1/danh-muc/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Xóa danh mục thất bại');
    const data: ApiResponse<any> = await response.json();
    return data.data;
  },

  // User Management APIs
  getAllUsers: async (page: number = 0, size: number = 10) => {
    const response = await fetch(
      `${API_BASE_URL}/v1/admin/users?page=${page}&size=${size}`,
      { headers: getHeaders() }
    )
    if (!response.ok) throw new Error('Failed to fetch users')
    const data: ApiResponse<any> = await response.json()
    return data.data
  },

  getUserById: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/v1/admin/users/${id}`, {
      headers: getHeaders(),
    })
    if (!response.ok) throw new Error('Failed to fetch user')
    const data: ApiResponse<any> = await response.json()
    return data.data
  },

  createUser: async (userData: any) => {
    const response = await fetch(`${API_BASE_URL}/v1/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userData),
    })
    if (!response.ok) throw new Error('Failed to create user')
    const data: ApiResponse<any> = await response.json()
    return data.data
  },

  updateUser: async (id: number, userData: any) => {
    const response = await fetch(`${API_BASE_URL}/v1/admin/users/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(userData),
    })
    if (!response.ok) throw new Error('Failed to update user')
    const data: ApiResponse<any> = await response.json()
    return data.data
  },

  lockUser: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/v1/admin/users/${id}/lock`, {
      method: 'PUT',
      headers: getHeaders(),
    })
    if (!response.ok) throw new Error('Failed to lock user')
    const data: ApiResponse<any> = await response.json()
    return data.data
  },

  deleteUser: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/v1/admin/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    })
    if (!response.ok) throw new Error('Failed to delete user')
    const data: ApiResponse<any> = await response.json()
    return data.data
  },

  // Order Management APIs
  getAllOrders: async (page: number = 0, size: number = 10, status?: string) => {
    const url = new URL(`${API_BASE_URL}/v1/admin/orders`)
    url.searchParams.append('page', page.toString())
    url.searchParams.append('size', size.toString())
    url.searchParams.append('sort', 'ngayDatHang,desc')
    if (status) url.searchParams.append('status', status)

    const response = await fetch(url.toString(), { headers: getHeaders() })
    if (!response.ok) throw new Error('Failed to fetch orders')
    const data: ApiResponse<any> = await response.json()
    return data.data
  },

  getOrderById: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/v1/admin/orders/${id}`, {
      headers: getHeaders(),
    })
    if (!response.ok) throw new Error('Failed to fetch order')
    const data: ApiResponse<any> = await response.json()
    return data.data
  },

  updateOrderStatus: async (id: number, status: string) => {
    const response = await fetch(
      `${API_BASE_URL}/v1/admin/orders/${id}/status?status=${status}`,
      {
        method: 'PUT',
        headers: getHeaders(),
      }
    )
    if (!response.ok) throw new Error('Failed to update order status')
    const data: ApiResponse<any> = await response.json()
    return data.data
  },

  updateOrder: async (id: number, orderData: any) => {
    const response = await fetch(`${API_BASE_URL}/v1/admin/orders/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(orderData),
    })
    if (!response.ok) throw new Error('Failed to update order')
    const data: ApiResponse<any> = await response.json()
    return data.data
  },

  deleteOrder: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/v1/admin/orders/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    })
    if (!response.ok) throw new Error('Failed to delete order')
    const data: ApiResponse<any> = await response.json()
    return data.data
  },

  // Voucher Management APIs
  getAllVouchers: async (page: number = 0, size: number = 10) => {
    const response = await fetch(
      `${API_BASE_URL}/v1/admin/vouchers?page=${page}&size=${size}`,
      { headers: getHeaders() }
    )
    if (!response.ok) throw new Error('Failed to fetch vouchers')
    const data: ApiResponse<any> = await response.json()
    return data.data
  },

  getVoucherById: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/v1/admin/vouchers/${id}`, {
      headers: getHeaders(),
    })
    if (!response.ok) throw new Error('Failed to fetch voucher')
    const data: ApiResponse<any> = await response.json()
    return data.data
  },

  createVoucher: async (voucherData: any) => {
    const response = await fetch(`${API_BASE_URL}/v1/admin/vouchers`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(voucherData),
    })
    if (!response.ok) throw new Error('Failed to create voucher')
    const data: ApiResponse<any> = await response.json()
    return data.data
  },

  updateVoucher: async (id: number, voucherData: any) => {
    const response = await fetch(`${API_BASE_URL}/v1/admin/vouchers/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(voucherData),
    })
    if (!response.ok) throw new Error('Failed to update voucher')
    const data: ApiResponse<any> = await response.json()
    return data.data
  },

  deleteVoucher: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/v1/admin/vouchers/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    })
    if (!response.ok) throw new Error('Failed to delete voucher')
    const data: ApiResponse<any> = await response.json()
    return data.data
  },

  // Review Management APIs
  getAllReviews: async (page: number = 0, size: number = 10, status?: number) => {
    const url = new URL(`${API_BASE_URL}/v1/admin/reviews`)
    url.searchParams.append('page', page.toString())
    url.searchParams.append('size', size.toString())
    if (status !== undefined) url.searchParams.append('status', status.toString())

    const response = await fetch(url.toString(), { headers: getHeaders() })
    if (!response.ok) throw new Error('Failed to fetch reviews')
    const data: ApiResponse<any> = await response.json()
    return data.data
  },

  approveReview: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/v1/admin/reviews/${id}/approve`, {
      method: 'PUT',
      headers: getHeaders(),
    })
    if (!response.ok) throw new Error('Failed to approve review')
    const data: ApiResponse<any> = await response.json()
    return data.data
  },

  rejectReview: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/v1/admin/reviews/${id}/reject`, {
      method: 'PUT',
      headers: getHeaders(),
    })
    if (!response.ok) throw new Error('Failed to reject review')
    const data: ApiResponse<any> = await response.json()
    return data.data
  },

  deleteReview: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/v1/admin/reviews/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    })
    if (!response.ok) throw new Error('Failed to delete review')
    const data: ApiResponse<any> = await response.json()
    return data.data
  },

  // Counter Order (POS) APIs
  createCounterOrder: async (orderData: {
    maNguoiDung: number
    nguoiNhan: string
    soDienThoaiNhan: string
    diaChiGiaoHang?: string
  }) => {
    const response = await fetch(`${API_BASE_URL}/v1/admin/orders/tai-quay`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(orderData),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create counter order')
    }
    const data: ApiResponse<any> = await response.json()
    return data.data
  },

  addItemToOrder: async (orderId: number, itemData: { maChiTiet: number; soLuong: number }) => {
    const response = await fetch(`${API_BASE_URL}/v1/admin/orders/${orderId}/items`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(itemData),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to add item to order')
    }
    const data: ApiResponse<any> = await response.json()
    return data.data
  },

  removeItemFromOrder: async (orderId: number, maChiTiet: number) => {
    const response = await fetch(`${API_BASE_URL}/v1/admin/orders/${orderId}/items/${maChiTiet}`, {
      method: 'DELETE',
      headers: getHeaders(),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to remove item from order')
    }
    const data: ApiResponse<any> = await response.json()
    return data.data
  },

  applyVoucherToOrder: async (orderId: number, code: string) => {
    const response = await fetch(
      `${API_BASE_URL}/v1/admin/orders/${orderId}/voucher?code=${code}`,
      {
        method: 'POST',
        headers: getHeaders(),
      }
    )
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to apply voucher')
    }
    const data: ApiResponse<any> = await response.json()
    return data.data
  },

  finalizeCounterOrder: async (orderId: number, phuongThucThanhToan: string) => {
    const response = await fetch(
      `${API_BASE_URL}/v1/admin/orders/${orderId}/finalize?phuongThucThanhToan=${phuongThucThanhToan}`,
      {
        method: 'PUT',
        headers: getHeaders(),
      }
    )
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to finalize order')
    }
    const data: ApiResponse<any> = await response.json()
    return data.data
  },

  // Get available products for counter orders
  // Product APIs
  getProducts: async () => {
    const response = await fetch(`${API_BASE_URL}/v1/san-pham`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Không lấy được danh sách sản phẩm');
    const data: ApiResponse<any> = await response.json();
    return data.data;
  },


  getProductDetailsByProductId: async (maSanPham: number) => {
    const response = await fetch(`${API_BASE_URL}/v1/chi-tiet-san-pham/san-pham/${maSanPham}`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Không lấy được chi tiết sản phẩm');
    const data: ApiResponse<any> = await response.json();
    return data.data;
  },

  createProduct: async (productData: any) => {
    const response = await fetch(`${API_BASE_URL}/v1/san-pham`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(productData),
    });
    if (!response.ok) throw new Error('Không tạo được sản phẩm');
    const data: ApiResponse<any> = await response.json();
    return data.data;
  },

  updateProduct: async (id: number, productData: any) => {
    const response = await fetch(`${API_BASE_URL}/v1/san-pham/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(productData),
    });
    if (!response.ok) throw new Error('Không cập nhật được sản phẩm');
    const data: ApiResponse<any> = await response.json();
    return data.data;
  },

  deleteProduct: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/v1/san-pham/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error('Không xóa được sản phẩm');
    const data: ApiResponse<any> = await response.json();
    return data.data;
  },
}
