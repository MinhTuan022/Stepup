import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
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
  maTinh?: string;
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
  lyDoYeuCauHuy?: string;
  ngayYeuCauHuy?: string;
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
  const location = useLocation();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'stats'>('profile');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelingOrderId, setCancelingOrderId] = useState<number | null>(null);
  const [orderFilter, setOrderFilter] = useState<string>('');
  const [editForm, setEditForm] = useState({
    hoTen: '',
    email: '',
    soDienThoai: '',
    diaChi: '',
    maTinh: '',
  });
  const [shippingRegions, setShippingRegions] = useState<Array<any>>([]);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});

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
    // load shipping regions for select
    let mounted = true
    const loadRegions = async () => {
      try {
        const regions = await userService.getShippingRegions()
        if (!mounted) return
        setShippingRegions(regions || [])
      } catch (err) {
        console.warn('Could not load shipping regions:', err)
      }
    }
    loadRegions()
    return () => { mounted = false }
  }, [user]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabFromQuery = params.get('tab');
    const tabFromNav = (location.state as any)?.tab;
    const validTabs = ['orders', 'profile', 'stats'];
    if (tabFromQuery && validTabs.includes(tabFromQuery)) {
      setActiveTab(tabFromQuery as any);
    } else if (tabFromNav && validTabs.includes(tabFromNav)) {
      setActiveTab(tabFromNav);
    }
  }, [location.state]);

  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      if (params.get('tab') !== activeTab) {
        params.set('tab', activeTab);
        const newUrl = location.pathname + (params.toString() ? `?${params.toString()}` : '');
        window.history.replaceState(null, '', newUrl);
      }
    } catch (e) {
    }
  }, [activeTab, location.pathname, location.search]);

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
        maTinh: profileData.regionCode || '',
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

    const errs: Record<string, string> = {};
    if (!editForm.hoTen.trim()) errs.hoTen = 'Vui lòng nhập họ tên';
    if (!editForm.email.trim()) {
      errs.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email.trim())) {
      errs.email = 'Email không hợp lệ';
    }
    if (editForm.soDienThoai && !/^(0[0-9]{9})$/.test(editForm.soDienThoai.trim())) {
      errs.soDienThoai = 'Số điện thoại phải gồm 10 chữ số, bắt đầu bằng 0';
    }
    setProfileErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      const payload = {
        hoTen: editForm.hoTen,
        email: editForm.email,
        soDienThoai: editForm.soDienThoai,
        diaChi: editForm.diaChi,
        maTinh: editForm.maTinh || undefined,
      };
      const updatedProfile = await userService.updateUserProfile(user.maNguoiDung, payload);
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
      'cho_xac_nhan': 'Chờ xác nhận',
      'chuan_bi_hang': 'Chuẩn bị hàng',
      'yeu_cau_huy': 'Yêu cầu hủy',
      'dang_giao_hang': 'Đang giao',
      'da_giao_hang': 'Đã giao',
      'nhan_thanh_cong': 'Nhận thành công',
      'hoan_thanh': 'Hoàn thành',
      'huy': 'Đã hủy',
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status: string): string => {
    const classMap: Record<string, string> = {
      'cho_xac_nhan': 'status-pending',
      'chuan_bi_hang': 'status-preparing',
      'yeu_cau_huy': 'status-request-cancel',
      'dang_giao_hang': 'status-shipping',
      'da_giao_hang': 'status-delivered',
      'nhan_thanh_cong': 'status-received',
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
                    <label>Tỉnh / Thành (mặc định giao hàng):</label>
                    <p>{(() => {
                      const code = (profile?.maTinh || profile?.maTinh || '').toString().trim().toUpperCase();
                      if (!code) return 'Chưa cập nhật';
                      const found = shippingRegions.find(r => ((r.maTinh || r.code) || '').toString().toUpperCase() === code);
                      return found ? (found.tenTinh || found.name || code) : code;
                    })()}</p>
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
                    <form onSubmit={handlePasswordChange} className="password-form" noValidate>
                      <h3>Đổi mật khẩu</h3>
                      <div className="form-group">
                        <label>Mật khẩu cũ:</label>
                        <input
                          type="password"
                          value={passwordForm.oldPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, oldPassword: e.target.value})}
                        />
                      </div>
                      <div className="form-group">
                        <label>Mật khẩu mới:</label>
                        <input
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                        />
                      </div>
                      <div className="form-group">
                        <label>Xác nhận mật khẩu mới:</label>
                        <input
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                        />
                      </div>
                      <button type="submit" className="btn-submit">Đổi mật khẩu</button>
                    </form>
                  )}
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} className="profile-form" noValidate>
                  <div className="form-group">
                    <label>Họ tên:</label>
                    <input
                      type="text"
                      value={editForm.hoTen}
                      onChange={(e) => { setEditForm({...editForm, hoTen: e.target.value}); setProfileErrors(prev => ({ ...prev, hoTen: '' })); }}
                      className={profileErrors.hoTen ? 'input-error' : ''}
                    />
                    {profileErrors.hoTen && <span className="field-error">{profileErrors.hoTen}</span>}
                  </div>
                  <div className="form-group">
                    <label>Email:</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => { setEditForm({...editForm, email: e.target.value}); setProfileErrors(prev => ({ ...prev, email: '' })); }}
                      className={profileErrors.email ? 'input-error' : ''}
                    />
                    {profileErrors.email && <span className="field-error">{profileErrors.email}</span>}
                  </div>
                  <div className="form-group">
                    <label>Số điện thoại:</label>
                    <input
                      type="tel"
                      value={editForm.soDienThoai}
                      onChange={(e) => { setEditForm({...editForm, soDienThoai: e.target.value}); setProfileErrors(prev => ({ ...prev, soDienThoai: '' })); }}
                      className={profileErrors.soDienThoai ? 'input-error' : ''}
                    />
                    {profileErrors.soDienThoai && <span className="field-error">{profileErrors.soDienThoai}</span>}
                  </div>
                  <div className="form-group">
                    <label>Địa chỉ:</label>
                    <textarea
                      value={editForm.diaChi}
                      onChange={(e) => setEditForm({...editForm, diaChi: e.target.value})}
                      rows={3}
                    />
                  </div>
                  <div className="form-group">
                    <label>Tỉnh / Thành (mặc định giao hàng)</label>
                    <select value={editForm.maTinh} onChange={(e) => setEditForm({...editForm, maTinh: e.target.value})}>
                      <option value="">-- Chọn tỉnh/thành --</option>
                      {shippingRegions.map(r => (
                        <option key={r.maTinh || r.code} value={r.maTinh || r.code}>{r.tenTinh || r.name} ({r.maTinh || r.code})</option>
                      ))}
                    </select>
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
                          maTinh: profile?.maTinh || '',
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
                  className={orderFilter === 'cho_xac_nhan' ? 'active' : ''}
                  onClick={() => loadFilteredOrders('cho_xac_nhan')}
                >
                  Chờ xác nhận
                </button>
                <button 
                  className={orderFilter === 'chuan_bi_hang' ? 'active' : ''}
                  onClick={() => loadFilteredOrders('chuan_bi_hang')}
                >
                  Chuẩn bị hàng
                </button>
                <button 
                  className={orderFilter === 'yeu_cau_huy' ? 'active' : ''}
                  onClick={() => loadFilteredOrders('yeu_cau_huy')}
                >
                  Yêu cầu hủy
                </button>
                <button 
                  className={orderFilter === 'dang_giao_hang' ? 'active' : ''}
                  onClick={() => loadFilteredOrders('dang_giao_hang')}
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
                        {order.trangThaiDonHang === 'cho_xac_nhan' && (
                          <button
                            className="btn-cancel"
                            onClick={async () => {
                              if (!user) return;
                              if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
                              try {
                                await userService.cancelOrder(user.maNguoiDung, order.maDonHang);
                                showToast('Hủy đơn hàng thành công', 'success');
                                loadFilteredOrders(orderFilter);
                              } catch (err) {
                                showToast(err instanceof Error ? err.message : 'Lỗi khi hủy đơn', 'error');
                              }
                            }}
                          >
                            Hủy đơn
                          </button>
                        )}
                        {order.trangThaiDonHang === 'chuan_bi_hang' && (
                          <button
                            className="btn-cancel-request"
                            onClick={() => {
                              setCancelingOrderId(order.maDonHang);
                              setCancelReason('');
                              setShowCancelModal(true);
                            }}
                          >
                            Yêu cầu hủy
                          </button>
                        )}
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
                {selectedOrder.lyDoYeuCauHuy && (
                  <p><strong>Lý do yêu cầu hủy:</strong> {selectedOrder.lyDoYeuCauHuy} {selectedOrder.ngayYeuCauHuy ? <span>— {formatDate(selectedOrder.ngayYeuCauHuy)}</span> : null}</p>
                )}
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
      {showCancelModal && (
        <div className="order-modal" onClick={() => setShowCancelModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Yêu cầu hủy đơn #{cancelingOrderId}</h2>
              <button className="btn-close" onClick={() => setShowCancelModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Lý do hủy (tùy chọn):</label>
                <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} rows={4} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowCancelModal(false)}>Đóng</button>
              <button
                className="btn-submit"
                              onClick={async () => {
                                if (!user || !cancelingOrderId) return;
                                try {
                                  await userService.cancelOrder(user.maNguoiDung, cancelingOrderId, cancelReason || undefined);
                                  showToast('Yêu cầu hủy đã được gửi', 'success');
                                  setShowCancelModal(false);
                                  setCancelReason('');
                                  setCancelingOrderId(null);
                                  // switch to "Yêu cầu hủy" filter so the order remains visible to the customer
                                  setOrderFilter('yeu_cau_huy');
                                  loadFilteredOrders('yeu_cau_huy');
                                } catch (err) {
                                  showToast(err instanceof Error ? err.message : 'Lỗi khi gửi yêu cầu hủy', 'error');
                                }
                              }}
              >
                Gửi yêu cầu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;
