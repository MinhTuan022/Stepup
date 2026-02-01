import { useState, useEffect } from 'react'
import { adminService } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import './OrdersTab.css'

interface Order {
  maDonHang: number
  hoTen: string
  soDienThoai: string
  diaChi: string
  trangThai: string
  tongTien: number
  ghiChu?: string
}

const statusOptions = ['dat_hang', 'dang_chuan_bi', 'dang_giao', 'da_giao', 'da_huy']

const statusLabels: Record<string, string> = {
  dat_hang: 'Đã đặt',
  dang_chuan_bi: 'Đang chuẩn bị',
  dang_giao: 'Đang giao',
  da_giao: 'Đã giao',
  da_huy: 'Đã hủy',
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
      await adminService.updateOrderStatus(orderId, newStatus)
      showToast('Cập nhật trạng thái đơn hàng thành công', 'success')
      fetchOrders()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi khi cập nhật trạng thái'
      setError(message)
      showToast(message, 'error')
    }
  }

  const handleSaveEdit = async () => {
    if (!editingOrder) return
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
              <th>ID</th>
              <th>Khách hàng</th>
              <th>Điện thoại</th>
              <th>Địa chỉ</th>
              <th>Trạng thái</th>
              <th>Tổng tiền</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.maDonHang}>
                <td>#{order.maDonHang}</td>
                <td>{order.hoTen}</td>
                <td>{order.soDienThoai}</td>
                <td>{order.diaChi}</td>
                <td>
                  <span className={`status-badge status-${order.trangThai}`}>
                    {statusLabels[order.trangThai]}
                  </span>
                </td>
                <td className="price">{order.tongTien.toLocaleString('vi-VN')} ₫</td>
                <td className="actions">
                  <select
                    value={order.trangThai}
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
                    Sửa
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
              <h3>Chỉnh sửa đơn hàng #{editingOrder.maDonHang}</h3>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Họ tên:</label>
                <input
                  type="text"
                  value={editingOrder.hoTen}
                  onChange={(e) => setEditingOrder({ ...editingOrder, hoTen: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Điện thoại:</label>
                <input
                  type="text"
                  value={editingOrder.soDienThoai}
                  onChange={(e) => setEditingOrder({ ...editingOrder, soDienThoai: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Địa chỉ:</label>
                <input
                  type="text"
                  value={editingOrder.diaChi}
                  onChange={(e) => setEditingOrder({ ...editingOrder, diaChi: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Trạng thái:</label>
                <select
                  value={editingOrder.trangThai}
                  onChange={(e) => setEditingOrder({ ...editingOrder, trangThai: e.target.value })}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {statusLabels[status]}
                    </option>
                  ))}
                </select>
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
                Hủy
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
