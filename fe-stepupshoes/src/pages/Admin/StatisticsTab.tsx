import { useState, useEffect } from 'react'
import { adminService } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import './StatisticsTab.css'

const StatisticsTab = () => {
  const { showToast } = useToast()
  const [stats, setStats] = useState<any>(null)
  const [revenueStats, setRevenueStats] = useState<any>(null)
  const [topProducts, setTopProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState({
    fromDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    fetchStatistics()
  }, [])

  useEffect(() => {
    fetchRevenueStats()
  }, [dateRange])

  const fetchStatistics = async () => {
    try {
      setLoading(true)
      setError(null)
      const [statsData, productsData] = await Promise.all([
        adminService.getStatistics(),
        adminService.getTopProducts(10),
      ])
      setStats(statsData)
      setTopProducts(productsData || [])
      showToast('Tải thống kê thành công', 'success')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu'
      setError(message)
      showToast(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchRevenueStats = async () => {
    try {
      const data = await adminService.getRevenueStats(dateRange.fromDate, dateRange.toDate)
      setRevenueStats(data)
      showToast('Tải doanh thu thành công', 'success')
    } catch (err) {
      console.error(err)
      showToast('Lỗi khi tải doanh thu', 'error')
    }
  }

  if (loading) return <div className="loading">Đang tải dữ liệu...</div>
  if (error) return <div className="error">Lỗi: {error}</div>

  return (
    <div className="statistics-tab">
      <h2>Thống kê tổng quan</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <h3>Tổng người dùng</h3>
            <p className="stat-value">{stats?.totalUsers || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <h3>Tổng đơn hàng</h3>
            <p className="stat-value">{stats?.totalOrders || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <h3>Tổng sản phẩm</h3>
            <p className="stat-value">{stats?.totalProducts || 0}</p>
          </div>
        </div>

        <div className="stat-card highlight">
          <div className="stat-content">
            <h3>Tổng doanh thu</h3>
            <p className="stat-value">
              {(stats?.totalRevenue || 0).toLocaleString('vi-VN')} ₫
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <h3>Đơn hàng tháng này</h3>
            <p className="stat-value">{stats?.ordersThisMonth || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <h3>Sản phẩm hoạt động</h3>
            <p className="stat-value">{stats?.activeProducts || 0}</p>
          </div>
        </div>
      </div>

      <div className="revenue-section">
        <h3>Doanh thu theo khoảng thời gian</h3>
        <div className="date-range">
          <div className="date-input-group">
            <label>Từ ngày:</label>
            <input
              type="date"
              value={dateRange.fromDate}
              onChange={(e) => setDateRange({ ...dateRange, fromDate: e.target.value })}
            />
          </div>
          <div className="date-input-group">
            <label>Đến ngày:</label>
            <input
              type="date"
              value={dateRange.toDate}
              onChange={(e) => setDateRange({ ...dateRange, toDate: e.target.value })}
            />
          </div>
        </div>

        {revenueStats && (
          <div className="revenue-stats">
            <div className="revenue-card">
              <h4>Tổng doanh thu</h4>
              <p className="revenue-value">
                {(revenueStats?.totalRevenue || 0).toLocaleString('vi-VN')} ₫
              </p>
            </div>
            <div className="revenue-card">
              <h4>Số đơn hàng</h4>
              <p className="revenue-value">{revenueStats?.totalOrders || 0}</p>
            </div>
          </div>
        )}

        {revenueStats?.revenueByStatus && (
          <div className="status-breakdown">
            <h4>Doanh thu theo trạng thái</h4>
            <ul>
              {Object.entries(revenueStats.revenueByStatus).map(([status, amount]: any) => (
                <li key={status}>
                  <span className="status-name">{status}</span>
                  <span className="status-amount">
                    {typeof amount === 'number' ? amount.toLocaleString('vi-VN') : amount} ₫
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="top-products-section">
        <h3>Sản phẩm bán chạy nhất</h3>
        {topProducts.length > 0 ? (
          <table className="products-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên sản phẩm</th>
                <th>Số lượng bán</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product: any, index: number) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{product.tenSanPham || product.name}</td>
                  <td className="quantity">{product.soLuongBan || product.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-data">Chưa có dữ liệu sản phẩm bán chạy</p>
        )}
      </div>
    </div>
  )
}

export default StatisticsTab
