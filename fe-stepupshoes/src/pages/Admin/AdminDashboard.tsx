import { useState } from "react";
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

type TabType =
  | "statistics"
  | "users"
  | "orders"
  | "vouchers"
  | "reviews"
  | "counter-order"
  | "danhmuc"
  | "products";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<TabType>("products");
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
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
      case "danhmuc":
        return <DanhMucTab />;
      case "products":
        return <ProductsTab />;
      default:
        return <ProductsTab />;
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-top">
          <h1>Admin Dashboard</h1>
          <div className="admin-user-info">
            <span className="user-name">{user?.tenDangNhap}</span>
            <button onClick={handleLogout} className="logout-btn">
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <div className="admin-container">
        <nav className="admin-sidebar">
          <ul className="nav-menu">
            <li>
              <button
                className={`nav-btn ${activeTab === "products" ? "active" : ""}`}
                onClick={() => setActiveTab("products")}
              >
                Quản lý sản phẩm
              </button>
            </li>
            {/* <li>
              <button
                className={`nav-btn ${activeTab === "statistics" ? "active" : ""}`}
                onClick={() => setActiveTab("statistics")}
              >
                Thống kê
              </button>
            </li> */}
            <li>
              <button
                className={`nav-btn ${activeTab === "users" ? "active" : ""}`}
                onClick={() => setActiveTab("users")}
              >
                Quản lý người dùng
              </button>
            </li>
            {/* <li>
              <button
                className={`nav-btn ${activeTab === "orders" ? "active" : ""}`}
                onClick={() => setActiveTab("orders")}
              >
                Quản lý đơn hàng
              </button>
            </li> */}
            {/* <li>
              <button
                className={`nav-btn ${activeTab === "counter-order" ? "active" : ""}`}
                onClick={() => setActiveTab("counter-order")}
              >
                Đơn hàng tại quầy
              </button>
            </li> */}
            <li>
              <button
                className={`nav-btn ${activeTab === "danhmuc" ? "active" : ""}`}
                onClick={() => setActiveTab("danhmuc")}
              >
                Quản lý danh mục
              </button>
            </li>
            {/* <li>
              <button
                className={`nav-btn ${activeTab === "vouchers" ? "active" : ""}`}
                onClick={() => setActiveTab("vouchers")}
              >
                Quản lý voucher
              </button>
            </li>
            <li>
              <button
                className={`nav-btn ${activeTab === "reviews" ? "active" : ""}`}
                onClick={() => setActiveTab("reviews")}
              >
                Quản lý đánh giá
              </button>
            </li> */}
          </ul>
        </nav>

        <main className="admin-content">{renderTabContent()}</main>
      </div>
    </div>
  );
};

export default AdminDashboard;
