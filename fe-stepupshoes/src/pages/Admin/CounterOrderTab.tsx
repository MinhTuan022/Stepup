import { useState, useEffect } from 'react'
import './CounterOrderTab.css'
import { adminService } from '../../services/api'
import { useToast } from '../../context/ToastContext'

interface Product {
  maChiTiet: number
  tenSanPham: string
  donGia: number
  soLuongTon: number
  kichCo?: string
  mauSac?: string
}

interface OrderItem {
  maChiTiet: number
  tenSanPham: string
  donGia: number
  soLuong: number
  thanhTien: number
}

interface CounterOrder {
  maDonHang: number
  maNguoiDung: number
  nguoiNhan: string
  soDienThoaiNhan: string
  diaChiGiaoHang: string
  loaiDonHang: string
  trangThaiDonHang: string
  trangThaiThanhToan: string
  tongTien: number
  thanhTien: number
  giamGia: number
  chiTietDonHangs: OrderItem[]
}

interface User {
  maNguoiDung: number
  tenDangNhap: string
  ten: string
  email: string
  soDienThoai: string
}

type PaymentMethod = 'tien_mat' | 'chuyen_khoan' | 'the_tin_dung' | 'vi_dien_tu'
type CustomerType = 'registered' | 'guest'

interface SelectedItem {
  maChiTiet: number
  tenSanPham: string
  donGia: number
  soLuong: number
  kichCo?: string
  mauSac?: string
}

const CounterOrderTab = () => {
  const [step, setStep] = useState<'create' | 'manage' | 'finalize'>('create')
  const [currentOrder, setCurrentOrder] = useState<CounterOrder | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()

  // Form states for creating order
  const [customerType, setCustomerType] = useState<CustomerType>('registered')
  const [formData, setFormData] = useState({
    maNguoiDung: 0,
    nguoiNhan: '',
    soDienThoaiNhan: '',
    diaChiGiaoHang: 'Tại quầy',
  })

  // Form states for adding items during creation
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([])
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null)
  const [quantity, setQuantity] = useState(1)

  // Form states for voucher
  const [voucherCode, setVoucherCode] = useState('')

  // Form states for finalization
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('tien_mat')

  useEffect(() => {
    fetchProducts()
    fetchUsers()
  }, [])

  const fetchProducts = async () => {
    try {
      const data = await adminService.getProducts()
      setProducts(data.content || data)
    } catch (error: any) {
      showToast(error.message || 'Failed to fetch products', 'error')
    }
  }

  const fetchUsers = async () => {
    try {
      const data = await adminService.getAllUsers(0, 100)
      // Lọc chỉ lấy các người dùng không bị khóa
      const activeUsers = (data.content || []).filter((u: any) => !u.trangThaiKhoa)
      setUsers(activeUsers)
    } catch (error: any) {
      showToast(error.message || 'Failed to fetch users', 'error')
    }
  }

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nguoiNhan.trim()) {
      showToast('Vui lòng nhập tên người nhận', 'error')
      return
    }

    if (!formData.soDienThoaiNhan.trim()) {
      showToast('Vui lòng nhập số điện thoại', 'error')
      return
    }

    // Kiểm tra nếu là khách hàng đã đăng ký
    if (customerType === 'registered' && formData.maNguoiDung === 0) {
      showToast('Vui lòng chọn khách hàng', 'error')
      return
    }

    if (selectedItems.length === 0) {
      showToast('Vui lòng thêm ít nhất 1 sản phẩm', 'error')
      return
    }

    setLoading(true)
    try {
      const orderData: any = {
        nguoiNhan: formData.nguoiNhan.trim(),
        soDienThoaiNhan: formData.soDienThoaiNhan.trim(),
        diaChiGiaoHang: formData.diaChiGiaoHang || 'Tại quầy',
      }

      // Nếu là khách vãng lai, gửi maNguoiDung = 0
      if (customerType === 'registered') {
        orderData.maNguoiDung = formData.maNguoiDung
      } else {
        orderData.maNguoiDung = 0
      }

      // Tạo đơn hàng
      const order = await adminService.createCounterOrder(orderData)
      
      // Thêm tất cả sản phẩm đã chọn vào đơn hàng
      let updatedOrder = order
      for (const item of selectedItems) {
        updatedOrder = await adminService.addItemToOrder(order.maDonHang, {
          maChiTiet: item.maChiTiet,
          soLuong: item.soLuong,
        })
      }

      setCurrentOrder(updatedOrder)
      setStep('manage')
      showToast('Tạo đơn hàng thành công', 'success')

      // Reset form
      setCustomerType('registered')
      setFormData({
        maNguoiDung: 0,
        nguoiNhan: '',
        soDienThoaiNhan: '',
        diaChiGiaoHang: 'Tại quầy',
      })
      setSelectedItems([])
      setSelectedProduct(null)
      setQuantity(1)
      setVoucherCode('')
    } catch (error: any) {
      showToast(error.message || 'Failed to create order', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleAddItemToSelection = () => {
    if (!selectedProduct) {
      showToast('Vui lòng chọn sản phẩm', 'error')
      return
    }

    if (quantity < 1) {
      showToast('Số lượng phải lớn hơn 0', 'error')
      return
    }

    // Tìm sản phẩm
    const product = products.find(p => p.maChiTiet === selectedProduct)
    if (!product) {
      showToast('Sản phẩm không tồn tại', 'error')
      return
    }

    // Kiểm tra xem sản phẩm đã được chọn chưa
    const existingItem = selectedItems.find(item => item.maChiTiet === selectedProduct)
    if (existingItem) {
      showToast('Sản phẩm này đã có trong danh sách', 'error')
      return
    }

    // Thêm sản phẩm vào danh sách
    const newItem: SelectedItem = {
      maChiTiet: product.maChiTiet,
      tenSanPham: product.tenSanPham,
      donGia: product.donGia,
      soLuong: quantity,
      kichCo: product.kichCo,
      mauSac: product.mauSac,
    }

    setSelectedItems([...selectedItems, newItem])
    setSelectedProduct(null)
    setQuantity(1)
    showToast('Thêm sản phẩm vào danh sách thành công', 'success')
  }

  const handleRemoveItemFromSelection = (maChiTiet: number) => {
    setSelectedItems(selectedItems.filter(item => item.maChiTiet !== maChiTiet))
    showToast('Xóa sản phẩm khỏi danh sách thành công', 'success')
  }

  const handleAddItem = async () => {
    if (!selectedProduct) {
      showToast('Vui lòng chọn sản phẩm', 'error')
      return
    }

    if (quantity < 1) {
      showToast('Số lượng phải lớn hơn 0', 'error')
      return
    }

    if (!currentOrder) return

    setLoading(true)
    try {
      const updated = await adminService.addItemToOrder(currentOrder.maDonHang, {
        maChiTiet: selectedProduct,
        soLuong: quantity,
      })

      setCurrentOrder(updated)
      setSelectedProduct(null)
      setQuantity(1)
      showToast('Thêm sản phẩm thành công', 'success')
    } catch (error: any) {
      showToast(error.message || 'Failed to add item', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveItem = async (maChiTiet: number) => {
    if (!currentOrder) return

    setLoading(true)
    try {
      const updated = await adminService.removeItemFromOrder(
        currentOrder.maDonHang,
        maChiTiet
      )
      setCurrentOrder(updated)
      showToast('Xóa sản phẩm thành công', 'success')
    } catch (error: any) {
      showToast(error.message || 'Failed to remove item', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      showToast('Vui lòng nhập mã voucher', 'error')
      return
    }

    if (!currentOrder) return

    setLoading(true)
    try {
      const updated = await adminService.applyVoucherToOrder(
        currentOrder.maDonHang,
        voucherCode.trim()
      )
      setCurrentOrder(updated)
      setVoucherCode('')
      showToast('Áp dụng voucher thành công', 'success')
    } catch (error: any) {
      showToast(error.message || 'Failed to apply voucher', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleFinalizeOrder = async () => {
    if (!currentOrder) return

    if (currentOrder.chiTietDonHangs.length === 0) {
      showToast('Đơn hàng phải có ít nhất 1 sản phẩm', 'error')
      return
    }

    setLoading(true)
    try {
      const updated = await adminService.finalizeCounterOrder(
        currentOrder.maDonHang,
        paymentMethod
      )
      setCurrentOrder(updated)
      setStep('finalize')
      showToast('Hoàn thành đơn hàng thành công', 'success')
    } catch (error: any) {
      showToast(error.message || 'Failed to finalize order', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleNewOrder = () => {
    setStep('create')
    setCurrentOrder(null)
    setSelectedProduct(null)
    setQuantity(1)
    setVoucherCode('')
    setPaymentMethod('tien_mat')
    setCustomerType('registered')
    setFormData({
      maNguoiDung: 0,
      nguoiNhan: '',
      soDienThoaiNhan: '',
      diaChiGiaoHang: 'Tại quầy',
    })
  }

  const getProductName = (maChiTiet: number) => {
    const product = products.find(p => p.maChiTiet === maChiTiet)
    if (!product) return `Sản phẩm #${maChiTiet}`

    let name = product.tenSanPham
    if (product.kichCo) name += ` - ${product.kichCo}`
    if (product.mauSac) name += ` (${product.mauSac})`

    return name
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value)
  }

  return (
    <div className="counter-order-container">
      <h2 className="counter-order-title">Tạo Đơn Hàng Tại Quầy (POS)</h2>

      {step === 'create' && (
        <div className="counter-order-section">
          <div className="create-order-layout">
            {/* Left Column: Customer Info & Products */}
            <div className="create-order-left">
              <h3>Thông tin khách hàng</h3>

              {/* Customer Type Selection */}
              <div className="customer-type-selector">
                <label className="type-option">
                  <input
                    type="radio"
                    name="customerType"
                    value="registered"
                    checked={customerType === 'registered'}
                    onChange={e => setCustomerType(e.target.value as CustomerType)}
                  />
                  <span> Khách hàng đã đăng ký</span>
                </label>
                <label className="type-option">
                  <input
                    type="radio"
                    name="customerType"
                    value="guest"
                    checked={customerType === 'guest'}
                    onChange={e => setCustomerType(e.target.value as CustomerType)}
                  />
                  <span>🚶 Khách vãng lai (không tài khoản)</span>
                </label>
              </div>

              <form className="counter-form">
                {customerType === 'registered' && (
                  <div className="form-group">
                    <label htmlFor="customer">Chọn khách hàng *</label>
                    <select
                      id="customer"
                      value={formData.maNguoiDung}
                      onChange={e => {
                        const userId = Number(e.target.value)
                        const user = users.find(u => u.maNguoiDung === userId)
                        if (user) {
                          setFormData({
                            ...formData,
                            maNguoiDung: userId,
                            nguoiNhan: user.ten || user.tenDangNhap,
                            soDienThoaiNhan: user.soDienThoai || '',
                          })
                        }
                      }}
                      required
                    >
                      <option value={0}>-- Chọn khách hàng --</option>
                      {users.map(user => (
                        <option key={user.maNguoiDung} value={user.maNguoiDung}>
                          {user.ten || user.tenDangNhap} ({user.soDienThoai || 'Chưa cập nhật'})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="nguoiNhan">Tên người nhận *</label>
                  <input
                    type="text"
                    id="nguoiNhan"
                    value={formData.nguoiNhan}
                    onChange={e => setFormData({ ...formData, nguoiNhan: e.target.value })}
                    placeholder="Nhập tên người nhận"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="soDienThoaiNhan">Số điện thoại *</label>
                  <input
                    type="tel"
                    id="soDienThoaiNhan"
                    value={formData.soDienThoaiNhan}
                    onChange={e =>
                      setFormData({ ...formData, soDienThoaiNhan: e.target.value })
                    }
                    placeholder="Nhập số điện thoại"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="diaChiGiaoHang">Địa chỉ giao hàng</label>
                  <input
                    type="text"
                    id="diaChiGiaoHang"
                    value={formData.diaChiGiaoHang}
                    onChange={e =>
                      setFormData({ ...formData, diaChiGiaoHang: e.target.value })
                    }
                    placeholder="Tại quầy"
                  />
                </div>

                {customerType === 'guest' && (
                  <div className="guest-info-note">
                    <p><strong>Khách vãng lai:</strong> Không cần tài khoản, chỉ cần nhập tên và số điện thoại</p>
                  </div>
                )}
              </form>

              <h3 style={{ marginTop: '24px' }}>Chọn sản phẩm</h3>
              <div className="product-selection-form">
                <div className="form-group">
                  <label htmlFor="product-select">Sản phẩm *</label>
                  <select
                    id="product-select"
                    value={selectedProduct || ''}
                    onChange={e => setSelectedProduct(Number(e.target.value) || null)}
                  >
                    <option value="">-- Chọn sản phẩm --</option>
                    {products.map(product => (
                      <option key={product.maChiTiet} value={product.maChiTiet}>
                        {product.tenSanPham}
                        {product.kichCo ? ` (Size: ${product.kichCo})` : ''}
                        {product.mauSac ? ` - ${product.mauSac}` : ''}
                        {product.soLuongTon > 0 ? ` [Tồn: ${product.soLuongTon}]` : ' [Hết]'}
                        - {formatCurrency(product.donGia)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="quantity-input">Số lượng *</label>
                  <div className="quantity-input-group">
                    <input
                      id="quantity-input"
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
                    />
                    <button
                      type="button"
                      onClick={handleAddItemToSelection}
                      disabled={!selectedProduct || quantity < 1}
                      className="btn btn-secondary"
                    >
                      Thêm
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="create-order-right">
              <h3>Giỏ hàng</h3>

              {selectedItems.length > 0 ? (
                <>
                  <div className="items-summary-list">
                    {selectedItems.map((item, index) => (
                      <div key={index} className="summary-item">
                        <div className="item-details">
                          <p className="item-name">{item.tenSanPham}</p>
                          {item.kichCo && <p className="item-spec">Size: {item.kichCo}</p>}
                          {item.mauSac && <p className="item-spec">Màu: {item.mauSac}</p>}
                          <p className="item-price">{formatCurrency(item.donGia)}</p>
                        </div>
                        <div className="item-quantity">
                          <span className="qty-label">x{item.soLuong}</span>
                        </div>
                        <div className="item-total">
                          <span className="total-price">
                            {formatCurrency(item.donGia * item.soLuong)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItemFromSelection(item.maChiTiet)}
                            className="btn btn-danger btn-small"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="summary-totals">
                    <div className="total-row">
                      <span>Tổng cộng:</span>
                      <span className="amount">
                        {formatCurrency(
                          selectedItems.reduce((sum, item) => sum + item.donGia * item.soLuong, 0)
                        )}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCreateOrder}
                    disabled={loading || selectedItems.length === 0}
                    className="btn btn-success btn-large"
                  >
                    {loading ? 'Đang xử lý...' : 'Tạo đơn hàng'}
                  </button>
                </>
              ) : (
                <div className="empty-cart">
                  <p>Chưa có sản phẩm</p>
                  <p className="hint">Chọn sản phẩm từ bên trái để thêm vào giỏ</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {step === 'manage' && currentOrder && (
        <div className="counter-order-section">
          <div className="order-header">
            <div className="order-info">
              <h3>Đơn hàng #{currentOrder.maDonHang}</h3>
              <p>
                <strong>Khách:</strong> {currentOrder.nguoiNhan}
              </p>
              <p>
                <strong>SĐT:</strong> {currentOrder.soDienThoaiNhan}
              </p>
            </div>
          </div>

          <div className="add-items-section">
            <h3>Thêm sản phẩm</h3>
            <div className="add-item-form">
              <div className="form-group">
                <label htmlFor="product">Chọn sản phẩm</label>
                <select
                  id="product"
                  value={selectedProduct || ''}
                  onChange={e => setSelectedProduct(Number(e.target.value) || null)}
                >
                  <option value="">-- Chọn sản phẩm --</option>
                  {products.map(product => (
                    <option key={product.maChiTiet} value={product.maChiTiet}>
                      {product.tenSanPham}
                      {product.kichCo ? ` (Size: ${product.kichCo})` : ''}
                      {product.mauSac ? ` - ${product.mauSac}` : ''}
                      {product.soLuongTon > 0 ? ` [Tồn: ${product.soLuongTon}]` : ' [Hết]'}
                      - {formatCurrency(product.donGia)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="quantity">Số lượng</label>
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  value={quantity}
                  onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
                />
              </div>

              <button
                onClick={handleAddItem}
                disabled={loading || !selectedProduct}
                className="btn btn-secondary"
              >
                {loading ? 'Đang xử lý...' : 'Thêm vào đơn'}
              </button>
            </div>
          </div>

          {currentOrder.chiTietDonHangs.length > 0 && (
            <div className="items-list-section">
              <h3>Sản phẩm trong đơn</h3>
              <table className="items-table">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Đơn giá</th>
                    <th>Số lượng</th>
                    <th>Thành tiền</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrder.chiTietDonHangs.map(item => (
                    <tr key={item.maChiTiet}>
                      <td>{getProductName(item.maChiTiet)}</td>
                      <td>{formatCurrency(item.donGia)}</td>
                      <td className="quantity-cell">{item.soLuong}</td>
                      <td>{formatCurrency(item.thanhTien)}</td>
                      <td>
                        <button
                          onClick={() => handleRemoveItem(item.maChiTiet)}
                          disabled={loading}
                          className="btn btn-danger btn-small"
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

          <div className="voucher-section">
            <h3>Áp dụng voucher</h3>
            <div className="voucher-form">
              <input
                type="text"
                value={voucherCode}
                onChange={e => setVoucherCode(e.target.value)}
                placeholder="Nhập mã voucher"
              />
              <button
                onClick={handleApplyVoucher}
                disabled={loading || !voucherCode.trim()}
                className="btn btn-secondary"
              >
                {loading ? 'Đang xử lý...' : 'Áp dụng'}
              </button>
            </div>
          </div>

          <div className="order-summary">
            <div className="summary-row">
              <span>Tổng tiền:</span>
              <span className="amount">{formatCurrency(currentOrder.tongTien)}</span>
            </div>
            {currentOrder.giamGia > 0 && (
              <div className="summary-row discount">
                <span>Giảm giá:</span>
                <span className="amount">-{formatCurrency(currentOrder.giamGia)}</span>
              </div>
            )}
            <div className="summary-row total">
              <span>Thành tiền:</span>
              <span className="amount">{formatCurrency(currentOrder.thanhTien)}</span>
            </div>
          </div>

          <div className="action-buttons">
            <button
              onClick={() => setStep('finalize')}
              disabled={loading || currentOrder.chiTietDonHangs.length === 0}
              className="btn btn-success"
            >
              Tiếp tục thanh toán
            </button>
            <button
              onClick={handleNewOrder}
              className="btn btn-outline"
            >
              Hủy & tạo đơn mới
            </button>
          </div>
        </div>
      )}

      {step === 'finalize' && currentOrder && (
        <div className="counter-order-section">
          <div className="finalize-container">
            <h3>Hoàn thành đơn hàng</h3>

            <div className="order-summary-large">
              <div className="order-details">
                <h4>Thông tin đơn hàng</h4>
                <p>
                  <strong>Mã đơn:</strong> {currentOrder.maDonHang}
                </p>
                <p>
                  <strong>Khách:</strong> {currentOrder.nguoiNhan}
                </p>
                <p>
                  <strong>SĐT:</strong> {currentOrder.soDienThoaiNhan}
                </p>
                <p>
                  <strong>Địa chỉ:</strong> {currentOrder.diaChiGiaoHang}
                </p>
              </div>

              <div className="total-section">
                <div className="total-item">
                  <span>Tổng tiền:</span>
                  <span className="price">{formatCurrency(currentOrder.tongTien)}</span>
                </div>
                {currentOrder.giamGia > 0 && (
                  <div className="total-item discount">
                    <span>Giảm giá:</span>
                    <span className="price">-{formatCurrency(currentOrder.giamGia)}</span>
                  </div>
                )}
                <div className="total-item final">
                  <span>Thành tiền:</span>
                  <span className="price">{formatCurrency(currentOrder.thanhTien)}</span>
                </div>
              </div>
            </div>

            <div className="payment-method-section">
              <h4>Chọn phương thức thanh toán</h4>
              <div className="payment-options">
                <label className="payment-option">
                  <input
                    type="radio"
                    name="payment"
                    value="tien_mat"
                    checked={paymentMethod === 'tien_mat'}
                    onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                  />
                  <span>Tiền mặt</span>
                </label>
                <label className="payment-option">
                  <input
                    type="radio"
                    name="payment"
                    value="chuyen_khoan"
                    checked={paymentMethod === 'chuyen_khoan'}
                    onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                  />
                  <span>Chuyển khoản</span>
                </label>
                <label className="payment-option">
                  <input
                    type="radio"
                    name="payment"
                    value="the_tin_dung"
                    checked={paymentMethod === 'the_tin_dung'}
                    onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                  />
                  <span>Thẻ tín dụng</span>
                </label>
                <label className="payment-option">
                  <input
                    type="radio"
                    name="payment"
                    value="vi_dien_tu"
                    checked={paymentMethod === 'vi_dien_tu'}
                    onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                  />
                  <span>📱 Ví điện tử</span>
                </label>
              </div>
            </div>

            {currentOrder.trangThaiDonHang === 'hoan_thanh' && (
              <div className="success-message">
                <p>Đơn hàng đã được hoàn thành thành công!</p>
              </div>
            )}

            <div className="finalize-buttons">
              {currentOrder.trangThaiDonHang !== 'hoan_thanh' && (
                <button
                  onClick={handleFinalizeOrder}
                  disabled={loading}
                  className="btn btn-success btn-large"
                >
                  {loading ? 'Đang xử lý...' : 'Hoàn thành thanh toán'}
                </button>
              )}
              <button
                onClick={handleNewOrder}
                className="btn btn-primary btn-large"
              >
                {currentOrder.trangThaiDonHang === 'hoan_thanh'
                  ? 'Tạo đơn mới'
                  : 'Quay lại'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CounterOrderTab
