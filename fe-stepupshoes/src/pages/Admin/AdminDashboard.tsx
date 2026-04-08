import { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom'
import "./AdminDashboard.css";
import { useAuth } from "../../context/AuthContext";
import StatisticsTab from "./StatisticsTab";
import UsersTab from "./UsersTab";
import OrdersTab from "./OrdersTab";
import VouchersTab from "./VouchersTab";
import ReviewsTab from "./ReviewsTab";
import CounterOrderTab from "./CounterOrderTab";
import DanhMucTab from "./DanhMucTab";
import ProductsTab from "./ProductsTab";
import ShippingTab from "./ShippingTab";

type TabType =
  | "statistics"
  | "users"
  | "orders"
  | "vouchers"
  | "reviews"
  | "counter-order"
  | "danhmuc"
  | "products"
  | "shipping";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const isAdmin = user?.vaiTro === 'quan_tri';
  const isEmployee = user?.vaiTro === 'nhan_vien';

  const [activeTab, setActiveTab] = useState<TabType>(isEmployee ? "counter-order" : "products");

  const location = useLocation()

  useEffect(() => {
    if (isEmployee && !["counter-order", "orders", "products", "users"].includes(activeTab)) {
      setActiveTab("counter-order");
    }
  }, [user?.vaiTro, activeTab, isEmployee]);

  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search)
      const tabFromQuery = params.get('tab') as TabType | null
      const validTabs: TabType[] = [
        'statistics','users','orders','vouchers','reviews','counter-order','danhmuc','products','shipping'
      ]
      if (tabFromQuery && validTabs.includes(tabFromQuery) && hasAccessToTab(tabFromQuery)) {
        setActiveTab(tabFromQuery)
      }
    } catch (e) {
    }
  }, [location.search])

  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search)
      if (params.get('tab') !== activeTab) {
        params.set('tab', activeTab)
        const newUrl = location.pathname + (params.toString() ? `?${params.toString()}` : '')
        window.history.replaceState(null, '', newUrl)
      }
    } catch (e) {
    }
  }, [activeTab, location.pathname, location.search])

  const handleLogout = () => {
    logout();
  };

  const hasAccessToTab = (tab: TabType): boolean => {
    if (isAdmin) return true; 
    if (isEmployee) {
      return ["counter-order", "orders", "products", "users"].includes(tab);
    }
    return false;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "statistics":
        return <StatisticsTab />;
      case "users":
        return <UsersTab />;
      case "orders":
        return <OrdersTab />;
      case "vouchers":
        return <VouchersTab />;
      case "reviews":
        return <ReviewsTab />;
      case "counter-order":
        return <CounterOrderTab />;
      case "shipping":
        return <ShippingTab />;
      case "danhmuc":
        return <DanhMucTab />;
      case "products":
        return <ProductsTab readOnly={isEmployee} />;
      default:
        return <ProductsTab />;
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-top">
          <h1>{isAdmin ? 'Admin Dashboard' : 'Bán hàng'}</h1>
          <div className="admin-user-info">
            <span className="user-name">{user?.tenDangNhap}</span>
            <span className="user-role-badge">
              {isAdmin ? 'Quản trị viên' : 'Nhân viên'}
            </span>
            <button onClick={handleLogout} className="logout-btn">
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <div className="admin-container">
        <nav className="admin-sidebar">
          <ul className="nav-menu">
            {hasAccessToTab("products") && (
              <li>
                <button
                  className={`nav-btn ${activeTab === "products" ? "active" : ""}`}
                  onClick={() => setActiveTab("products")}
                >
                  Quản lý sản phẩm
                </button>
              </li>
            )}
            {hasAccessToTab("counter-order") && (
              <li>
                <button
                  className={`nav-btn ${activeTab === "counter-order" ? "active" : ""}`}
                  onClick={() => setActiveTab("counter-order")}
                >
                  Đơn hàng tại quầy
                </button>
              </li>
            )}
            {hasAccessToTab("orders") && (
              <li>
                <button
                  className={`nav-btn ${activeTab === "orders" ? "active" : ""}`}
                  onClick={() => setActiveTab("orders")}
                >
                  Quản lý đơn hàng
                </button>
              </li>
            )}
            {hasAccessToTab("statistics") && (
              <li>
                <button
                  className={`nav-btn ${activeTab === "statistics" ? "active" : ""}`}
                  onClick={() => setActiveTab("statistics")}
                >
                  Thống kê
                </button>
              </li>
            )}
            {hasAccessToTab("users") && (
              <li>
                <button
                  className={`nav-btn ${activeTab === "users" ? "active" : ""}`}
                  onClick={() => setActiveTab("users")}
                >
                  Quản lý người dùng
                </button>
              </li>
            )}
            {hasAccessToTab("danhmuc") && (
              <li>
                <button
                  className={`nav-btn ${activeTab === "danhmuc" ? "active" : ""}`}
                  onClick={() => setActiveTab("danhmuc")}
                >
                  Quản lý danh mục
                </button>
              </li>
            )}
            {hasAccessToTab("vouchers") && (
              <li>
                <button
                  className={`nav-btn ${activeTab === "vouchers" ? "active" : ""}`}
                  onClick={() => setActiveTab("vouchers")}
                >
                  Quản lý voucher
                </button>
              </li>
            )}
            {hasAccessToTab("shipping") && (
              <li>
                <button
                  className={`nav-btn ${activeTab === "shipping" ? "active" : ""}`}
                  onClick={() => setActiveTab("shipping")}
                >
                  Quản lý phí ship
                </button>
              </li>
            )}
            {/* {hasAccessToTab("reviews") && (
              <li>
                <button
                  className={`nav-btn ${activeTab === "reviews" ? "active" : ""}`}
                  onClick={() => setActiveTab("reviews")}
                >
                  Quản lý đánh giá
                </button>
              </li>
            )} */}
          </ul>
        </nav>

        <main className="admin-content">{renderTabContent()}</main>
      </div>
    </div>
  );
};

export default AdminDashboard;
