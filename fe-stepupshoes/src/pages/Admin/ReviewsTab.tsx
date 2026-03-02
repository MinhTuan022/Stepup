import { useState, useEffect } from 'react'
import { adminService } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import './ReviewsTab.css'

interface Review {
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

const ReviewsTab = () => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [filterStatus, setFilterStatus] = useState<number | ''>('')
  const { showToast } = useToast()

  useEffect(() => {
    fetchReviews()
  }, [page, pageSize, filterStatus])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await adminService.getAllReviews(
        page,
        pageSize,
        filterStatus === '' ? undefined : (filterStatus as number)
      )
      setReviews(data.reviews || [])
      setTotalPages(data.totalPages || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: number) => {
    try {
      await adminService.approveReview(id)
      showToast('Duyệt đánh giá thành công', 'success')
      fetchReviews()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi khi duyệt đánh giá'
      setError(message)
      showToast(message, 'error')
    }
  }

  const handleReject = async (id: number) => {
    try {
      await adminService.rejectReview(id)
      showToast('Từ chối đánh giá thành công', 'success')
      fetchReviews()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi khi từ chối đánh giá'
      setError(message)
      showToast(message, 'error')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa đánh giá này?')) return
    try {
      await adminService.deleteReview(id)
      showToast('Xóa đánh giá thành công', 'success')
      fetchReviews()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi khi xóa đánh giá'
      setError(message)
      showToast(message, 'error')
    }
  }

  const renderStars = (rating: number) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating)
  }

  if (loading) return <div className="loading">Đang tải dữ liệu...</div>
  if (error) return <div className="error">Lỗi: {error}</div>

  return (
    <div className="reviews-tab">
      <div className="tab-header">
        <h2>Quản lý đánh giá</h2>
        <div className="filter-section">
          <label>Lọc theo trạng thái:</label>
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value === '' ? '' : parseInt(e.target.value))
              setPage(0)
            }}
          >
            <option value="">Tất cả</option>
            <option value="0">Chờ duyệt</option>
            <option value="1">Đã duyệt</option>
          </select>
        </div>
      </div>

      <div className="reviews-container">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.maDanhGia} className="review-card">
              <div className="review-header">
                <div className="review-info">
                  <h4 className="product-name">{review.tenSanPham}</h4>
                  <p className="user-name">Bởi: {review.tenNguoiDung || 'Ẩn danh'}</p>
                </div>
                <div className="rating">
                  {renderStars(review.diem)}
                  <span className="rating-number">({review.diem}/5)</span>
                </div>
              </div>

              <div className="review-content">
                <p>{review.nhanXet}</p>
              </div>

              <div className="review-footer">
                <span className={`status-badge status-${review.trangThai}`}>
                  {review.trangThai === 1 ? '✓ Đã duyệt' : '⏱ Chờ duyệt'}
                </span>
                {review.ngayTao && (
                  <span className="review-date">
                    {new Date(review.ngayTao).toLocaleDateString('vi-VN')}
                  </span>
                )}
              </div>

              <div className="review-actions">
                {review.trangThai === 0 && (
                  <>
                    <button className="btn-approve" onClick={() => handleApprove(review.maDanhGia)}>
                      Duyệt
                    </button>
                    <button className="btn-reject" onClick={() => handleReject(review.maDanhGia)}>
                      Từ chối
                    </button>
                  </>
                )}
                <button className="btn-delete" onClick={() => handleDelete(review.maDanhGia)}>
                  Xóa
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-data">Không có đánh giá nào</div>
        )}
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
    </div>
  )
}

export default ReviewsTab
