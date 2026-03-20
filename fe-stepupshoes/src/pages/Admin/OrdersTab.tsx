import { useState, useEffect } from 'react'
import { adminService } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import './OrdersTab.css'

/**
 * OrdersTab Component
 * 
 * Quản lý đơn hàng với các tính năng:
 * - Xem danh sách đơn hàng với phân trang và lọc theo trạng thái
 * - Cập nhật trạng thái đơn hàng (đặt hàng -> xác nhận -> đang giao -> đã giao -> hoàn thành)
 * - Tự động cập nhật trạng thái thanh toán khi đơn hàng được giao
 * - Chỉnh sửa thông tin đơn hàng
 * - Xóa đơn hàng
 * 
 * Logic thanh toán COD (Cash on Delivery):
 * - Khi đơn hàng chuyển sang "đã giao" hoặc "hoàn thành", 
 *   trạng thái thanh toán tự động cập nhật từ "chưa thanh toán" thành "đã thanh toán"
 */

interface Order {
  maDonHang: number
  maNguoiDung: number
  tongTien: number
  phiVanChuyen: number
  giamGia: number
  thanhTien: number
  trangThaiDonHang: string
  trangThaiThanhToan: string
  phuongThucThanhToan: string
  loaiDonHang: string
  diaChiGiaoHang: string
  soDienThoaiNhan: string
  nguoiNhan: string
  ghiChu?: string
  ngayDatHang?: string
  ngayCapNhat?: string
  lyDoYeuCauHuy?: string
  ngayYeuCauHuy?: string
}

// Trạng thái theo thứ tự tiến triển (phải giữ thứ tự này)
const orderStatusSequence = [
  'cho_xac_nhan',
  'chuan_bi_hang',
  'yeu_cau_huy',
  'dang_giao_hang',
  'da_giao_hang',
  'nhan_thanh_cong',
  'hoan_thanh',
  'huy'
]

// Trạng thái hiển thị
const statusLabels: Record<string, string> = {
  cho_xac_nhan: 'Chờ xác nhận',
  chuan_bi_hang: 'Chuẩn bị hàng',
  yeu_cau_huy: 'Yêu cầu hủy',
  dang_giao_hang: 'Đang giao',
  da_giao_hang: 'Đã giao',
  nhan_thanh_cong: 'Nhận thành công',
  hoan_thanh: 'Hoàn thành',
  huy: 'Đã hủy',
}

const paymentStatusLabels: Record<string, string> = {
  chua_thanh_toan: 'Chưa thanh toán',
  da_thanh_toan: 'Đã thanh toán',
  hoan_tien: 'Hoàn tiền',
}

const paymentMethodLabels: Record<string, string> = {
  tien_mat: 'Tiền mặt',
  chuyen_khoan: 'Chuyển khoản',
  the_tin_dung: 'Thẻ tín dụng',
  vi_dien_tu: 'Ví điện tử',
}

const OrdersTab = () => {
  const { showToast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [page, pageSize, filterStatus])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await adminService.getAllOrders(page, pageSize, filterStatus || undefined)
      setOrders(data.orders || [])
      setTotalPages(data.totalPages || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async (orderId: number) => {
    try {
      const data = await adminService.getOrderById(orderId)
      setEditingOrder(data)
      setShowEditModal(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi tải chi tiết đơn hàng')
    }
  }

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      const order = orders.find(o => o.maDonHang === orderId)
      if (!order) return

      // Determine allowed transitions
      const seq = orderStatusSequence
      const curIndex = seq.indexOf(order.trangThaiDonHang)
      const newIndex = seq.indexOf(newStatus)

      // For counter orders, allow only specific statuses
      if (order.loaiDonHang === 'tai_quay') {
        const allowedForCounter = ['cho_xac_nhan', 'hoan_thanh', 'huy']
        if (!allowedForCounter.includes(newStatus)) {
          showToast('Trạng thái này không áp dụng cho đơn tại quầy', 'error')
          return
        }
      }

      // Prevent rollback or invalid moves, but allow admin to reject a cancel request
      const isRejectingCancelRequest = (order.trangThaiDonHang === 'yeu_cau_huy' && newStatus === 'chuan_bi_hang')
      if (curIndex === -1 || newIndex === -1 || (newIndex < curIndex && !isRejectingCancelRequest)) {
        showToast('Chỉ được cập nhật trạng thái theo hướng tiến tới (không rollback)', 'error')
        return
      }

      // Only allow cancel when order is in allowed cancel states (now only 'cho_xac_nhan')
      const cancelable = ['cho_xac_nhan', 'yeu_cau_huy']
      if (newStatus === 'huy' && !cancelable.includes(order.trangThaiDonHang)) {
        showToast('Không thể hủy đơn hàng ở trạng thái hiện tại', 'error')
        return
      }

      const fromLabel = statusLabels[order.trangThaiDonHang] || order.trangThaiDonHang
      const toLabel = statusLabels[newStatus] || newStatus
      const confirmMsg = `Xác nhận chuyển trạng thái đơn hàng từ "${fromLabel}" → "${toLabel}"?`

      if (newStatus === 'huy') {
        if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) return
      } else if (!confirm(confirmMsg)) {
        return
      }

      await adminService.updateOrderStatus(orderId, newStatus)
      showToast('Cập nhật trạng thái đơn hàng thành công', 'success')

      // Tự động cập nhật trạng thái thanh toán khi đơn hàng đã giao/hoàn thành
      if (newStatus === 'da_giao_hang' || newStatus === 'hoan_thanh' || newStatus === 'nhan_thanh_cong') {
        if (order && order.trangThaiThanhToan === 'chua_thanh_toan') {
          try {
            // Only send payment status field — do NOT include trangThaiDonHang here.
            await adminService.updateOrder(orderId, { trangThaiThanhToan: 'da_thanh_toan' })
            showToast('Đã cập nhật trạng thái thanh toán thành "Đã thanh toán"', 'success')
          } catch (err) {
            console.error('Lỗi khi cập nhật trạng thái thanh toán:', err)
          }
        }
      }

      fetchOrders()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi khi cập nhật trạng thái'
      setError(message)
      showToast(message, 'error')
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Progress helpers
  const progressSequence = ['cho_xac_nhan', 'chuan_bi_hang', 'dang_giao_hang', 'da_giao_hang', 'nhan_thanh_cong', 'hoan_thanh']

  const getProgressPercent = (status: string) => {
    if (!status) return 0
    if (status === 'huy') return 0
    const idx = progressSequence.indexOf(status)
    if (idx === -1) return 0
    const total = progressSequence.length - 1
    return Math.round((idx / total) * 100)
  }

  const getNextStatusForOrder = (order: Order) => {
    const curIdx = orderStatusSequence.indexOf(order.trangThaiDonHang)
    if (curIdx === -1) return null

    // Special handling for counter orders (tai_quay)
    if (order.loaiDonHang === 'tai_quay') {
      // allow jump to 'hoan_thanh' from initial state
      if (order.trangThaiDonHang === 'cho_xac_nhan') return 'hoan_thanh'
      return null
    }

    // find next valid status (skip 'huy')
    for (let i = curIdx + 1; i < orderStatusSequence.length; i++) {
      const s = orderStatusSequence[i]
      // skip cancellation-request state; it's user-driven
      if (s !== 'huy' && s !== 'yeu_cau_huy') return s
    }
    return null
  }

  const handleAdvance = (order: Order) => {
    if (order.loaiDonHang === 'tai_quay') {
      showToast('Không thể cập nhật trạng thái cho đơn tại quầy', 'error')
      return
    }
    const next = getNextStatusForOrder(order)
    if (!next) {
      showToast('Không có trạng thái tiếp theo', 'error')
      return
    }
    handleStatusChange(order.maDonHang, next)
  }

  const handleCancelAction = (order: Order) => {
    if (order.loaiDonHang === 'tai_quay') {
      showToast('Không thể hủy đơn tại quầy từ đây', 'error')
      return
    }
    if (order.trangThaiDonHang !== 'cho_xac_nhan') {
      showToast('Chỉ được hủy khi đơn ở trạng thái "Chờ xác nhận"', 'error')
      return
    }
    handleStatusChange(order.maDonHang, 'huy')
  }

  const handleSaveEdit = async () => {
    if (!editingOrder) return
    
    // Validation
    if (!editingOrder.nguoiNhan || !editingOrder.nguoiNhan.trim()) {
      showToast('Vui lòng nhập tên người nhận', 'error')
      return
    }

    if (!editingOrder.soDienThoaiNhan || !editingOrder.soDienThoaiNhan.trim()) {
      showToast('Vui lòng nhập số điện thoại', 'error')
      return
    }

    // Kiểm tra logic trạng thái thanh toán (sử dụng khoá trạng thái chính xác)
    if (['da_giao_hang', 'nhan_thanh_cong', 'hoan_thanh'].includes(editingOrder.trangThaiDonHang)) {
      if (editingOrder.trangThaiThanhToan === 'chua_thanh_toan') {
        if (!confirm('Đơn hàng đã giao nhưng chưa thanh toán. Bạn có muốn cập nhật trạng thái thanh toán thành "Đã thanh toán"?')) {
          // Tự động cập nhật nếu user bỏ qua xác nhận
          editingOrder.trangThaiThanhToan = 'da_thanh_toan'
        }
      }
    }

    try {
      // Gọi API với payload tối giản (chỉ các trường có thể chỉnh)
      const payload: any = {
        nguoiNhan: editingOrder.nguoiNhan,
        soDienThoaiNhan: editingOrder.soDienThoaiNhan,
        diaChiGiaoHang: editingOrder.diaChiGiaoHang,
        ghiChu: editingOrder.ghiChu,
        // Do NOT include trangThaiDonHang here — backend treats its presence as a status-only update
        trangThaiThanhToan: editingOrder.trangThaiThanhToan,
      }
      await adminService.updateOrder(editingOrder.maDonHang, payload)
      showToast('Cập nhật đơn hàng thành công', 'success')
      setShowEditModal(false)
      setEditingOrder(null)
      fetchOrders()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi khi cập nhật'
      setError(message)
      showToast(message, 'error')
    }
  }

  const handleDeleteOrder = async (id: number) => {
    // if (!confirm('Bạn có chắc muốn xóa đơn hàng này?')) return
    // try {
    //   await adminService.deleteOrder(id)
    //   showToast('Xóa đơn hàng thành công', 'success')
    //   fetchOrders()
    // } catch (err) {
    //   const message = err instanceof Error ? err.message : 'Lỗi khi xóa đơn hàng'
    //   setError(message)
    //   showToast(message, 'error')
    // }
  }

  // Helpers to read order items from different possible response shapes
  const getOrderItems = (order: any) => {
    if (!order) return []
    return (
      order.items ||
      order.products ||
      order.orderItems ||
      order.chiTietDonHang ||
      order.chiTietDonHangs ||
      []
    )
  }

  if (loading) return <div className="loading">Đang tải dữ liệu...</div>
  if (error) return <div className="error">Lỗi: {error}</div>

  return (
    <div className="orders-tab">
      <div className="tab-header">
        <h2>Quản lý đơn hàng</h2>
        <div className="filter-section">
          <label>Lọc theo trạng thái:</label>
          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}>
            <option value="">Tất cả</option>
            {orderStatusSequence.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Người nhận</th>
              <th>SĐT</th>
              <th>Địa chỉ</th>
              <th>Ngày đặt</th>
              <th>Trạng thái ĐH</th>
              <th>Trạng thái thanh toán</th>
              <th>Tổng tiền</th>
              <th>Thành tiền</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const curProgressIdx = progressSequence.indexOf(order.trangThaiDonHang)
              const nextStatus = getNextStatusForOrder(order)
              const isCanceled = order.trangThaiDonHang === 'huy'

              return (
              <>
                <tr key={order.maDonHang} className={`order-row ${order.loaiDonHang === 'tai_quay' ? 'counter-order' : 'online-order'}`}>
                {/* <td>#{order.maDonHang}</td> */}
                <td>
                  <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                    <span>{order.nguoiNhan || 'N/A'}</span>
                    <span className={`badge ${order.loaiDonHang === 'tai_quay' ? 'badge-quay' : 'badge-online'}`}>
                      {order.loaiDonHang === 'tai_quay' ? 'Quầy' : 'Online'}
                    </span>
                  </div>
                </td>
                <td>{order.soDienThoaiNhan || 'N/A'}</td>
                <td title={order.diaChiGiaoHang}>
                  {order.diaChiGiaoHang?.substring(0, 30) || 'N/A'}
                  {order.diaChiGiaoHang && order.diaChiGiaoHang.length > 30 ? '...' : ''}
                </td>
                <td>{formatDate(order.ngayDatHang)}</td>
                <td>
                  <span className={`status-badge status-${order.trangThaiDonHang}`}>
                    {statusLabels[order.trangThaiDonHang] || order.trangThaiDonHang}
                  </span>
                </td>
                <td>
                  <span className={`payment-badge payment-${order.trangThaiThanhToan}`}>
                    {paymentStatusLabels[order.trangThaiThanhToan] || order.trangThaiThanhToan}
                  </span>
                </td>
                <td className="price">{order.tongTien?.toLocaleString('vi-VN') || 0} ₫</td>
                <td className="price"><strong>{order.thanhTien?.toLocaleString('vi-VN') || 0} ₫</strong></td>
                <td className="actions">
                  <button className="btn-edit" onClick={() => handleEdit(order.maDonHang)}>
                    Chi tiết
                  </button>
                </td>
                </tr>

                {order.loaiDonHang !== 'tai_quay' && (
                  <tr className="progress-row" key={order.maDonHang + '-progress'}>
                    <td colSpan={9}>
                      <div className="order-progress">
                      {/* Steps row with icons and labels */}
                      <div className="progress-steps-row">
                        {progressSequence.map((s, i) => {
                          const completed = i <= curProgressIdx
                          return (
                            <>
                              <div key={s} className="step-wrapper">
                                <div className={`step-icon ${isCanceled ? 'canceled' : completed ? 'completed' : ''}`}>
                                  {isCanceled ? '✗' : completed ? '✓' : i + 1}
                                </div>
                                <div className="step-label">{statusLabels[s]}</div>
                              </div>
                              {i < progressSequence.length - 1 && (
                                <div
                                  key={s + '-conn'}
                                  className={`label-connector ${isCanceled ? 'canceled' : i < curProgressIdx ? 'completed' : ''}`}
                                />
                              )}
                            </>
                          )
                        })}
                      </div>

                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{ width: `${getProgressPercent(order.trangThaiDonHang)}%` }}
                        />

                        {progressSequence.map((s, i) => (
                          <span
                            key={s}
                            className={`progress-step ${isCanceled ? 'canceled' : i <= curProgressIdx ? 'completed' : ''}`}
                            style={{ left: `${(i / (progressSequence.length - 1)) * 100}%` }}
                            title={statusLabels[s]}
                          />
                        ))}
                      </div>

                      {/* <div style={{ minWidth: 160, fontWeight: 600, color: '#333' }}>
                        {statusLabels[order.trangThaiDonHang] || order.trangThaiDonHang}
                      </div> */}

                      {/* <div style={{ minWidth: 160 }}>
                        <span className={`payment-badge payment-${order.trangThaiThanhToan}`}>
                          {paymentStatusLabels[order.trangThaiThanhToan] || order.trangThaiThanhToan}
                        </span>
                      </div> */}

                        <div className="order-actions">
                          {order.trangThaiDonHang === 'yeu_cau_huy' ? (
                            <>
                              <button
                                className="btn-approve"
                                onClick={() => handleStatusChange(order.maDonHang, 'huy')}
                                title="Duyệt yêu cầu hủy"
                              >
                                Duyệt hủy
                              </button>
                              <button
                                className="btn-reject"
                                onClick={() => handleStatusChange(order.maDonHang, 'chuan_bi_hang')}
                                title="Từ chối yêu cầu hủy"
                              >
                                Từ chối
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="btn-update"
                                onClick={() => handleAdvance(order)}
                                disabled={!nextStatus}
                                title={nextStatus ? `Cập nhật sang: ${statusLabels[nextStatus]}` : undefined}
                              >
                                {nextStatus ? `Cập nhật → ${statusLabels[nextStatus]}` : 'Không có hành động'}
                              </button>
                              <button
                                className={`btn-cancel ${order.loaiDonHang === 'tai_quay' || order.trangThaiDonHang !== 'cho_xac_nhan' ? 'disabled' : ''}`}
                                onClick={() => handleCancelAction(order)}
                                title={order.trangThaiDonHang !== 'cho_xac_nhan' ? 'Chỉ được hủy khi đang ở trạng thái Chờ xác nhận' : undefined}
                                aria-disabled={order.loaiDonHang === 'tai_quay' || order.trangThaiDonHang !== 'cho_xac_nhan'}
                              >
                                Hủy
                              </button>
                            </>
                          )}
                        </div>
                    </div>
                    </td>
                  </tr>
                )}
              </>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}>
          ← Trước
        </button>
        <span>
          Trang {page + 1} / {totalPages}
        </span>
        <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1}>
          Sau →
        </button>
      </div>

      {showEditModal && editingOrder && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết đơn hàng #{editingOrder.maDonHang}</h3>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="order-info-grid">
                <div className="info-section">
                  <h4>Thông tin người nhận</h4>
                  <div className="form-group">
                    <label>Họ tên:</label>
                    <input
                      type="text"
                      value={editingOrder.nguoiNhan || ''}
                      onChange={(e) => setEditingOrder({ ...editingOrder, nguoiNhan: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Điện thoại:</label>
                    <input
                      type="text"
                      value={editingOrder.soDienThoaiNhan || ''}
                      onChange={(e) => setEditingOrder({ ...editingOrder, soDienThoaiNhan: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Địa chỉ giao hàng:</label>
                    <textarea
                      value={editingOrder.diaChiGiaoHang || ''}
                      onChange={(e) => setEditingOrder({ ...editingOrder, diaChiGiaoHang: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>

                <div className="info-section">
                  <h4>Thông tin đơn hàng</h4>
                  <div className="form-group">
                    <label>Ngày đặt hàng:</label>
                    <input type="text" value={formatDate(editingOrder.ngayDatHang)} disabled />
                  </div>
                  <div className="form-group">
                    <label>Loại đơn hàng:</label>
                    <input type="text" value={editingOrder.loaiDonHang === 'online' ? 'Online' : 'Quầy'} disabled />
                  </div>
                  <div className="form-group">
                    <label>Phương thức thanh toán:</label>
                    <input
                      type="text"
                      value={paymentMethodLabels[editingOrder.phuongThucThanhToan] || editingOrder.phuongThucThanhToan}
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label>Trạng thái đơn hàng:</label>
                    <div>
                      <span className={`status-badge status-${editingOrder.trangThaiDonHang}`}>
                        {statusLabels[editingOrder.trangThaiDonHang] || editingOrder.trangThaiDonHang}
                      </span>
                    </div>
                  </div>

                  {editingOrder.lyDoYeuCauHuy && (
                    <div className="form-group">
                      <label>Yêu cầu hủy:</label>
                      <div>
                        <p style={{ margin: 0 }}>{editingOrder.lyDoYeuCauHuy}</p>
                        {editingOrder.ngayYeuCauHuy && (
                          <small className="muted">{formatDate(editingOrder.ngayYeuCauHuy)}</small>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="form-group">
                    <label>Trạng thái thanh toán:</label>
                    <div>
                      <span className={`payment-badge payment-${editingOrder.trangThaiThanhToan}`}>
                        {paymentStatusLabels[editingOrder.trangThaiThanhToan] || editingOrder.trangThaiThanhToan}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="info-section">
                  <h4>Chi phí</h4>
                  <div className="form-group">
                    <label>Tổng tiền:</label>
                    <input
                      type="text"
                      value={`${editingOrder.tongTien?.toLocaleString('vi-VN') || 0} ₫`}
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label>Phí vận chuyển:</label>
                    <input
                      type="text"
                      value={`${editingOrder.phiVanChuyen?.toLocaleString('vi-VN') || 0} ₫`}
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label>Giảm giá:</label>
                    <input
                      type="text"
                      value={`${editingOrder.giamGia?.toLocaleString('vi-VN') || 0} ₫`}
                      disabled
                    />
                  </div>
                  <div className="form-group">
                    <label><strong>Thành tiền:</strong></label>
                    <input
                      type="text"
                      value={`${editingOrder.thanhTien?.toLocaleString('vi-VN') || 0} ₫`}
                      disabled
                      style={{ fontWeight: 'bold', fontSize: '16px' }}
                    />
                  </div>
                </div>
              </div>

              {/* Sản phẩm - danh sách nằm dưới grid */}
              <div className="info-section">
                <h4>Sản phẩm</h4>
                <div>
                  {(() => {
                    const items = getOrderItems(editingOrder)
                    if (!items || items.length === 0) return <div>Không có sản phẩm</div>
                    return (
                      <table className="order-products">
                        <thead>
                          <tr>
                            <th>Hình</th>
                            <th>Tên sản phẩm</th>
                            <th>Số lượng</th>
                            <th>Đơn giá</th>
                            {/* <th>Thành tiền</th> */}
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((it: any, idx: number) => {
                            const name = it.tenSanPham || it.name || it.productName || it.title || (it.product && (it.product.name || it.product.tenSanPham)) || 'Sản phẩm'
                            const qty = it.soLuong || it.quantity || it.qty || (it.product && it.product.quantity) || 1
                            const price = it.donGia || it.price || it.unitPrice || it.gia || (it.product && it.product.price) || 0
                            const total = it.thanhTien || it.subtotal || it.total || price * qty
                            const img = it.hinhAnh || it.image || it.hinhAnhChinh || (it.product && it.product.image) || ''
                            return (
                              <tr key={idx}>
                                <td className="prod-img">
                                  {img ? (
                                    <img src={img} alt={name} onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png' }} />
                                  ) : (
                                    <div className="no-img">—</div>
                                  )}
                                </td>
                                <td>{name}</td>
                                <td className="center">{qty}</td>
                                <td className="price">{typeof price === 'number' ? price.toLocaleString('vi-VN') : price} ₫</td>
                                {/* <td className="price"><strong>{typeof total === 'number' ? total.toLocaleString('vi-VN') : total} ₫</strong></td> */}
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    )
                  })()}
                </div>
              </div>

              <div className="form-group">
                <label>Ghi chú:</label>
                <textarea
                  value={editingOrder.ghiChu || ''}
                  onChange={(e) => setEditingOrder({ ...editingOrder, ghiChu: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowEditModal(false)}>
                Đóng
              </button>
              <button className="btn-save" onClick={handleSaveEdit}>
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrdersTab
