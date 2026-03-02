/**
 * CounterOrderTab Component
 * 
 * Tạo và quản lý đơn hàng tại quầy (POS - Point of Sale).
 * - Hỗ trợ cả khách hàng đã đăng ký và khách vãng lai
 * - Chọn sản phẩm và số lượng
 * - Áp dụng voucher giảm giá
 * - CHỈ hỗ trợ thanh toán bằng tiền mặt tại quầy
 * - Hoàn thành đơn hàng ngay sau khi thanh toán
 */

import React, { useState, useEffect } from 'react'
import { adminService } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import './CounterOrderTab.css'

interface Product {
  maSanPham: number
  tenSanPham: string
  thuongHieu: string
  giaCoBan: number
}

interface ProductDetail {
  maChiTiet: number
  maSanPham: number
  tenSanPham: string
  mauSac: string
  size: string
  giaBan: number
  soLuongTon: number
  hinhAnhChinh?: string
}

interface OrderItem {
  maChiTiet: number
  tenSanPham: string
  mauSac: string
  size: string
  soLuong: number
  donGia: number
  thanhTien: number
  soLuongTon: number
}

interface CounterOrder {
  maDonHang: number
  tongTien: number
  phiVanChuyen: number
  giamGia: number
  thanhTien: number
}

const CounterOrderTab: React.FC = () => {
  const { showToast } = useToast()
  
  // State cho thông tin khách hàng
  const [customerType, setCustomerType] = useState<'registered' | 'guest'>('guest')
  const [maNguoiDung, setMaNguoiDung] = useState<number>(0)
  const [nguoiNhan, setNguoiNhan] = useState('')
  const [soDienThoaiNhan, setSoDienThoaiNhan] = useState('')
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false)
  
  // State cho đơn hàng
  const [currentOrder, setCurrentOrder] = useState<CounterOrder | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  
  // State cho sản phẩm
  const [products, setProducts] = useState<Product[]>([])
  const [productDetails, setProductDetails] = useState<ProductDetail[]>([])
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null)
  const [selectedDetail, setSelectedDetail] = useState<ProductDetail | null>(null)
  const [selectedQuantity, setSelectedQuantity] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  
  // State cho voucher
  const [voucherCode, setVoucherCode] = useState('')
  const [appliedVoucher, setAppliedVoucher] = useState(false)
  
  // State UI
  const [isLoading, setIsLoading] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)

  // Load danh sách sản phẩm khi component mount
  useEffect(() => {
    loadProducts()
  }, [])

  // Load chi tiết sản phẩm khi chọn sản phẩm
  useEffect(() => {
    if (selectedProduct) {
      loadProductDetails(selectedProduct)
    }
  }, [selectedProduct])

  const loadProducts = async () => {
    try {
      const data = await adminService.getProducts()
      setProducts(data || [])
    } catch (error: any) {
      showToast(error.message || 'Lỗi khi tải danh sách sản phẩm', 'error')
    }
  }

  const loadProductDetails = async (maSanPham: number) => {
    try {
      const data = await adminService.getProductDetailsByProductId(maSanPham)
      setProductDetails(data || [])
    } catch (error: any) {
      showToast(error.message || 'Lỗi khi tải chi tiết sản phẩm', 'error')
    }
  }

  // Tìm kiếm khách hàng theo số điện thoại
  const searchCustomerByPhone = async (phone: string) => {
    if (!phone.trim() || phone.length < 10) return
    
    setIsSearchingCustomer(true)
    try {
      // Gọi API để tìm user theo số điện thoại
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/v1/admin/users/search-by-phone?phone=${phone}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      )
      
      if (response.ok) {
        const result = await response.json()
        if (result.data) {
          setMaNguoiDung(result.data.maNguoiDung)
          setNguoiNhan(result.data.hoTen)
          showToast('Đã tìm thấy khách hàng', 'success')
        } else {
          setMaNguoiDung(0)
          showToast('Không tìm thấy khách hàng với số điện thoại này', 'info')
        }
      } else {
        setMaNguoiDung(0)
      }
    } catch (error) {
      setMaNguoiDung(0)
      // Không hiển thị lỗi nếu không tìm thấy
    } finally {
      setIsSearchingCustomer(false)
    }
  }

  // Xử lý thay đổi số điện thoại cho khách đăng ký
  const handlePhoneChange = (phone: string) => {
    setSoDienThoaiNhan(phone)
    
    // Nếu là khách đã đăng ký, tự động tìm kiếm
    if (customerType === 'registered' && phone.length === 10) {
      searchCustomerByPhone(phone)
    } else if (customerType === 'guest') {
      setMaNguoiDung(0)
    }
  }

  // Tạo đơn hàng mới
  const handleCreateOrder = async () => {
    if (!nguoiNhan.trim()) {
      showToast('Vui lòng nhập tên khách hàng', 'error')
      return
    }
    if (!soDienThoaiNhan.trim()) {
      showToast('Vui lòng nhập số điện thoại', 'error')
      return
    }

    setIsLoading(true)
    try {
      const orderData = {
        maNguoiDung: customerType === 'registered' ? maNguoiDung : 0,
        nguoiNhan: nguoiNhan,
        soDienThoaiNhan: soDienThoaiNhan,
        diaChiGiaoHang: 'Tại quầy'
      }
      
      const newOrder = await adminService.createCounterOrder(orderData)
      setCurrentOrder(newOrder)
      setOrderItems([])
      setAppliedVoucher(false)
      showToast('Tạo đơn hàng thành công', 'success')
    } catch (error: any) {
      showToast(error.message || 'Lỗi khi tạo đơn hàng', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  // Mở modal chọn sản phẩm
  const handleOpenProductModal = () => {
    if (!currentOrder) {
      showToast('Vui lòng tạo đơn hàng trước', 'error')
      return
    }
    setShowProductModal(true)
    setSelectedProduct(null)
    setSelectedDetail(null)
    setSelectedQuantity(1)
    setSearchTerm('')
  }

  // Thêm sản phẩm vào đơn
  const handleAddItem = async () => {
    if (!currentOrder || !selectedDetail) {
      showToast('Vui lòng chọn sản phẩm', 'error')
      return
    }

    if (selectedQuantity <= 0) {
      showToast('Số lượng phải lớn hơn 0', 'error')
      return
    }

    if (selectedQuantity > selectedDetail.soLuongTon) {
      showToast(`Chỉ còn ${selectedDetail.soLuongTon} sản phẩm trong kho`, 'error')
      return
    }

    setIsLoading(true)
    try {
      const updatedOrder = await adminService.addItemToOrder(currentOrder.maDonHang, {
        maChiTiet: selectedDetail.maChiTiet,
        soLuong: selectedQuantity
      })
      
      setCurrentOrder(updatedOrder)
      
      // Cập nhật danh sách items từ API response
      if (updatedOrder.chiTietDonHangs && updatedOrder.chiTietDonHangs.length > 0) {
        const items: OrderItem[] = updatedOrder.chiTietDonHangs.map((item: any) => ({
          maChiTiet: item.maChiTiet,
          tenSanPham: item.tenSanPham,
          mauSac: item.mauSac,
          size: item.size,
          soLuong: item.soLuong,
          donGia: item.donGia,
          thanhTien: item.thanhTien,
          soLuongTon: selectedDetail.soLuongTon // Giữ thông tin tồn kho hiện tại
        }))
        setOrderItems(items)
      }
      
      setShowProductModal(false)
      showToast('Thêm sản phẩm thành công', 'success')
    } catch (error: any) {
      showToast(error.message || 'Lỗi khi thêm sản phẩm', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  // Xóa sản phẩm khỏi đơn
  const handleRemoveItem = async (maChiTiet: number) => {
    if (!currentOrder) return

    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) return

    setIsLoading(true)
    try {
      const updatedOrder = await adminService.removeItemFromOrder(currentOrder.maDonHang, maChiTiet)
      setCurrentOrder(updatedOrder)
      
      // Cập nhật danh sách items từ API response
      if (updatedOrder.chiTietDonHangs && updatedOrder.chiTietDonHangs.length > 0) {
        const items: OrderItem[] = updatedOrder.chiTietDonHangs.map((item: any) => ({
          maChiTiet: item.maChiTiet,
          tenSanPham: item.tenSanPham,
          mauSac: item.mauSac,
          size: item.size,
          soLuong: item.soLuong,
          donGia: item.donGia,
          thanhTien: item.thanhTien,
          soLuongTon: 0 // Không cần thiết cho hiển thị
        }))
        setOrderItems(items)
      } else {
        setOrderItems([])
      }
      
      showToast('Xóa sản phẩm thành công', 'success')
    } catch (error: any) {
      showToast(error.message || 'Lỗi khi xóa sản phẩm', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  // Áp dụng voucher
  const handleApplyVoucher = async () => {
    if (!currentOrder) {
      showToast('Chưa có đơn hàng', 'error')
      return
    }

    if (!voucherCode.trim()) {
      showToast('Vui lòng nhập mã voucher', 'error')
      return
    }

    if (orderItems.length === 0) {
      showToast('Vui lòng thêm sản phẩm vào đơn hàng', 'error')
      return
    }

    setIsLoading(true)
    try {
      const updatedOrder = await adminService.applyVoucherToOrder(currentOrder.maDonHang, voucherCode)
      setCurrentOrder(updatedOrder)
      
      // Cập nhật danh sách items từ API response nếu có
      if (updatedOrder.chiTietDonHangs && updatedOrder.chiTietDonHangs.length > 0) {
        const items: OrderItem[] = updatedOrder.chiTietDonHangs.map((item: any) => ({
          maChiTiet: item.maChiTiet,
          tenSanPham: item.tenSanPham,
          mauSac: item.mauSac,
          size: item.size,
          soLuong: item.soLuong,
          donGia: item.donGia,
          thanhTien: item.thanhTien,
          soLuongTon: 0
        }))
        setOrderItems(items)
      }
      
      setAppliedVoucher(true)
      showToast('Áp dụng voucher thành công', 'success')
    } catch (error: any) {
      showToast(error.message || 'Lỗi khi áp dụng voucher', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  // Hoàn thành đơn hàng (thanh toán tiền mặt)
  const handleFinalizeOrder = async () => {
    if (!currentOrder) {
      showToast('Chưa có đơn hàng', 'error')
      return
    }

    if (orderItems.length === 0) {
      showToast('Đơn hàng chưa có sản phẩm', 'error')
      return
    }

    if (!window.confirm(`Xác nhận thanh toán ${formatCurrency(currentOrder.thanhTien)} bằng tiền mặt?`)) {
      return
    }

    setIsLoading(true)
    try {
      await adminService.finalizeCounterOrder(currentOrder.maDonHang, 'tien_mat')
      showToast('Hoàn thành đơn hàng thành công', 'success')
      
      // Reset form
      setCurrentOrder(null)
      setOrderItems([])
      setNguoiNhan('')
      setSoDienThoaiNhan('')
      setMaNguoiDung(0)
      setVoucherCode('')
      setAppliedVoucher(false)
    } catch (error: any) {
      showToast(error.message || 'Lỗi khi hoàn thành đơn hàng', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  // Hủy đơn hàng
  const handleCancelOrder = () => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) return
    
    setCurrentOrder(null)
    setOrderItems([])
    setNguoiNhan('')
    setSoDienThoaiNhan('')
    setMaNguoiDung(0)
    setVoucherCode('')
    setAppliedVoucher(false)
    setCustomerType('guest')
    showToast('Đã hủy đơn hàng', 'info')
  }

  // Format tiền tệ
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  // Filter products theo search term
  const filteredProducts = products.filter(p => 
    p.tenSanPham.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.thuongHieu.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="counter-order-tab">
      <h2>Bán Hàng Tại Quầy</h2>

      {/* Thông tin khách hàng */}
      <div className="customer-section">
        <h3>Thông Tin Khách Hàng</h3>
        
        <div className="customer-type-selector">
          <label>
            <input
              type="radio"
              name="customerType"
              value="guest"
              checked={customerType === 'guest'}
              onChange={(e) => setCustomerType(e.target.value as 'guest')}
              disabled={!!currentOrder}
            />
            Khách vãng lai
          </label>
          <label>
            <input
              type="radio"
              name="customerType"
              value="registered"
              checked={customerType === 'registered'}
              onChange={(e) => setCustomerType(e.target.value as 'registered')}
              disabled={!!currentOrder}
            />
            Khách hàng đã đăng ký
          </label>
        </div>

        {customerType === 'registered' && maNguoiDung > 0 && (
          <div className="form-group">
            <label>Mã khách hàng:</label>
            <input
              type="number"
              value={maNguoiDung}
              disabled
              style={{ background: '#e8f5e9', color: '#2e7d32', fontWeight: 600 }}
            />
          </div>
        )}

        <div className="form-group">
          <label>Số điện thoại: *</label>
          <input
            type="tel"
            value={soDienThoaiNhan}
            onChange={(e) => handlePhoneChange(e.target.value)}
            disabled={!!currentOrder}
            placeholder="Nhập số điện thoại"
            required
          />
          {isSearchingCustomer && <small style={{ color: '#2196f3' }}>Đang tìm kiếm...</small>}
        </div>

        <div className="form-group">
          <label>Tên khách hàng: *</label>
          <input
            type="text"
            value={nguoiNhan}
            onChange={(e) => setNguoiNhan(e.target.value)}
            disabled={!!currentOrder || (customerType === 'registered' && maNguoiDung > 0)}
            placeholder={customerType === 'registered' ? 'Tự động điền sau khi nhập SĐT' : 'Nhập tên khách hàng'}
            required
          />
        </div>

        {!currentOrder && (
          <button 
            className="btn btn-primary"
            onClick={handleCreateOrder}
            disabled={isLoading}
          >
            Tạo Đơn Hàng
          </button>
        )}
      </div>

      {/* Danh sách sản phẩm trong đơn */}
      {currentOrder && (
        <>
          <div className="order-section">
            <div className="order-header">
              <h3>Đơn Hàng #{currentOrder.maDonHang}</h3>
              <button 
                className="btn btn-secondary"
                onClick={handleOpenProductModal}
                disabled={isLoading}
              >
                + Thêm Sản Phẩm
              </button>
            </div>

            {orderItems.length === 0 ? (
              <p className="empty-order">Chưa có sản phẩm trong đơn hàng</p>
            ) : (
              <div className="order-items">
                <table>
                  <thead>
                    <tr>
                      <th>Sản phẩm</th>
                      <th>Màu sắc</th>
                      <th>Size</th>
                      <th>Đơn giá</th>
                      <th>Số lượng</th>
                      <th>Thành tiền</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderItems.map((item) => (
                      <tr key={item.maChiTiet}>
                        <td>{item.tenSanPham}</td>
                        <td>{item.mauSac}</td>
                        <td>{item.size}</td>
                        <td>{formatCurrency(item.donGia)}</td>
                        <td>{item.soLuong}</td>
                        <td className="price">{formatCurrency(item.thanhTien)}</td>
                        <td>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleRemoveItem(item.maChiTiet)}
                            disabled={isLoading}
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Voucher */}
          <div className="voucher-section">
            <h3>Mã Giảm Giá</h3>
            <div className="voucher-input">
              <input
                type="text"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
                placeholder="Nhập mã voucher"
                disabled={appliedVoucher || isLoading}
              />
              <button
                className="btn btn-secondary"
                onClick={handleApplyVoucher}
                disabled={appliedVoucher || isLoading || orderItems.length === 0}
              >
                {appliedVoucher ? 'Đã áp dụng' : 'Áp dụng'}
              </button>
            </div>
          </div>

          {/* Tổng tiền */}
          <div className="order-summary">
            <div className="summary-row">
              <span>Tổng tiền hàng:</span>
              <span className="price">{formatCurrency(currentOrder.tongTien)}</span>
            </div>
            {currentOrder.giamGia > 0 && (
              <div className="summary-row discount">
                <span>Giảm giá:</span>
                <span className="price">-{formatCurrency(currentOrder.giamGia)}</span>
              </div>
            )}
            <div className="summary-row total">
              <span>Tổng thanh toán:</span>
              <span className="price">{formatCurrency(currentOrder.thanhTien)}</span>
            </div>
          </div>

          {/* Nút thao tác */}
          <div className="order-actions">
            <button
              className="btn btn-danger"
              onClick={handleCancelOrder}
              disabled={isLoading}
            >
              Hủy Đơn
            </button>
            <button
              className="btn btn-success btn-lg"
              onClick={handleFinalizeOrder}
              disabled={isLoading || orderItems.length === 0}
            >
              Thanh Toán Tiền Mặt
            </button>
          </div>
        </>
      )}

      {/* Modal chọn sản phẩm */}
      {showProductModal && (
        <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chọn Sản Phẩm</h3>
              <button className="close-btn" onClick={() => setShowProductModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              {/* Tìm kiếm sản phẩm */}
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Danh sách sản phẩm */}
              <div className="product-list">
                <h4>Chọn sản phẩm:</h4>
                <div className="products-counter-grid">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.maSanPham}
                      className={`product-card ${selectedProduct === product.maSanPham ? 'selected' : ''}`}
                      onClick={() => setSelectedProduct(product.maSanPham)}
                    >
                      <h5>{product.tenSanPham}</h5>
                      <p>{product.thuongHieu}</p>
                      <p className="price">{formatCurrency(product.giaCoBan)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chi tiết sản phẩm (màu sắc, size) */}
              {selectedProduct && productDetails.length > 0 && (
                <div className="product-details">
                  <h4>Chọn màu sắc và size:</h4>
                  <div className="details-grid">
                    {productDetails.map((detail) => (
                      <div
                        key={detail.maChiTiet}
                        className={`detail-card ${selectedDetail?.maChiTiet === detail.maChiTiet ? 'selected' : ''} ${detail.soLuongTon === 0 ? 'out-of-stock' : ''}`}
                        onClick={() => detail.soLuongTon > 0 && setSelectedDetail(detail)}
                      >
                        <div className="detail-info">
                          <span className="color">{detail.mauSac}</span>
                          <span className="size">Size: {detail.size}</span>
                        </div>
                        <div className="detail-price">
                          <span className="price">{formatCurrency(detail.giaBan)}</span>
                          <span className="stock">Kho: {detail.soLuongTon}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Số lượng */}
              {selectedDetail && (
                <div 
                  className="quantity-section"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <label>Số lượng:</label>
                  <div className="quantity-input">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setSelectedQuantity(Math.max(1, selectedQuantity - 1))
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      disabled={selectedQuantity <= 1}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={selectedQuantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1
                        setSelectedQuantity(Math.min(Math.max(1, val), selectedDetail.soLuongTon))
                      }}
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      onFocus={(e) => e.target.select()}
                      min="1"
                      max={selectedDetail.soLuongTon}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setSelectedQuantity(Math.min(selectedQuantity + 1, selectedDetail.soLuongTon))
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      disabled={selectedQuantity >= selectedDetail.soLuongTon}
                    >
                      +
                    </button>
                  </div>
                  <span className="max-quantity">Tối đa: {selectedDetail.soLuongTon}</span>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowProductModal(false)}
              >
                Hủy
              </button>
              <button
                className="btn btn-primary"
                onClick={handleAddItem}
                disabled={!selectedDetail || isLoading}
              >
                Thêm vào đơn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CounterOrderTab