import { useState, useEffect } from 'react'
import { adminService } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import './VouchersTab.css'

interface Voucher {
  maVoucher: number
  code: string
  moTa: string
  giaTriGiam: number
  loaiGiam: string
  giaTriToiThieu: number
  giamToiDa?: number
  soLuongDaDung?: number
  trangThai?: boolean
  ngayBatDau: string
  ngayKetThuc: string
  soLuong: number
  ngayTao?: string
}

const VouchersTab = () => {
  const { showToast } = useToast()
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null)
  const [formData, setFormData] = useState<Partial<Voucher>>({
    code: '',
    moTa: '',
    giaTriGiam: 0,
    loaiGiam: 'phan_tram',
    giaTriToiThieu: 0,
    giamToiDa: 0,
    ngayBatDau: '',
    ngayKetThuc: '',
    soLuong: 0,
  })

  useEffect(() => {
    fetchVouchers()
  }, [page, pageSize])

  const fetchVouchers = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await adminService.getAllVouchers(page, pageSize)
      setVouchers(data.vouchers || [])
      setTotalPages(data.totalPages || 0)
    } catch (err) {
      console.error('Error fetching vouchers:', err)
      const errorMessage = err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu'
      setError(errorMessage)
      showToast(errorMessage, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (voucher: Voucher) => {
    setEditingVoucher(voucher)
    // Format datetime for datetime-local input (YYYY-MM-DDTHH:mm)
    const formattedVoucher = {
      ...voucher,
      ngayBatDau: voucher.ngayBatDau ? new Date(voucher.ngayBatDau).toISOString().slice(0, 16) : '',
      ngayKetThuc: voucher.ngayKetThuc ? new Date(voucher.ngayKetThuc).toISOString().slice(0, 16) : '',
    }
    setFormData(formattedVoucher)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingVoucher) {
        await adminService.updateVoucher(editingVoucher.maVoucher, formData)
        showToast('Cập nhật voucher thành công', 'success')
      } else {
        await adminService.createVoucher(formData)
        showToast('Tạo voucher thành công', 'success')
      }
      setShowForm(false)
      setEditingVoucher(null)
      setFormData({
        code: '',
        moTa: '',
        giaTriGiam: 0,
        loaiGiam: 'phan_tram',
        giaTriToiThieu: 0,
        giamToiDa: 0,
        ngayBatDau: '',
        ngayKetThuc: '',
        soLuong: 0,
      })
      fetchVouchers()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi khi lưu voucher'
      setError(message)
      showToast(message, 'error')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa voucher này?')) return
    try {
      await adminService.deleteVoucher(id)
      showToast('Xóa voucher thành công', 'success')
      fetchVouchers()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi khi xóa voucher'
      setError(message)
      showToast(message, 'error')
    }
  }

  if (loading) return <div className="loading">Đang tải dữ liệu...</div>
  if (error) return <div className="error">Lỗi: {error}</div>

  return (
    <div className="vouchers-tab">
      <div className="tab-header">
        <h2>Quản lý voucher</h2>
        <button
          className="btn-add"
          onClick={() => {
            setEditingVoucher(null)
            setFormData({
              code: '',
              moTa: '',
              giaTriGiam: 0,
              loaiGiam: 'phan_tram',
              giaTriToiThieu: 0,
              giamToiDa: 0,
              ngayBatDau: '',
              ngayKetThuc: '',
              soLuong: 0,
            })
            setShowForm(true)
          }}
        >
          ➕ Thêm voucher mới
        </button>
      </div>

      <div className="vouchers-table-container">
        <table className="vouchers-table">
          <thead>
            <tr>
              <th>Mã voucher</th>
              <th>Mô tả</th>
              <th>Giá trị giảm</th>
              <th>Đã dùng</th>
              <th>Bắt đầu</th>
              <th>Kết thúc</th>
              <th>Số lượng</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {vouchers.map((voucher) => (
              <tr key={voucher.maVoucher}>
                <td>
                  <span className="voucher-code">{voucher.code}</span>
                </td>
                <td>{voucher.moTa}</td>
                <td>
                  <span className="discount-value">
                    {voucher.giaTriGiam}
                    {voucher.loaiGiam === 'phan_tram' ? '%' : ' ₫'}
                  </span>
                </td>
                <td>{voucher.soLuongDaDung || 0}</td>
                <td>{new Date(voucher.ngayBatDau).toLocaleDateString('vi-VN')}</td>
                <td>{new Date(voucher.ngayKetThuc).toLocaleDateString('vi-VN')}</td>
                <td className="quantity">{voucher.soLuong}</td>
                <td className="actions">
                  <button className="btn-edit" onClick={() => handleEdit(voucher)}>
                    Sửa
                  </button>
                  <button className="btn-delete" onClick={() => handleDelete(voucher.maVoucher)}>
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

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingVoucher ? 'Chỉnh sửa voucher' : 'Tạo voucher mới'}</h3>
              <button className="close-btn" onClick={() => setShowForm(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Mã voucher:</label>
                  <input
                    type="text"
                    required
                    value={formData.code || ''}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Mô tả:</label>
                  <input
                    type="text"
                    required
                    value={formData.moTa || ''}
                    onChange={(e) => setFormData({ ...formData, moTa: e.target.value })}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Giá trị giảm:</label>
                    <input
                      type="number"
                      required
                      value={formData.giaTriGiam || 0}
                      onChange={(e) => setFormData({ ...formData, giaTriGiam: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Loại giảm:</label>
                    <select
                      value={formData.loaiGiam || 'phan_tram'}
                      onChange={(e) => setFormData({ ...formData, loaiGiam: e.target.value })}
                    >
                      <option value="phan_tram">Phần trăm (%)</option>
                      <option value="so_tien">Số tiền cố định (₫)</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Giá trị tối thiểu:</label>
                  <input
                    type="number"
                    required
                    value={formData.giaTriToiThieu || 0}
                    onChange={(e) => setFormData({ ...formData, giaTriToiThieu: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>Giảm tối đa (nếu là %):</label>
                  <input
                    type="number"
                    value={formData.giamToiDa || 0}
                    onChange={(e) => setFormData({ ...formData, giamToiDa: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Ngày bắt đầu:</label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.ngayBatDau || ''}
                      onChange={(e) => setFormData({ ...formData, ngayBatDau: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Ngày kết thúc:</label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.ngayKetThuc || ''}
                      onChange={(e) => setFormData({ ...formData, ngayKetThuc: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Số lượng:</label>
                  <input
                    type="number"
                    required
                    value={formData.soLuong || 0}
                    onChange={(e) => setFormData({ ...formData, soLuong: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn-save">
                  {editingVoucher ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default VouchersTab
