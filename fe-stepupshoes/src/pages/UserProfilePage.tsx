import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';
import { useToast } from '../context/ToastContext';
import './UserProfilePage.css';

interface UserProfile {
  maNguoiDung: number;
  tenDangNhap: string;
  email: string;
  hoTen: string;
  soDienThoai: string;
  diaChi: string;
  ngayTao: string;
}

interface Order {
  maDonHang: number;
  tongTien: number;
  phiVanChuyen: number;
  giamGia: number;
  thanhTien: number;
  trangThaiDonHang: string;
  trangThaiThanhToan: string;
  phuongThucThanhToan: string;
  diaChiGiaoHang: string;
  nguoiNhan: string;
  soDienThoaiNhan: string;
  ngayDatHang: string;
  chiTietDonHangs: OrderDetail[];
}

interface OrderDetail {
  maChiTietDonHang: number;
  tenSanPham: string;
  mauSac: string;
  size: string;
  soLuong: number;
  donGia: number;
  thanhTien: number;
  hinhAnhChinh: string;
}

interface UserStats {
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  processingOrders: number;
  totalSpent: number;
}

const UserProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'stats'>('profile');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderFilter, setOrderFilter] = useState<string>('');
  const [editForm, setEditForm] = useState({
    hoTen: '',
    email: '',
    soDienThoai: '',
    diaChi: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const [profileData, ordersData, statsData] = await Promise.all([
        userService.getUserProfile(user.maNguoiDung),
        userService.getUserOrders(user.maNguoiDung),
        userService.getUserStats(user.maNguoiDung),
      ]);
      
      setProfile(profileData);
      setOrders(ordersData);
      setStats(statsData);
      
      setEditForm({
        hoTen: profileData.hoTen || '',
        email: profileData.email || '',
        soDienThoai: profileData.soDienThoai || '',
        diaChi: profileData.diaChi || '',
      });
    } catch (error) {
      showToast('Lỗi khi tải thông tin người dùng', 'error');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const updatedProfile = await userService.updateUserProfile(user.maNguoiDung, editForm);
      setProfile(updatedProfile);
      setIsEditing(false);
      showToast('Cập nhật thông tin thành công', 'success');
    } catch (error) {
      showToast('Lỗi khi cập nhật thông tin', 'error');
      console.error(error);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('Mật khẩu xác nhận không khớp', 'error');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showToast('Mật khẩu mới phải có ít nhất 6 ký tự', 'error');
      return;
    }

    try {
      await userService.changePassword(
        user.maNguoiDung,
        passwordForm.oldPassword,
        passwordForm.newPassword
      );
      showToast('Đổi mật khẩu thành công', 'success');
      setShowPasswordForm(false);
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Lỗi khi đổi mật khẩu', 'error');
    }
  };

  const loadFilteredOrders = async (status: string) => {
    if (!user) return;
    
    try {
      const ordersData = await userService.getUserOrders(user.maNguoiDung, status);
      setOrders(ordersData);
      setOrderFilter(status);
    } catch (error) {
      showToast('Lỗi khi tải đơn hàng', 'error');
    }
  };

  const getStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
      'dat_hang': 'Đặt hàng',
      'xac_nhan': 'Đã xác nhận',
      'dang_giao': 'Đang giao',
      'hoan_thanh': 'Hoàn thành',
      'huy': 'Đã hủy',
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status: string): string => {
    const classMap: Record<string, string> = {
      'dat_hang': 'status-pending',
      'xac_nhan': 'status-confirmed',
      'dang_giao': 'status-shipping',
      'hoan_thanh': 'status-completed',
      'huy': 'status-cancelled',
    };
    return classMap[status] || '';
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!user) {
    return (
      <div className="user-profile-page">
        <div className="not-logged-in">
          <h2>Bạn chưa đăng nhập</h2>
          <p>Vui lòng đăng nhập để xem thông tin cá nhân</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="user-profile-page">
        <div className="loading">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="user-profile-page">
      <div className="profile-container">
        <div className="profile-sidebar">
          <div className="user-info-card">
            <div className="user-avatar">
              <span>{profile?.hoTen?.charAt(0).toUpperCase() || 'U'}</span>
            </div>
            <h3>{profile?.hoTen || 'Người dùng'}</h3>
            <p className="user-email">{profile?.email}</p>
          </div>

          <nav className="profile-nav">
            <button
              className={activeTab === 'profile' ? 'active' : ''}
              onClick={() => setActiveTab('profile')}
            >
              Thông tin cá nhân
            </button>
            <button
              className={activeTab === 'orders' ? 'active' : ''}
              onClick={() => setActiveTab('orders')}
            >
              Đơn hàng của tôi
            </button>
            <button
              className={activeTab === 'stats' ? 'active' : ''}
              onClick={() => setActiveTab('stats')}
            >
              Thống kê
            </button>
          </nav>
        </div>

        <div className="profile-content">
          {activeTab === 'profile' && (
            <div className="profile-tab">
              <div className="tab-header">
                <h2>Thông tin cá nhân</h2>
                {!isEditing && (
                  <button className="btn-edit" onClick={() => setIsEditing(true)}>
                    Chỉnh sửa
                  </button>
                )}
              </div>

              {!isEditing ? (
                <div className="profile-info">
                  <div className="info-group">
                    <label>Họ tên:</label>
                    <p>{profile?.hoTen || 'Chưa cập nhật'}</p>
                  </div>
                  <div className="info-group">
                    <label>Email:</label>
                    <p>{profile?.email || 'Chưa cập nhật'}</p>
                  </div>
                  <div className="info-group">
                    <label>Số điện thoại:</label>
                    <p>{profile?.soDienThoai || 'Chưa cập nhật'}</p>
                  </div>
                  <div className="info-group">
                    <label>Địa chỉ:</label>
                    <p>{profile?.diaChi || 'Chưa cập nhật'}</p>
                  </div>
                  <div className="info-group">
                    <label>Tên đăng nhập:</label>
                    <p>{profile?.tenDangNhap}</p>
                  </div>
                  <div className="info-group">
                    <label>Ngày tạo tài khoản:</label>
                    <p>{profile?.ngayTao ? formatDate(profile.ngayTao) : 'N/A'}</p>
                  </div>

                  <button 
                    className="btn-change-password"
                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                  >
                    {showPasswordForm ? 'Hủy đổi mật khẩu' : 'Đổi mật khẩu'}
                  </button>

                  {showPasswordForm && (
                    <form onSubmit={handlePasswordChange} className="password-form">
                      <h3>Đổi mật khẩu</h3>
                      <div className="form-group">
                        <label>Mật khẩu cũ:</label>
                        <input
                          type="password"
                          value={passwordForm.oldPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, oldPassword: e.target.value})}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Mật khẩu mới:</label>
                        <input
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Xác nhận mật khẩu mới:</label>
                        <input
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                          required
                        />
                      </div>
                      <button type="submit" className="btn-submit">Đổi mật khẩu</button>
                    </form>
                  )}
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} className="profile-form">
                  <div className="form-group">
                    <label>Họ tên:</label>
                    <input
                      type="text"
                      value={editForm.hoTen}
                      onChange={(e) => setEditForm({...editForm, hoTen: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email:</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Số điện thoại:</label>
                    <input
                      type="tel"
                      value={editForm.soDienThoai}
                      onChange={(e) => setEditForm({...editForm, soDienThoai: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Địa chỉ:</label>
                    <textarea
                      value={editForm.diaChi}
                      onChange={(e) => setEditForm({...editForm, diaChi: e.target.value})}
                      rows={3}
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn-submit">Lưu thay đổi</button>
                    <button 
                      type="button" 
                      className="btn-cancel"
                      onClick={() => {
                        setIsEditing(false);
                        setEditForm({
                          hoTen: profile?.hoTen || '',
                          email: profile?.email || '',
                          soDienThoai: profile?.soDienThoai || '',
                          diaChi: profile?.diaChi || '',
                        });
                      }}
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="orders-tab">
              <div className="tab-header">
                <h2>Đơn hàng của tôi</h2>
              </div>

              <div className="order-filters">
                <button 
                  className={orderFilter === '' ? 'active' : ''}
                  onClick={() => loadFilteredOrders('')}
                >
                  Tất cả
                </button>
                <button 
                  className={orderFilter === 'dat_hang' ? 'active' : ''}
                  onClick={() => loadFilteredOrders('dat_hang')}
                >
                  Đặt hàng
                </button>
                <button 
                  className={orderFilter === 'xac_nhan' ? 'active' : ''}
                  onClick={() => loadFilteredOrders('xac_nhan')}
                >
                  Đã xác nhận
                </button>
                <button 
                  className={orderFilter === 'dang_giao' ? 'active' : ''}
                  onClick={() => loadFilteredOrders('dang_giao')}
                >
                  Đang giao
                </button>
                <button 
                  className={orderFilter === 'hoan_thanh' ? 'active' : ''}
                  onClick={() => loadFilteredOrders('hoan_thanh')}
                >
                  Hoàn thành
                </button>
                <button 
                  className={orderFilter === 'huy' ? 'active' : ''}
                  onClick={() => loadFilteredOrders('huy')}
                >
                  Đã hủy
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="empty-orders">
                  <p>Bạn chưa có đơn hàng nào</p>
                </div>
              ) : (
                <div className="orders-list">
                  {orders.map((order) => (
                    <div key={order.maDonHang} className="order-card">
                      <div className="order-header">
                        <div className="order-id">
                          Đơn hàng #{order.maDonHang}
                        </div>
                        <div className={`order-status ${getStatusClass(order.trangThaiDonHang)}`}>
                          {getStatusText(order.trangThaiDonHang)}
                        </div>
                      </div>

                      <div className="order-info">
                        <p><strong>Ngày đặt:</strong> {formatDate(order.ngayDatHang)}</p>
                        <p><strong>Người nhận:</strong> {order.nguoiNhan}</p>
                        <p><strong>SĐT:</strong> {order.soDienThoaiNhan}</p>
                        <p><strong>Địa chỉ:</strong> {order.diaChiGiaoHang}</p>
                        <p><strong>Thanh toán:</strong> {order.phuongThucThanhToan}</p>
                      </div>

                      <div className="order-items">
                        {order.chiTietDonHangs?.map((item) => (
                          <div key={item.maChiTietDonHang} className="order-item">
                            <img 
                              src={item.hinhAnhChinh || '/placeholder.png'} 
                              alt={item.tenSanPham}
                              onError={(e) => {
                                e.currentTarget.src = '/placeholder.png';
                              }}
                            />
                            <div className="item-info">
                              <h4>{item.tenSanPham}</h4>
                              <p>Màu: {item.mauSac} | Size: {item.size}</p>
                              <p>Số lượng: {item.soLuong}</p>
                            </div>
                            <div className="item-price">
                              {formatCurrency(item.thanhTien)}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="order-total">
                        <div className="total-row">
                          <span>Tổng tiền hàng:</span>
                          <span>{formatCurrency(order.tongTien)}</span>
                        </div>
                        <div className="total-row">
                          <span>Phí vận chuyển:</span>
                          <span>{formatCurrency(order.phiVanChuyen)}</span>
                        </div>
                        {order.giamGia > 0 && (
                          <div className="total-row discount">
                            <span>Giảm giá:</span>
                            <span>-{formatCurrency(order.giamGia)}</span>
                          </div>
                        )}
                        <div className="total-row final">
                          <span>Thành tiền:</span>
                          <span>{formatCurrency(order.thanhTien)}</span>
                        </div>
                      </div>

                      <div className="order-actions">
                        <button 
                          className="btn-detail"
                          onClick={() => setSelectedOrder(order)}
                        >
                          Chi tiết
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'stats' && stats && (
            <div className="stats-tab">
              <div className="tab-header">
                <h2>Thống kê đơn hàng</h2>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-info">
                    <h3>{stats.totalOrders}</h3>
                    <p>Tổng đơn hàng</p>
                  </div>
                </div>

                <div className="stat-card completed">
                  <div className="stat-info">
                    <h3>{stats.completedOrders}</h3>
                    <p>Đã hoàn thành</p>
                  </div>
                </div>

                <div className="stat-card processing">
                  <div className="stat-info">
                    <h3>{stats.processingOrders}</h3>
                    <p>Đang xử lý</p>
                  </div>
                </div>

                <div className="stat-card cancelled">
                  <div className="stat-info">
                    <h3>{stats.cancelledOrders}</h3>
                    <p>Đã hủy</p>
                  </div>
                </div>

                <div className="stat-card total-spent">
                  <div className="stat-info">
                    <h3>{formatCurrency(stats.totalSpent)}</h3>
                    <p>Tổng chi tiêu</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedOrder && (
        <div className="order-modal" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chi tiết đơn hàng #{selectedOrder.maDonHang}</h2>
              <button className="btn-close" onClick={() => setSelectedOrder(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="order-detail-info">
                <h3>Thông tin đơn hàng</h3>
                <p><strong>Ngày đặt:</strong> {formatDate(selectedOrder.ngayDatHang)}</p>
                <p><strong>Trạng thái:</strong> <span className={`status-badge ${getStatusClass(selectedOrder.trangThaiDonHang)}`}>{getStatusText(selectedOrder.trangThaiDonHang)}</span></p>
                <p><strong>Thanh toán:</strong> {selectedOrder.phuongThucThanhToan}</p>
                <p><strong>Trạng thái thanh toán:</strong> {selectedOrder.trangThaiThanhToan}</p>
              </div>

              <div className="order-detail-info">
                <h3>Thông tin người nhận</h3>
                <p><strong>Người nhận:</strong> {selectedOrder.nguoiNhan}</p>
                <p><strong>Số điện thoại:</strong> {selectedOrder.soDienThoaiNhan}</p>
                <p><strong>Địa chỉ:</strong> {selectedOrder.diaChiGiaoHang}</p>
              </div>

              <div className="order-detail-items">
                <h3>Sản phẩm</h3>
                {selectedOrder.chiTietDonHangs?.map((item) => (
                  <div key={item.maChiTietDonHang} className="detail-item">
                    <img src={item.hinhAnhChinh || '/placeholder.png'} alt={item.tenSanPham} />
                    <div className="detail-item-info">
                      <h4>{item.tenSanPham}</h4>
                      <p>Màu: {item.mauSac} | Size: {item.size}</p>
                      <p>Đơn giá: {formatCurrency(item.donGia)} x {item.soLuong}</p>
                    </div>
                    <div className="detail-item-price">
                      {formatCurrency(item.thanhTien)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-detail-total">
                <div className="total-row">
                  <span>Tổng tiền hàng:</span>
                  <span>{formatCurrency(selectedOrder.tongTien)}</span>
                </div>
                <div className="total-row">
                  <span>Phí vận chuyển:</span>
                  <span>{formatCurrency(selectedOrder.phiVanChuyen)}</span>
                </div>
                {selectedOrder.giamGia > 0 && (
                  <div className="total-row discount">
                    <span>Giảm giá:</span>
                    <span>-{formatCurrency(selectedOrder.giamGia)}</span>
                  </div>
                )}
                <div className="total-row final">
                  <span>Thành tiền:</span>
                  <span>{formatCurrency(selectedOrder.thanhTien)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;
