import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { adminService } from "../services/api";
import "./Header.css";

interface DanhMuc {
  maDanhMuc: number;
  tenDanhMuc: string;
  moTa: string;
  maDanhMucCha?: number | null;
  trangThai?: boolean;
}

interface HeaderProps {
  onCartOpen?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onCartOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const { cart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [categoriesMenuOpen, setCategoriesMenuOpen] = useState(false);
  const [categories, setCategories] = useState<DanhMuc[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const data = await adminService.getAllCategories();
        setCategories(data || []);
      } catch (error) {
        console.error('Lỗi khi tải danh mục:', error);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const parentCategories = categories.filter(cat => !cat.maDanhMucCha && cat.trangThai !== false);
  const getChildCategories = (parentId: number) => 
    categories.filter(cat => cat.maDanhMucCha === parentId && cat.trangThai !== false);

  const cartItemCount = cart.reduce((sum, item) => sum + item.soLuong, 0);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
  };

  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <header className="modern-header">
      <div className="header-container">
        <div className="header-logo" onClick={() => navigate("/")}>
          <span className="logo-text">StepUp Shoes</span>
        </div>

        <nav className="header-nav desktop-nav">
          <a 
            href="/" 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); navigate('/'); }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            </svg>
            Trang chủ
          </a>
          
          <div 
            className="nav-dropdown"
            onMouseEnter={() => setCategoriesMenuOpen(true)}
            onMouseLeave={() => setCategoriesMenuOpen(false)}
          >
            <button className="nav-link dropdown-trigger">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
              Sản Phẩm
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="chevron">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            
            {categoriesMenuOpen && (
              <div className="categories-dropdown-menu">
                {loadingCategories ? (
                  <div className="dropdown-loading">
                    <div className="spinner-small"></div>
                    <span>Đang tải...</span>
                  </div>
                ) : parentCategories.length > 0 ? (
                  <div className="categories-grid">
                    {parentCategories.map(parent => {
                      const children = getChildCategories(parent.maDanhMuc);
                      return (
                        <div key={parent.maDanhMuc} className="category-group">
                          <div 
                            className="category-parent"
                            onClick={() => {
                              navigate(`/category/${parent.maDanhMuc}`);
                              setCategoriesMenuOpen(false);
                            }}
                          >
                            <h4>{parent.tenDanhMuc}</h4>
                            {parent.moTa && <p>{parent.moTa}</p>}
                          </div>
                          {children.length > 0 && (
                            <div className="category-children">
                              {children.map(child => (
                                <button
                                  key={child.maDanhMuc}
                                  className="category-child"
                                  onClick={() => {
                                    navigate(`/category/${child.maDanhMuc}`);
                                    setCategoriesMenuOpen(false);
                                  }}
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="9 18 15 12 9 6"/>
                                  </svg>
                                  {child.tenDanhMuc}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="dropdown-empty">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="7" height="7"/>
                      <rect x="14" y="3" width="7" height="7"/>
                    </svg>
                    <p>Chưa có danh mục nào</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          
          <a href="/about" className="nav-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            Về chúng tôi
          </a>
          <a href="/contact" className="nav-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Liên hệ
          </a>
        </nav>

        <div className="header-actions">
          <button 
            className="header-icon-btn cart-btn" 
            onClick={onCartOpen}
            title="Giỏ hàng"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            {cartItemCount > 0 && (
              <span className="cart-badge">{cartItemCount}</span>
            )}
          </button>

          {isAuthenticated && user ? (
            <div className="user-menu-container">
              <button 
                className="user-menu-btn"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="user-avatar">
                  {user.tenDangNhap?.charAt(0).toUpperCase()}
                </div>
                <span className="user-name-desktop">{user.tenDangNhap}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              {userMenuOpen && (
                <>
                  <div className="dropdown-overlay" onClick={() => setUserMenuOpen(false)} />
                  <div className="user-dropdown-menu">
                    <div className="user-dropdown-header">
                      <div className="user-avatar-large">
                        {user.tenDangNhap?.charAt(0).toUpperCase()}
                      </div>
                      <div className="user-info">
                        <div className="user-name-large">{user.tenDangNhap}</div>
                        <div className="user-role">
                          {user.vaiTro === 'quan_tri' ? 'Quản trị viên' : user.vaiTro === 'nhan_vien' ? 'Nhân viên' : 'Khách hàng'}
                        </div>
                      </div>
                    </div>
                    <div className="dropdown-divider" />
                    {(user.vaiTro === 'quan_tri' || user.vaiTro === 'nhan_vien') && (
                      <button 
                        className="dropdown-item"
                        onClick={() => {
                          navigate('/admin');
                          setUserMenuOpen(false);
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2"/>
                          <line x1="9" y1="3" x2="9" y2="21"/>
                        </svg>
                        {user.vaiTro === 'quan_tri' ? 'Quản trị' : 'Bán hàng'}
                      </button>
                    )}
                    <button 
                      className="dropdown-item"
                      onClick={() => {
                        navigate('/profile');
                        setUserMenuOpen(false);
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                      Thông tin cá nhân
                    </button>
                    <button 
                      className="dropdown-item"
                      onClick={() => {
                        navigate('/checkout');
                        setUserMenuOpen(false);
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                        <rect x="8" y="2" width="8" height="4" rx="1"/>
                      </svg>
                      Đơn hàng
                    </button>
                    <div className="dropdown-divider" />
                    <button className="dropdown-item logout-item" onClick={handleLogout}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                      Đăng xuất
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button 
              className="header-login-btn"
              onClick={() => navigate('/login')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
              Đăng nhập
            </button>
          )}

          <button 
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <line x1="3" y1="18" x2="21" y2="18"/>
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <>
          <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)} />
          <nav className="mobile-menu">
            <a 
              href="/" 
              className={`mobile-nav-link ${isActive('/') ? 'active' : ''}`}
              onClick={(e) => { 
                e.preventDefault(); 
                navigate('/'); 
                setMobileMenuOpen(false);
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              </svg>
              Trang chủ
            </a>
            
            {parentCategories.length > 0 && (
              <div className="mobile-categories-section">
                <div className="mobile-section-title">Danh mục</div>
                {parentCategories.map(parent => {
                  const children = getChildCategories(parent.maDanhMuc);
                  return (
                    <div key={parent.maDanhMuc} className="mobile-category-group">
                      <button
                        className="mobile-category-parent"
                        onClick={() => {
                          navigate(`/category/${parent.maDanhMuc}`);
                          setMobileMenuOpen(false);
                        }}
                      >
                        {parent.tenDanhMuc}
                      </button>
                      {children.length > 0 && (
                        <div className="mobile-category-children">
                          {children.map(child => (
                            <button
                              key={child.maDanhMuc}
                              className="mobile-category-child"
                              onClick={() => {
                                navigate(`/category/${child.maDanhMuc}`);
                                setMobileMenuOpen(false);
                              }}
                            >
                              {child.tenDanhMuc}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            
            <a 
              href="/#products" 
              className="mobile-nav-link"
              onClick={(e) => { 
                e.preventDefault(); 
                navigate('/#products'); 
                setMobileMenuOpen(false);
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
              Sản phẩm
            </a>
            <a 
              href="/#about" 
              className="mobile-nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              Về chúng tôi
            </a>
            <a 
              href="/#contact" 
              className="mobile-nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Liên hệ
            </a>
          </nav>
        </>
      )}
    </header>
  );
};
