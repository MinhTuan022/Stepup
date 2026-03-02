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
}

const statusOptions = ['dat_hang', 'xac_nhan', 'dang_giao', 'da_giao', 'huy', 'hoan_thanh']

const statusLabels: Record<string, string> = {
  dat_hang: 'Đã đặt hàng',
  xac_nhan: 'Đã xác nhận',
  dang_giao: 'Đang giao',
  da_giao: 'Đã giao',
  huy: 'Đã hủy',
  hoan_thanh: 'Hoàn thành',
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
      // Cảnh báo khi hủy đơn hàng
      if (newStatus === 'huy') {
        if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) {
          return
        }
      }

      // Xác nhận khi chuyển sang trạng thái hoàn thành
      if (newStatus === 'hoan_thanh') {
        if (!confirm('Xác nhận đơn hàng đã hoàn thành?')) {
          return
        }
      }

      await adminService.updateOrderStatus(orderId, newStatus)
      showToast('Cập nhật trạng thái đơn hàng thành công', 'success')

      // Tự động cập nhật trạng thái thanh toán khi đơn hàng đã giao
      if (newStatus === 'da_giao' || newStatus === 'hoan_thanh') {
        const order = orders.find(o => o.maDonHang === orderId)
        if (order && order.trangThaiThanhToan === 'chua_thanh_toan') {
          try {
            // Cập nhật trạng thái thanh toán thành đã thanh toán
            // Quan trọng: phải giữ trạng thái đơn hàng mới để không bị ghi đè
            const updatedOrder = { 
              ...order, 
              trangThaiDonHang: newStatus,
              trangThaiThanhToan: 'da_thanh_toan' 
            }
            await adminService.updateOrder(orderId, updatedOrder)
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

    // Kiểm tra logic trạng thái thanh toán
    if (editingOrder.trangThaiDonHang === 'da_giao' || editingOrder.trangThaiDonHang === 'hoan_thanh') {
      if (editingOrder.trangThaiThanhToan === 'chua_thanh_toan') {
        if (!confirm('Đơn hàng đã giao nhưng chưa thanh toán. Bạn có muốn cập nhật trạng thái thanh toán thành "Đã thanh toán"?')) {
          // Tự động cập nhật
          editingOrder.trangThaiThanhToan = 'da_thanh_toan'
        }
      }
    }

    try {
      await adminService.updateOrder(editingOrder.maDonHang, editingOrder)
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
    if (!confirm('Bạn có chắc muốn xóa đơn hàng này?')) return
    try {
      await adminService.deleteOrder(id)
      showToast('Xóa đơn hàng thành công', 'success')
      fetchOrders()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi khi xóa đơn hàng'
      setError(message)
      showToast(message, 'error')
    }
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
            {statusOptions.map((status) => (
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
              {/* <th>ID</th> */}
              <th>Người nhận</th>
              <th>SĐT</th>
              <th>Địa chỉ</th>
              <th>Ngày đặt</th>
              <th>Loại đơn</th>
              <th>Thanh toán</th>
              <th>Trạng thái ĐH</th>
              <th>Trạng thái TT</th>
              <th>Tổng tiền</th>
              <th>Thành tiền</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.maDonHang}>
                {/* <td>#{order.maDonHang}</td> */}
                <td>{order.nguoiNhan || 'N/A'}</td>
                <td>{order.soDienThoaiNhan || 'N/A'}</td>
                <td title={order.diaChiGiaoHang}>
                  {order.diaChiGiaoHang?.substring(0, 30) || 'N/A'}
                  {order.diaChiGiaoHang && order.diaChiGiaoHang.length > 30 ? '...' : ''}
                </td>
                <td>{formatDate(order.ngayDatHang)}</td>
                <td>
                  <span className={`badge badge-${order.loaiDonHang}`}>
                    {order.loaiDonHang === 'online' ? 'Online' : 'Quầy'}
                  </span>
                </td>
                <td>
                  {paymentMethodLabels[order.phuongThucThanhToan] || order.phuongThucThanhToan}
                </td>
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
                  <select
                    value={order.trangThaiDonHang}
                    onChange={(e) => handleStatusChange(order.maDonHang, e.target.value)}
                    className="status-select"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {statusLabels[status]}
                      </option>
                    ))}
                  </select>
                  <button className="btn-edit" onClick={() => handleEdit(order.maDonHang)}>
                    Chi tiết
                  </button>
                  <button className="btn-delete" onClick={() => handleDeleteOrder(order.maDonHang)}>
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
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
                    <select
                      value={editingOrder.trangThaiDonHang}
                      onChange={(e) => setEditingOrder({ ...editingOrder, trangThaiDonHang: e.target.value })}
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {statusLabels[status]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Trạng thái thanh toán:</label>
                    <select
                      value={editingOrder.trangThaiThanhToan}
                      onChange={(e) => setEditingOrder({ ...editingOrder, trangThaiThanhToan: e.target.value })}
                    >
                      <option value="chua_thanh_toan">Chưa thanh toán</option>
                      <option value="da_thanh_toan">Đã thanh toán</option>
                      <option value="hoan_tien">Hoàn tiền</option>
                    </select>
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
