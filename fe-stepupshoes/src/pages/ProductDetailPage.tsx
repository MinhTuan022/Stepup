import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { useParams, useNavigate } from "react-router-dom";
import { adminService } from "../services/api";
import "./ProductDetailPage.css";
import { BASE_IMAGE_URL } from "../constants";

interface HinhAnhChiTietDTO {
  duongDan: string;
  laAnhChinh?: boolean;
  thuTu?: number;
}

interface ProductDetail {
  maChiTiet?: number;
  maSanPham?: number;
  maSKU: string;
  mauSac: string;
  size: string;
  giaBan: number;
  soLuongTon: number;
  trangThai: boolean;
  hinhAnhChinh?: string;
  hinhAnhs?: HinhAnhChiTietDTO[];
  ngayTao?: string;
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
}

export const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [details, setDetails] = useState<ProductDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedDetail, setSelectedDetail] = useState<ProductDetail | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const { addToCart } = useCart();
  const { showToast } = useToast ? useToast() : { showToast: undefined };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      adminService.getProducts(),
      adminService.getProductDetailsByProductId(Number(id)),
    ])
      .then(([productsData, detailsData]) => {
        const found = (productsData || []).find((p: Product) => p.maSanPham === Number(id));
        setProduct(found || null);
        const detailsArr = Array.isArray(detailsData) ? detailsData : detailsData ? [detailsData] : [];
        setDetails(detailsArr);
        // Tự động chọn biến thể đầu tiên nếu có
        if (detailsArr.length > 0) {
          setSelectedColor(detailsArr[0].mauSac);
          setSelectedSize(detailsArr[0].size);
          setSelectedDetail(detailsArr[0]);
        }
        setSelectedImageIndex(0);
        setError(null);
      })
      .catch((err) => {
        setError(err.message || "Lỗi khi tải dữ liệu");
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Reset image index when variant changes
  useEffect(() => {
    setSelectedImageIndex(0);
  }, [selectedColor, selectedSize]);

  if (loading) {
    return (
      <div className="product-detail-loading">
        <div className="spinner"></div>
        <p>Đang tải chi tiết sản phẩm...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-error">
        <h2>Lỗi khi tải chi tiết sản phẩm</h2>
        <p>{error}</p>
        <button className="btn-primary" onClick={() => navigate(-1)}>
          Quay lại
        </button>
      </div>
    );
  }

  const colors = Array.from(new Set(details.map(d => d.mauSac)));
  const sizes = Array.from(new Set(details.filter(d => d.mauSac === selectedColor).map(d => d.size)));
  const currentDetail = details.find(d => d.mauSac === selectedColor && d.size === selectedSize) || selectedDetail;

  const allImages = currentDetail?.hinhAnhs && currentDetail.hinhAnhs.length > 0
    ? currentDetail.hinhAnhs
    : currentDetail?.hinhAnhChinh
    ? [{ duongDan: currentDetail.hinhAnhChinh, laAnhChinh: true, thuTu: 0 }]
    : [];

  const currentImage = allImages[selectedImageIndex] || allImages[0];

  const incrementQuantity = () => {
    if (currentDetail && quantity < currentDetail.soLuongTon) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: "Hết hàng", class: "out-of-stock" };
    if (stock < 10) return { label: "Sắp hết", class: "low-stock" };
    return { label: "Còn hàng", class: "in-stock" };
  };

  return (
    <div className="product-detail-container">
      <div className="breadcrumb">
        <span onClick={() => navigate("/")} className="breadcrumb-link">Trang chủ</span>
        <span className="breadcrumb-separator">/</span>
        <span onClick={() => navigate("/")} className="breadcrumb-link">Sản phẩm</span>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">{product.tenSanPham}</span>
      </div>

      <div className="product-detail-main">
        <div className="product-detail-images">
          {allImages.length > 0 ? (
            <div className="image-gallery-modern">
              <div className="main-image-display">
                <img
                  src={`${BASE_IMAGE_URL}${currentImage?.duongDan}`}
                  alt={product.tenSanPham}
                  className="main-display-image"
                />
                {currentDetail && getStockStatus(currentDetail.soLuongTon).class === "out-of-stock" && (
                  <div className="out-of-stock-overlay">
                    <span>Hết hàng</span>
                  </div>
                )}
              </div>

              {allImages.length > 1 && (
                <div className="thumbnail-gallery">
                  {allImages.map((img, idx) => (
                    <div
                      key={idx}
                      className={`thumbnail ${idx === selectedImageIndex ? "active" : ""}`}
                      onClick={() => setSelectedImageIndex(idx)}
                    >
                      <img src={`${BASE_IMAGE_URL}${img.duongDan}`} alt={`${product.tenSanPham} ${idx + 1}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="image-placeholder-modern">
              <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
              <span>Không có hình ảnh</span>
            </div>
          )}
        </div>

        {/* Product Info Section */}
        <div className="product-detail-info">
          <div className="product-header-section">
            <div className="brand-badge">{product.thuongHieu}</div>
            <h1 className="product-title">{product.tenSanPham}</h1>
            {currentDetail && (
              <div className="product-meta">
                <span className="sku-badge">SKU: {currentDetail.maSKU}</span>
                <span className={`stock-badge ${getStockStatus(currentDetail.soLuongTon).class}`}>
                  {getStockStatus(currentDetail.soLuongTon).label}
                </span>
              </div>
            )}
          </div>

          <div className="price-section">
            {currentDetail ? (
              <>
                <div className="current-price">{currentDetail.giaBan.toLocaleString("vi-VN")}₫</div>
                {product.giaCoBan !== currentDetail.giaBan && (
                  <div className="original-price">{product.giaCoBan.toLocaleString("vi-VN")}₫</div>
                )}
              </>
            ) : (
              <div className="current-price">{product.giaCoBan.toLocaleString("vi-VN")}₫</div>
            )}
          </div>

          <div className="description-section">
            <h3>Mô tả sản phẩm</h3>
            <p>{product.moTa}</p>
          </div>

          {/* Variant Selection */}
          <div className="variant-selection-section">
            <div className="variant-group">
              <label className="variant-label">Màu sắc</label>
              <div className="color-options-modern">
                {colors.map((color) => (
                  <button
                    key={color}
                    className={`color-option ${color === selectedColor ? "selected" : ""}`}
                    onClick={() => {
                      setSelectedColor(color);
                      setSelectedSize("");
                    }}
                    title={color}
                  >
                    <span className="color-name">{color}</span>
                  </button>
                ))}
              </div>
            </div>

            {selectedColor && sizes.length > 0 && (
              <div className="variant-group">
                <label className="variant-label">Kích thước</label>
                <div className="size-options-modern">
                  {sizes.map((size) => {
                    const sizeDetail = details.find(d => d.mauSac === selectedColor && d.size === size);
                    const isOutOfStock = sizeDetail?.soLuongTon === 0;
                    return (
                      <button
                        key={size}
                        className={`size-option ${size === selectedSize ? "selected" : ""} ${isOutOfStock ? "disabled" : ""}`}
                        onClick={() => {
                          if (!isOutOfStock) {
                            setSelectedSize(size);
                            setSelectedDetail(sizeDetail || null);
                          }
                        }}
                        disabled={isOutOfStock}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Quantity and Actions */}
          {currentDetail && selectedSize && (
            <div className="purchase-section">
              <div className="quantity-section">
                <label className="quantity-label">Số lượng</label>
                <div className="quantity-selector">
                  <button
                    className="quantity-btn"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <input
                    type="text"
                    className="quantity-input"
                    value={quantity}
                    readOnly
                  />
                  <button
                    className="quantity-btn"
                    onClick={incrementQuantity}
                    disabled={quantity >= currentDetail.soLuongTon}
                  >
                    +
                  </button>
                </div>
                <span className="stock-info">{currentDetail.soLuongTon} sản phẩm có sẵn</span>
              </div>

              <div className="action-buttons-modern">
                <button
                  className="btn-add-cart"
                  disabled={!selectedColor || !selectedSize || !currentDetail || quantity < 1 || currentDetail.soLuongTon === 0}
                  onClick={async () => {
                    if (typeof currentDetail.maChiTiet === "number") {
                      await addToCart(currentDetail.maChiTiet, quantity);
                      showToast && showToast("Đã thêm vào giỏ hàng", "success");
                    }
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                  Thêm vào giỏ hàng
                </button>
                <button
                  className="btn-buy-now"
                  disabled={!selectedColor || !selectedSize || !currentDetail || quantity < 1 || currentDetail.soLuongTon === 0}
                  onClick={async () => {
                    if (typeof currentDetail.maChiTiet === "number") {
                      await addToCart(currentDetail.maChiTiet, quantity);
                      showToast && showToast("Chuyển đến thanh toán", "info");
                      navigate("/checkout");
                    }
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                  </svg>
                  Mua ngay
                </button>
              </div>
            </div>
          )}

          {/* Trust Badges */}
          <div className="trust-badges">
            <div className="trust-item">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <div>
                <strong>Miễn phí vận chuyển</strong>
                <span>Đơn hàng từ 500K</span>
              </div>
            </div>
            <div className="trust-item">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
              <div>
                <strong>Đổi trả dễ dàng</strong>
                <span>Trong vòng 7 ngày</span>
              </div>
            </div>
            <div className="trust-item">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
              <div>
                <strong>Thanh toán an toàn</strong>
                <span>Bảo mật thông tin</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
