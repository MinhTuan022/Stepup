import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { adminService } from "../services/api";
import "./HomePage.css";

interface ProductDetail {
  maChiTiet?: number;
  maSKU: string;
  mauSac: string;
  size: string;
  giaBan: number;
  soLuongTon: number;
  trangThai: boolean;
  hinhAnhChinh?: string;
  hinhAnhs?: HinhAnhChiTietDTO[];
}

interface HinhAnhChiTietDTO {
  duongDan: string;
  laAnhChinh?: boolean;
  thuTu?: number;
}

interface Product {
  maSanPham: number;
  tenSanPham: string;
  moTa: string;
  thuongHieu: string;
  maDanhMuc: number;
  giaCoBan: number;
  trangThai: boolean;
  ngayTao?: string;
  ngayCapNhat?: string;
  chiTietSanPhams?: ProductDetail[];
}

export const HomePage = () => {
  const { addToCart, loading: cartLoading } = useCart();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  // Read category from URL params
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(parseInt(categoryParam));
    } else {
      setSelectedCategory(null);
    }
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    Promise.all([adminService.getProducts(), adminService.getAllCategories()])
      .then(([productsData]) => {
        setProducts(productsData || []);
        setError(null);
      })
      .catch((err) => {
        setError(err.message || "Lỗi khi tải dữ liệu");
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.tenSanPham
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === null || product.maDanhMuc === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="home-container">
      {/* Hero Header */}
      <header className="hero-header">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Bước đi phong cách
              <span className="gradient-text">Nâng tầm đẳng cấp</span>
            </h1>
            <p className="hero-description">
              Khám phá bộ sưu tập giày dép cao cấp, thiết kế độc đáo, mang đến
              sự thoải mái và phong cách cho mọi bước chân của bạn.
            </p>
            {/* <div className="hero-actions">
              <a href="#products" className="btn-primary">
                Khám phá ngay
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </a>
              <a href="#categories" className="btn-secondary">
                Xem danh mục
              </a>
            </div> */}
          </div>
          <div className="hero-image">
            <div className="floating-card card-1">
              <div className="card-icon"></div>
              <div className="card-text">
                <strong>500+</strong>
                <span>Sản phẩm</span>
              </div>
            </div>
            <div className="floating-card card-2">
              <div className="card-icon"></div>
              <div className="card-text">
                <strong>4.9/5</strong>
                <span>Đánh giá</span>
              </div>
            </div>
            <div className="floating-card card-3">
              <div className="card-icon"></div>
              <div className="card-text">
                <strong>Miễn phí</strong>
                <span>Vận chuyển</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="main-content">
        <section className="search-section">
          <div className="search-container">
            <svg
              className="search-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="clear-search"
                onClick={() => setSearchTerm("")}
              >
                ✕
              </button>
            )}
          </div>
        </section>

        {/* Products Section */}
        <section id="products" className="section products-section">
          <div className="section-header">
            <div className="section-header-content">
              <h2 className="section-title">Sản phẩm nổi bật</h2>
              <p className="section-subtitle">
                {filteredProducts.length} sản phẩm được tìm thấy
              </p>
            </div>
            {(selectedCategory !== null || searchTerm) && (
              <div className="active-filters">
                {selectedCategory !== null && (
                  <div className="filter-badge">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7"/>
                      <rect x="14" y="3" width="7" height="7"/>
                    </svg>
                    Danh mục #{selectedCategory}
                    <button
                      className="remove-filter"
                      onClick={() => {
                        setSelectedCategory(null);
                        window.history.pushState({}, '', '/');
                      }}
                    >
                      ✕
                    </button>
                  </div>
                )}
                {searchTerm && (
                  <div className="filter-badge">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="m21 21-4.35-4.35"/>
                    </svg>
                    "{searchTerm}"
                    <button
                      className="remove-filter"
                      onClick={() => setSearchTerm("")}
                    >
                      ✕
                    </button>
                  </div>
                )}
                <button
                  className="clear-all-filters"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory(null);
                    window.history.pushState({}, '', '/');
                  }}
                >
                  Xóa tất cả bộ lọc
                </button>
              </div>
            )}
          </div>

          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Đang tải sản phẩm...</p>
            </div>
          )}

          {!loading && !error && filteredProducts.length === 0 && (
            <div className="empty-state">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <h3>Không tìm thấy sản phẩm</h3>
              <p>Thử tìm kiếm với từ khóa khác hoặc xem tất cả danh mục</p>
              <button
                className="btn-primary"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory(null);
                }}
              >
                Xóa bộ lọc
              </button>
            </div>
          )}

          <div className="products-grid">
            {filteredProducts.map((product) => {
              const detail = product.chiTietSanPhams && product.chiTietSanPhams.length > 0 ? product.chiTietSanPhams[0] : undefined;
              return (
                <a
                  key={product.maSanPham}
                  className="product-card-link"
                  href={`/product/${product.maSanPham}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div className="product-card">
                    <div className="product-image">
                      {detail?.hinhAnhChinh ? (
                        <img
                          src={detail.hinhAnhChinh}
                          alt={product.tenSanPham}
                        />
                      ) : (
                        <div className="product-image-placeholder">
                          <svg
                            width="64"
                            height="64"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          >
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <path d="m21 15-5-5L5 21" />
                          </svg>
                        </div>
                      )}
                      <div className="product-badge">Mới</div>
                    </div>

                    <div className="product-details">
                      <h3 className="product-name">{product.tenSanPham}</h3>

                      {product.moTa && (
                        <p className="product-description">{product.moTa}</p>
                      )}

                      {/* <div className="product-meta">
                        {detail?.mauSac && (
                          <span className="meta-item">
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <circle cx="12" cy="12" r="10" />
                            </svg>
                            {detail.mauSac}
                          </span>
                        )}
                        {detail?.size && (
                          <span className="meta-item">
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M12 2v20M2 12h20" />
                            </svg>
                            Size {detail.size}
                          </span>
                        )}
                      </div> */}

                      <div className="product-footer">
                        <div className="product-price">
                          <span className="price-label">Giá:</span>
                          <span className="price-value">
                            {detail?.giaBan?.toLocaleString("vi-VN")}
                            ₫
                          </span>
                        </div>
                        <button
                          className="btn-add-cart"
                          disabled={cartLoading}
                          onClick={async (e) => {
                            e.preventDefault();
                            if (!detail?.maChiTiet) return;
                            await addToCart(detail.maChiTiet, 1);
                          }}
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <circle cx="9" cy="21" r="1" />
                            <circle cx="20" cy="21" r="1" />
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                          </svg>
                          Thêm vào giỏ
                        </button>
                      </div>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <h3>Chất lượng đảm bảo</h3>
              <p>100% hàng chính hãng, bảo hành đổi trả trong 30 ngày</p>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="1" y="3" width="15" height="13" />
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
              </div>
              <h3>Giao hàng nhanh chóng</h3>
              <p>Miễn phí vận chuyển cho đơn hàng từ 500.000₫</p>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h3>Hỗ trợ 24/7</h3>
              <p>Đội ngũ tư vấn nhiệt tình, chuyên nghiệp</p>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="2" y="7" width="20" height="14" rx="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              </div>
              <h3>Thanh toán an toàn</h3>
              <p>Hỗ trợ đa dạng phương thức thanh toán</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>StepUp Shoes</h3>
            <p>
              Nâng tầm phong cách, bước đi tự tin cùng StepUp Shoes - Điểm đến
              tin cậy cho những đôi giày chất lượng.
            </p>
          </div>

          <div className="footer-section">
            <h4>Liên kết</h4>
            <ul>
              <li>
                <a href="#about">Về chúng tôi</a>
              </li>
              <li>
                <a href="#products">Sản phẩm</a>
              </li>
              <li>
                <a href="#contact">Liên hệ</a>
              </li>
              <li>
                <a href="#policy">Chính sách</a>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Hỗ trợ</h4>
            <ul>
              <li>
                <a href="#faq">Câu hỏi thường gặp</a>
              </li>
              <li>
                <a href="#shipping">Vận chuyển</a>
              </li>
              <li>
                <a href="#return">Đổi trả</a>
              </li>
              <li>
                <a href="#warranty">Bảo hành</a>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Liên hệ</h4>
            <ul>
              <li>contact@stepupshoes.com</li>
              <li>0123 456 789</li>
              <li>Hà Nội, Việt Nam</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>StepUp Shoes</p>
        </div>
      </footer>
    </div>
  );
};
