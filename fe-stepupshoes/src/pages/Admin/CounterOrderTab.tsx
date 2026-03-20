

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { adminService, authService } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import './CounterOrderTab.css'
import { BASE_IMAGE_URL } from '../../constants'

interface Product {
  maSanPham: number
  tenSanPham: string
  thuongHieu: string
  giaCoBan: number
  hinhAnhChinh?: string
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
  trangThaiDonHang?: string
  trangThaiThanhToan?: string
  nguoiNhan?: string
  soDienThoaiNhan?: string
  maNguoiDungKH?: number
}

function getInitials(name: string): string {
  if (!name) return '??'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const CounterOrderTab: React.FC = () => {
  const { showToast } = useToast()

  // State khách hàng
  const [customerType, setCustomerType] = useState<'registered' | 'guest'>('guest')
  const [maNguoiDung, setMaNguoiDung] = useState<number>(0)
  const [nguoiNhan, setNguoiNhan] = useState('')
  const [soDienThoaiNhan, setSoDienThoaiNhan] = useState('')
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false)

  // State đơn hàng
  const [currentOrder, setCurrentOrder] = useState<CounterOrder | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [pendingOrders, setPendingOrders] = useState<CounterOrder[]>([])

  // State sản phẩm
  const [products, setProducts] = useState<Product[]>([])
  const [productDetails, setProductDetails] = useState<ProductDetail[]>([])
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null)
  const [selectedDetail, setSelectedDetail] = useState<ProductDetail | null>(null)
  const [selectedQuantity, setSelectedQuantity] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')

  // State voucher
  const [voucherCode, setVoucherCode] = useState('')
  const [appliedVoucher, setAppliedVoucher] = useState(false)

  // State UI
  const [isLoading, setIsLoading] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)

  const lockIntervalRef = useRef<number | null>(null)
  const cashierId = authService.getUser()?.maNguoiDung || 0

  const COUNTER_ORDER_STORAGE_KEY = 'counterOrderId'
  const cancelableCounterStates = useMemo(() => ['cho_xac_nhan', 'chuan_bi_hang'], [])

  // ─── Formatters ────────────────────────────────────────────────
  const currencyFormatter = useMemo(
    () => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }),
    []
  )
  const formatCurrency = useCallback(
    (amount: number) => currencyFormatter.format(amount),
    [currencyFormatter]
  )

  // ─── Khởi tạo ──────────────────────────────────────────────────
  useEffect(() => {
    loadProducts()
    fetchPendingCounterOrders()
  }, [])

  // Auto-refresh đơn chờ khi không có đơn đang xử lý
  useEffect(() => {
    const id = window.setInterval(() => {
      if (!currentOrder) fetchPendingCounterOrders()
    }, 15000)
    return () => clearInterval(id)
  }, [currentOrder])

  useEffect(() => {
    if (selectedProduct) loadProductDetails(selectedProduct)
  }, [selectedProduct])

  // ─── Resume đơn đã lưu khi mount ───────────────────────────────
  useEffect(() => {
    const resume = async () => {
      const saved = localStorage.getItem(COUNTER_ORDER_STORAGE_KEY)
      if (!saved) return
      const id = parseInt(saved)
      if (!id) return
      try {
        const order = await adminService.getOrderById(id)
        if (order && cancelableCounterStates.includes(order.trangThaiDonHang || '')) {
          setCurrentOrder(order)
          setOrderItems(mapOrderToItems(order))
          if (order.nguoiNhan) setNguoiNhan(order.nguoiNhan)
          if (order.soDienThoaiNhan) setSoDienThoaiNhan(order.soDienThoaiNhan)
          if (order.maNguoiDungKH) { setMaNguoiDung(order.maNguoiDungKH); setCustomerType('registered') }
          try {
            if (cashierId) {
              await adminService.lockCounterOrder(id, cashierId)
              startHeartbeat(id)
            }
          } catch {
            showToast('Đơn hiện đang được xử lý bởi ca khác', 'error')
            localStorage.removeItem(COUNTER_ORDER_STORAGE_KEY)
          }
        } else {
          localStorage.removeItem(COUNTER_ORDER_STORAGE_KEY)
        }
      } catch {
        localStorage.removeItem(COUNTER_ORDER_STORAGE_KEY)
      }
    }
    resume()
  }, [])

  const tryCancelOnUnload = useCallback(() => {
    if (!currentOrder) return
    if (!cancelableCounterStates.includes(currentOrder.trangThaiDonHang || '')) return
    try {
      const base = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
      fetch(`${base}/v1/admin/orders/${currentOrder.maDonHang}/status?status=huy`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        keepalive: true,
      }).catch(() => {})
      if (cashierId) {
        navigator.sendBeacon(
          `${base}/v1/admin/orders/${currentOrder.maDonHang}/lock/release`,
          JSON.stringify({ cashierId })
        )
      }
    } catch {  }
  }, [currentOrder, cashierId, cancelableCounterStates])

  useEffect(() => {
    window.addEventListener('beforeunload', tryCancelOnUnload)
    return () => {
      window.removeEventListener('beforeunload', tryCancelOnUnload)
      stopHeartbeat()
    }
  }, [tryCancelOnUnload])

  const mapOrderToItems = useCallback((order: any): OrderItem[] => {
    if (!order?.chiTietDonHangs) return []
    return order.chiTietDonHangs.map((item: any) => ({
      maChiTiet: item.maChiTiet,
      tenSanPham: item.tenSanPham,
      mauSac: item.mauSac,
      size: item.size,
      soLuong: item.soLuong,
      donGia: item.donGia,
      thanhTien: item.thanhTien,
      soLuongTon: item.soLuongTon || 0,
    }))
  }, [])

  const startHeartbeat = (orderId: number) => {
    stopHeartbeat()
    adminService.touchCounterOrderLock(orderId).catch(() => {})
    const id = window.setInterval(() => {
      adminService.touchCounterOrderLock(orderId).catch(() => {})
    }, 25000)
    lockIntervalRef.current = id as unknown as number
  }

  const stopHeartbeat = () => {
    if (lockIntervalRef.current) {
      clearInterval(lockIntervalRef.current)
      lockIntervalRef.current = null
    }
  }

  const resetForm = () => {
    setCurrentOrder(null)
    setOrderItems([])
    setNguoiNhan('')
    setSoDienThoaiNhan('')
    setMaNguoiDung(0)
    setVoucherCode('')
    setAppliedVoucher(false)
    setCustomerType('guest')
  }

  const fetchPendingCounterOrders = async () => {
    try {
      const data = await adminService.getAllOrders(0, 50, 'cho_xac_nhan')
      const list = (data.orders || []).filter((o: any) => o.loaiDonHang === 'tai_quay')
      setPendingOrders(list)
    } catch (err: any) {
      console.warn('Không thể tải danh sách đơn chờ:', err)
    }
  }

  const fetchPendingCounterOrdersCb = useCallback(fetchPendingCounterOrders, [])

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

  const searchCustomerByPhone = async (phone: string) => {
    if (!phone.trim() || phone.length < 10) return
    setIsSearchingCustomer(true)
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/v1/admin/users/search-by-phone?phone=${phone}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
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
    } catch {
      setMaNguoiDung(0)
    } finally {
      setIsSearchingCustomer(false)
    }
  }

  // ─── Handlers ───────────────────────────────────────────────────
  const handlePhoneChange = (phone: string) => {
    setSoDienThoaiNhan(phone)
    if (customerType === 'registered' && phone.length === 10) {
      searchCustomerByPhone(phone)
    } else if (customerType === 'guest') {
      setMaNguoiDung(0)
    }
  }

  const handleCreateOrder = useCallback(async () => {
    if (!nguoiNhan.trim() && !soDienThoaiNhan.trim()) {
      showToast('Tạo đơn cho Khách lẻ (không yêu cầu thông tin)', 'info')
    }

    setIsLoading(true)
    try {
      const defaultName = 'Khách lẻ'
      const defaultPhone = '0000000000'
      const payloadName = customerType === 'registered' ? (nguoiNhan?.trim() || '') : (nguoiNhan?.trim() || defaultName)
      const payloadPhone = customerType === 'registered' ? (soDienThoaiNhan?.trim() || '') : (soDienThoaiNhan?.trim() || defaultPhone)

      const newOrder = await adminService.createCounterOrder({
        maNguoiDung: customerType === 'registered' ? maNguoiDung : 0,
        nguoiNhan: payloadName,
        soDienThoaiNhan: payloadPhone,
        diaChiGiaoHang: 'Tại quầy',
      })
      setCurrentOrder(newOrder)
      setOrderItems([])
      setAppliedVoucher(false)
      if (!nguoiNhan?.trim()) setNguoiNhan(customerType === 'registered' ? '' : defaultName)
      if (!soDienThoaiNhan?.trim()) setSoDienThoaiNhan(customerType === 'registered' ? '' : defaultPhone)
      localStorage.setItem(COUNTER_ORDER_STORAGE_KEY, String(newOrder.maDonHang))
      if (newOrder.maDonHang && cashierId) {
        await adminService.lockCounterOrder(newOrder.maDonHang, cashierId).catch(() => {})
        startHeartbeat(newOrder.maDonHang)
      }
      showToast('Tạo đơn hàng thành công', 'success')
      fetchPendingCounterOrdersCb()
    } catch (error: any) {
      showToast(error.message || 'Lỗi khi tạo đơn hàng', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [nguoiNhan, soDienThoaiNhan, customerType, maNguoiDung, cashierId, fetchPendingCounterOrdersCb, showToast])

  const handleResumeOrder = useCallback(async (orderId: number) => {
    try {
      if (cashierId) await adminService.lockCounterOrder(orderId, cashierId)
      const order = await adminService.getOrderById(orderId)
      setCurrentOrder(order)
      setOrderItems(mapOrderToItems(order))
      // Điền lại thông tin khách từ đơn
      if (order.nguoiNhan) setNguoiNhan(order.nguoiNhan)
      if (order.soDienThoaiNhan) setSoDienThoaiNhan(order.soDienThoaiNhan)
      if (order.maNguoiDungKH) { setMaNguoiDung(order.maNguoiDungKH); setCustomerType('registered') }
      localStorage.setItem(COUNTER_ORDER_STORAGE_KEY, String(orderId))
      startHeartbeat(orderId)
      fetchPendingCounterOrdersCb()
    } catch (err: any) {
      showToast(err?.message || 'Không thể mở đơn chờ', 'error')
    }
  }, [cashierId, mapOrderToItems, fetchPendingCounterOrdersCb, showToast])

  const handleStartNewOrder = useCallback(async () => {
    if (!currentOrder) return
    if (!window.confirm('Lưu đơn hiện tại vào danh sách chờ và tạo đơn mới?')) return

    setIsLoading(true)
    try {
      if (cashierId) await adminService.releaseCounterOrderLock(currentOrder.maDonHang, cashierId).catch(() => {})
      localStorage.removeItem(COUNTER_ORDER_STORAGE_KEY)
      stopHeartbeat()
      resetForm()
      showToast('Sẵn sàng tạo đơn mới', 'success')
      fetchPendingCounterOrdersCb()
    } finally {
      setIsLoading(false)
    }
  }, [currentOrder, cashierId, fetchPendingCounterOrdersCb, showToast])

  const handleOpenProductModal = () => {
    if (!currentOrder) { showToast('Vui lòng tạo đơn hàng trước', 'error'); return }
    setShowProductModal(true)
    setSelectedProduct(null)
    setSelectedDetail(null)
    setSelectedQuantity(1)
    setSearchTerm('')
  }

  const handleAddItem = useCallback(async () => {
    if (!currentOrder || !selectedDetail) { showToast('Vui lòng chọn sản phẩm', 'error'); return }
    if (selectedQuantity <= 0) { showToast('Số lượng phải lớn hơn 0', 'error'); return }
    // check against available stock
    if (selectedQuantity > selectedDetail.soLuongTon) {
      showToast(`Chỉ còn ${selectedDetail.soLuongTon} sản phẩm trong kho`, 'error')
      return
    }

    setIsLoading(true)
    try {
      const existing = orderItems.find((it) => it.maChiTiet === selectedDetail.maChiTiet)
      if (existing) {
        const newQty = existing.soLuong + selectedQuantity
        if (newQty > selectedDetail.soLuongTon) {
          showToast(`Tổng số lượng vượt quá tồn kho (${selectedDetail.soLuongTon})`, 'error')
          return
        }
        await adminService.removeItemFromOrder(currentOrder.maDonHang, existing.maChiTiet)
        const updatedOrder = await adminService.addItemToOrder(currentOrder.maDonHang, {
          maChiTiet: selectedDetail.maChiTiet,
          soLuong: newQty,
        })
        setCurrentOrder(updatedOrder)
        setOrderItems(mapOrderToItems(updatedOrder))
        if (updatedOrder?.maDonHang) localStorage.setItem(COUNTER_ORDER_STORAGE_KEY, String(updatedOrder.maDonHang))
        setShowProductModal(false)
        showToast('Cập nhật số lượng sản phẩm thành công', 'success')
      } else {
        const updatedOrder = await adminService.addItemToOrder(currentOrder.maDonHang, {
          maChiTiet: selectedDetail.maChiTiet,
          soLuong: selectedQuantity,
        })
        setCurrentOrder(updatedOrder)
        setOrderItems(mapOrderToItems(updatedOrder))
        if (updatedOrder?.maDonHang) localStorage.setItem(COUNTER_ORDER_STORAGE_KEY, String(updatedOrder.maDonHang))
        setShowProductModal(false)
        showToast('Thêm sản phẩm thành công', 'success')
      }

      try {
        if (selectedProduct) {
          const details = await adminService.getProductDetailsByProductId(selectedProduct)
          setProductDetails(details || [])
          const refreshed = (details || []).find((d: any) => d.maChiTiet === selectedDetail?.maChiTiet) || null
          setSelectedDetail(refreshed)
        }
      } catch {
      }
    } catch (error: any) {
      showToast(error.message || 'Lỗi khi thêm sản phẩm', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [currentOrder, selectedDetail, selectedQuantity, mapOrderToItems, showToast])

  const handleRemoveItem = useCallback(async (maChiTiet: number) => {
    if (!currentOrder) return
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) return

    setIsLoading(true)
    try {
      const updatedOrder = await adminService.removeItemFromOrder(currentOrder.maDonHang, maChiTiet)
      setCurrentOrder(updatedOrder)
      setOrderItems(mapOrderToItems(updatedOrder))
      showToast('Xóa sản phẩm thành công', 'success')
    } catch (error: any) {
      showToast(error.message || 'Lỗi khi xóa sản phẩm', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [currentOrder, mapOrderToItems, showToast])

  const handleApplyVoucher = useCallback(async () => {
    if (!currentOrder) { showToast('Chưa có đơn hàng', 'error'); return }
    if (!voucherCode.trim()) { showToast('Vui lòng nhập mã voucher', 'error'); return }
    if (orderItems.length === 0) { showToast('Vui lòng thêm sản phẩm vào đơn hàng', 'error'); return }

    setIsLoading(true)
    try {
      const updatedOrder = await adminService.applyVoucherToOrder(currentOrder.maDonHang, voucherCode)
      setCurrentOrder(updatedOrder)
      if (updatedOrder?.maDonHang) localStorage.setItem(COUNTER_ORDER_STORAGE_KEY, String(updatedOrder.maDonHang))
      if (updatedOrder.chiTietDonHangs?.length > 0) setOrderItems(mapOrderToItems(updatedOrder))
      setAppliedVoucher(true)
      showToast('Áp dụng voucher thành công', 'success')
    } catch (error: any) {
      showToast(error.message || 'Lỗi khi áp dụng voucher', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [currentOrder, voucherCode, orderItems.length, mapOrderToItems, showToast])

  const handleFinalizeOrder = useCallback(async () => {
    if (!currentOrder) { showToast('Chưa có đơn hàng', 'error'); return }
    if (orderItems.length === 0) { showToast('Đơn hàng chưa có sản phẩm', 'error'); return }
    if (!window.confirm(`Xác nhận thanh toán ${formatCurrency(currentOrder.thanhTien)} bằng tiền mặt?`)) return

    setIsLoading(true)
    try {
      await adminService.finalizeCounterOrder(currentOrder.maDonHang, 'tien_mat')
      await adminService.updateOrderStatus(currentOrder.maDonHang, 'hoan_thanh').catch(() => {})
      await adminService.updateOrder(currentOrder.maDonHang, { trangThaiThanhToan: 'da_thanh_toan' }).catch(() => {})

      showToast('Hoàn thành và thanh toán đơn hàng thành công', 'success')
      localStorage.removeItem(COUNTER_ORDER_STORAGE_KEY)
      if (cashierId) await adminService.releaseCounterOrderLock(currentOrder.maDonHang, cashierId).catch(() => {})
      stopHeartbeat()
      resetForm()
      fetchPendingCounterOrdersCb()
    } catch (error: any) {
      showToast(error.message || 'Lỗi khi hoàn thành đơn hàng', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [currentOrder, orderItems.length, cashierId, formatCurrency, fetchPendingCounterOrdersCb, showToast])

  const handleCancelOrder = useCallback(async () => {
    if (!currentOrder) return
    if (!cancelableCounterStates.includes(currentOrder.trangThaiDonHang || '')) {
      showToast('Không thể hủy đơn hàng ở trạng thái hiện tại', 'error')
      return
    }
    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) return

    setIsLoading(true)
    try {
      await adminService.updateOrderStatus(currentOrder.maDonHang, 'huy')
      showToast('Đã hủy đơn hàng', 'info')
      localStorage.removeItem(COUNTER_ORDER_STORAGE_KEY)
      if (cashierId) await adminService.releaseCounterOrderLock(currentOrder.maDonHang, cashierId).catch(() => {})
      stopHeartbeat()
      resetForm()
      fetchPendingCounterOrdersCb()
    } catch (error: any) {
      showToast(error.message || 'Lỗi khi hủy đơn', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [currentOrder, cashierId, cancelableCounterStates, fetchPendingCounterOrdersCb, showToast])

  // ─── Derived ────────────────────────────────────────────────────
  const filteredProducts = useMemo(
    () => products.filter(
      (p) =>
        p.tenSanPham.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.thuongHieu.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [products, searchTerm]
  )

  const canCancel =
    !!currentOrder && cancelableCounterStates.includes(currentOrder.trangThaiDonHang || '')

  // ─── Render ─────────────────────────────────────────────────────
  return (
    <div className="cot-wrapper">
      {/* ── Header ── */}
      <div className="cot-page-header">
        <h2 className="cot-page-title">Bán hàng tại quầy</h2>
        {currentOrder && (
          <button
            className="cot-btn cot-btn-ghost"
            onClick={handleStartNewOrder}
            disabled={isLoading}
          >
            Lưu &amp; tạo đơn mới
          </button>
        )}
      </div>

      <div className="cot-layout">
        <div className="cot-main">
          {!currentOrder && (
            <div className="cot-card">
              <p className="cot-section-label">Thông tin khách hàng</p>

              <div className="cot-radio-group">
                <label className={`cot-radio-option ${customerType === 'guest' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="customerType"
                    value="guest"
                    checked={customerType === 'guest'}
                    onChange={() => setCustomerType('guest')}
                  />
                  Khách vãng lai
                </label>
                <label className={`cot-radio-option ${customerType === 'registered' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="customerType"
                    value="registered"
                    checked={customerType === 'registered'}
                    onChange={() => setCustomerType('registered')}
                  />
                  Khách đã đăng ký
                </label>
              </div>

              <div className="cot-form-row">
                <div className="cot-form-group">
                  <label>Số điện thoại *</label>
                  <div className="cot-input-wrap">
                    <input
                      type="tel"
                      value={soDienThoaiNhan}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="Nhập số điện thoại"
                    />
                    {isSearchingCustomer && <span className="cot-input-hint searching">Đang tìm...</span>}
                    {customerType === 'registered' && maNguoiDung > 0 && !isSearchingCustomer && (
                      <span className="cot-input-hint found">Đã tìm thấy</span>
                    )}
                  </div>
                </div>
                <div className="cot-form-group">
                  <label>Tên khách hàng *</label>
                  <input
                    type="text"
                    value={nguoiNhan}
                    onChange={(e) => setNguoiNhan(e.target.value)}
                    disabled={customerType === 'registered' && maNguoiDung > 0}
                    placeholder={
                      customerType === 'registered'
                        ? 'Tự động điền sau khi nhập SĐT'
                        : 'Nhập tên khách hàng'
                    }
                  />
                </div>
              </div>

              <button
                className="cot-btn cot-btn-primary cot-btn-full"
                onClick={handleCreateOrder}
                disabled={isLoading}
              >
                {isLoading ? 'Đang tạo...' : 'Tạo đơn hàng'}
              </button>
            </div>
          )}

          {/* ── Đơn đang xử lý ── */}
          {currentOrder && (
            <div className="cot-card">
              <div className="cot-order-header">
                <div className="cot-order-title">
                  <span className="cot-active-dot" />
                  <span>Đơn đang xử lý</span>
                  <span className="cot-order-id">#{currentOrder.maDonHang}</span>
                </div>
                <button
                  className="cot-btn cot-btn-outline-sm"
                  onClick={handleOpenProductModal}
                  disabled={isLoading}
                >
                  + Thêm sản phẩm
                </button>
              </div>

              {/* Thông tin khách (compact bar) */}
              <div className="cot-customer-bar">
                <div className="cot-avatar">{getInitials(nguoiNhan)}</div>
                <div className="cot-customer-info">
                  <span className="cot-customer-name">{nguoiNhan || 'Khách lẻ'}</span>
                  <span className="cot-customer-meta">
                    {soDienThoaiNhan || '—'}
                    {customerType === 'registered' && maNguoiDung > 0 && (
                      <> · <span className="cot-badge-registered">Đã đăng ký</span></>
                    )}
                  </span>
                </div>
              </div>

              {/* Bảng sản phẩm */}
              {orderItems.length === 0 ? (
                <div className="cot-empty-items">
                  <div className="cot-empty-icon">🛒</div>
                  <p>Chưa có sản phẩm — nhấn "Thêm sản phẩm" để bắt đầu</p>
                </div>
              ) : (
                <div className="cot-items-table-wrap">
                  <table className="cot-items-table">
                    <thead>
                      <tr>
                        <th>Sản phẩm</th>
                        <th>Đơn giá</th>
                        <th>Số lượng</th>
                        <th style={{ textAlign: 'right' }}>Thành tiền</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {orderItems.map((item) => (
                        <tr key={item.maChiTiet}>
                          <td>
                            <div className="cot-item-name">{item.tenSanPham}</div>
                            <div className="cot-item-variant">
                              {item.mauSac} · Size {item.size}
                            </div>
                          </td>
                          <td className="cot-price">{formatCurrency(item.donGia)}</td>
                          <td>
                            <span className="cot-qty-badge">{item.soLuong}</span>
                          </td>
                          <td style={{ textAlign: 'right' }} className="cot-price">
                            {formatCurrency(item.thanhTien)}
                          </td>
                          <td>
                            <button
                              className="cot-remove-btn"
                              onClick={() => handleRemoveItem(item.maChiTiet)}
                              disabled={isLoading}
                              title="Xóa sản phẩm"
                            >
                              ×
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="cot-sidebar">
          {/* ── Thanh toán (chỉ hiện khi có đơn) ── */}
          {currentOrder && (
            <div className="cot-card">
              <p className="cot-section-label">Thanh toán</p>

              <div className="cot-voucher-row">
                <input
                  type="text"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  placeholder="Mã giảm giá..."
                  disabled={appliedVoucher || isLoading}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyVoucher()}
                />
                <button
                  className="cot-btn cot-btn-outline-sm"
                  onClick={handleApplyVoucher}
                  disabled={appliedVoucher || isLoading || orderItems.length === 0}
                >
                  {appliedVoucher ? '✓ Đã áp dụng' : 'Áp dụng'}
                </button>
              </div>

              {/* Tổng tiền */}
              <div className="cot-summary">
                <div className="cot-summary-row">
                  <span>Tổng hàng</span>
                  <span>{formatCurrency(currentOrder.tongTien)}</span>
                </div>
                {currentOrder.giamGia > 0 && (
                  <div className="cot-summary-row cot-discount">
                    <span>Giảm giá</span>
                    <span>−{formatCurrency(currentOrder.giamGia)}</span>
                  </div>
                )}
                {currentOrder.phiVanChuyen > 0 ? (
                  <div className="cot-summary-row">
                    <span>Phí vận chuyển</span>
                    <span>{formatCurrency(currentOrder.phiVanChuyen)}</span>
                  </div>
                ) : (
                  <div className="cot-summary-row">
                    <span>Phí vận chuyển</span>
                    <span className="cot-free">Miễn phí</span>
                  </div>
                )}
                <div className="cot-summary-row cot-total">
                  <span>Tổng thanh toán</span>
                  <span>{formatCurrency(currentOrder.thanhTien)}</span>
                </div>
              </div>

              {/* Nút hành động */}
              <div className="cot-action-row">
                <button
                  className="cot-btn cot-btn-cancel"
                  onClick={handleCancelOrder}
                  disabled={isLoading || !canCancel}
                  title={!canCancel ? 'Không thể hủy đơn ở trạng thái hiện tại' : ''}
                >
                  Hủy đơn
                </button>
                <button
                  className="cot-btn cot-btn-pay"
                  onClick={handleFinalizeOrder}
                  disabled={isLoading || orderItems.length === 0}
                >
                  {isLoading ? 'Đang xử lý...' : 'Thanh toán tiền mặt'}
                </button>
              </div>
            </div>
          )}

          {/* ── Danh sách đơn chờ ── */}
          <div className="cot-card">
            <div className="cot-pending-header">
              <p className="cot-section-label" style={{ margin: 0 }}>Đơn chờ tại quầy</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {pendingOrders.length > 0 && (
                  <span className="cot-count-badge">{pendingOrders.length}</span>
                )}
                <button
                  className="cot-btn cot-btn-ghost-sm"
                  onClick={fetchPendingCounterOrders}
                  title="Làm mới"
                >
                  ↺
                </button>
              </div>
            </div>

            {pendingOrders.length === 0 ? (
              <div className="cot-empty-pending">
                <p>Không có đơn chờ</p>
              </div>
            ) : (
              <div className="cot-pending-list">
                {pendingOrders.map((o: any) => {
                  const isCurrentlyOpen = currentOrder?.maDonHang === o.maDonHang
                  return (
                    <div
                      key={o.maDonHang}
                      className={`cot-pending-item ${isCurrentlyOpen ? 'is-open' : ''}`}
                      onClick={() => !isCurrentlyOpen && handleResumeOrder(o.maDonHang)}
                      title={isCurrentlyOpen ? 'Đơn đang mở' : 'Nhấn để mở đơn này'}
                    >
                      <div className="cot-pending-avatar">
                        {getInitials(o.nguoiNhan || '')}
                      </div>
                      <div className="cot-pending-info">
                        <div className="cot-pending-name">
                          {o.nguoiNhan || 'Khách lẻ'}
                          {isCurrentlyOpen && <span className="cot-open-badge">Đang mở</span>}
                        </div>
                        <div className="cot-pending-meta">
                          #{o.maDonHang} · {o.soDienThoaiNhan || '—'}
                        </div>
                      </div>
                      <div className="cot-pending-right">
                        <div className="cot-pending-price">
                          {formatCurrency(o.thanhTien || 0)}
                        </div>
                        {!isCurrentlyOpen && (
                          <div className="cot-pending-open-hint">Mở →</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {!currentOrder && (
            <div className="cot-new-order-hint">
              <span>Nhập thông tin khách bên trái để tạo đơn mới</span>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════ MODAL CHỌN SẢN PHẨM ══════════════ */}
      {showProductModal && (
        <div className="cot-modal-overlay" onClick={() => setShowProductModal(false)}>
          <div className="cot-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cot-modal-header">
              <h3>Chọn sản phẩm</h3>
              <button className="cot-modal-close" onClick={() => setShowProductModal(false)}>×</button>
            </div>

            <div className="cot-modal-body">
              <input
                className="cot-search-input"
                type="text"
                placeholder="Tìm theo tên sản phẩm hoặc thương hiệu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />

              <p className="cot-modal-section-title">Chọn sản phẩm</p>
              <div className="cot-product-grid">
                {filteredProducts.map((product) => (
                  <div
                    key={product.maSanPham}
                    className={`cot-product-card ${selectedProduct === product.maSanPham ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedProduct(product.maSanPham)
                      setSelectedDetail(null)
                      setSelectedQuantity(1)
                    }}
                  >
                    {/* <div className="cot-product-thumb">
                      {product.hinhAnhChinh ? (
                        <img
                          src={`${BASE_IMAGE_URL}${product.hinhAnhChinh}`}
                          alt={product.tenSanPham}
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                        />
                      ) : null}
                    </div> */}
                    <div className="cot-product-name">{product.tenSanPham}</div>
                    <div className="cot-product-brand">{product.thuongHieu}</div>
                    <div className="cot-product-price">{formatCurrency(product.giaCoBan)}</div>
                  </div>
                ))}
                {filteredProducts.length === 0 && (
                  <p className="cot-no-results">Không tìm thấy sản phẩm phù hợp</p>
                )}
              </div>

              {selectedProduct && productDetails.length > 0 && (
                <>
                  <p className="cot-modal-section-title">Chọn màu sắc &amp; size</p>
                  <div className="cot-variant-grid">
                    {productDetails.map((detail) => (
                      <div
                        key={detail.maChiTiet}
                        className={`cot-variant-card
                          ${selectedDetail?.maChiTiet === detail.maChiTiet ? 'selected' : ''}
                          ${detail.soLuongTon === 0 ? 'out-of-stock' : ''}`}
                        onClick={() => {
                          if (detail.soLuongTon > 0) {
                            setSelectedDetail(detail)
                            setSelectedQuantity(1)
                          }
                        }}
                      >
                        <div className="cot-variant-top">
                          <div className="cot-variant-thumb">
                            {detail.hinhAnhChinh ? (
                              <img
                                src={`${BASE_IMAGE_URL}${detail.hinhAnhChinh}`}
                                alt={`${detail.mauSac} - ${detail.size}`}
                                onError={(e) => { 
                                  (e.currentTarget as HTMLImageElement).src = "/default.png"
                                }
                              }
                              />
                            ) : null}
                          </div>
                          <div>
                            <div className="cot-variant-color">{detail.mauSac}</div>
                            <div className="cot-variant-size">Size {detail.size}</div>
                          </div>
                        </div>
                        <div className="cot-variant-bottom">
                          <span className="cot-variant-price">{formatCurrency(detail.giaBan)}</span>
                          <span className={`cot-stock-badge ${detail.soLuongTon === 0 ? 'empty' : ''}`}>
                            {detail.soLuongTon === 0 ? 'Hết hàng' : `Kho: ${detail.soLuongTon}`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {selectedDetail && (
                <div
                  className="cot-qty-section"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <span className="cot-qty-label">Số lượng</span>
                  <div className="cot-qty-control">
                    <button
                      type="button"
                      className="cot-qty-btn"
                      onClick={(e) => { e.stopPropagation(); setSelectedQuantity(Math.max(1, selectedQuantity - 1)) }}
                      disabled={selectedQuantity <= 1}
                    >−</button>
                    <input
                      type="number"
                      className="cot-qty-input"
                      value={selectedQuantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1
                        setSelectedQuantity(Math.min(Math.max(1, val), selectedDetail.soLuongTon))
                      }}
                      onClick={(e) => e.stopPropagation()}
                      onFocus={(e) => e.target.select()}
                      min={1}
                      max={selectedDetail.soLuongTon}
                    />
                    <button
                      type="button"
                      className="cot-qty-btn"
                      onClick={(e) => { e.stopPropagation(); setSelectedQuantity(Math.min(selectedQuantity + 1, selectedDetail.soLuongTon)) }}
                      disabled={selectedQuantity >= selectedDetail.soLuongTon}
                    >+</button>
                  </div>
                  <span className="cot-qty-max">Tối đa: {selectedDetail.soLuongTon}</span>
                </div>
              )}
            </div>

            <div className="cot-modal-footer">
              <button className="cot-btn cot-btn-ghost" onClick={() => setShowProductModal(false)}>
                Hủy
              </button>
              <button
                className="cot-btn cot-btn-primary"
                onClick={handleAddItem}
                disabled={!selectedDetail || isLoading}
              >
                {isLoading ? 'Đang thêm...' : 'Thêm vào đơn'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CounterOrderTab