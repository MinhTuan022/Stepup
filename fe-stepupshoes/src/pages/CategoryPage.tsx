import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { adminService } from "../services/api";
import "./CategoryPage.css";

interface DanhMuc {
  maDanhMuc: number;
  tenDanhMuc: string;
  moTa: string;
  maDanhMucCha?: number | null;
  trangThai?: boolean;
}

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

interface Filters {
  priceRange: [number, number];
  colors: string[];
  sizes: string[];
  brands: string[];
  sortBy: string;
}

export const CategoryPage = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { addToCart, loading: cartLoading } = useCart();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<DanhMuc[]>([]);
  const [currentCategory, setCurrentCategory] = useState<DanhMuc | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<Filters>({
    priceRange: [0, 10000000],
    colors: [],
    sizes: [],
    brands: [],
    sortBy: "default",
  });
  
  const [searchTerm, setSearchTerm] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          adminService.getProducts(),
          adminService.getAllCategories(),
        ]);
        
        setProducts(productsData || []);
        setCategories(categoriesData || []);
        
        const catId = parseInt(categoryId || "0");
        const category = (categoriesData || []).find(
          (c: DanhMuc) => c.maDanhMuc === catId
        );
        setCurrentCategory(category || null);
        
        setError(null);
      } catch (err: any) {
        setError(err.message || "Lỗi khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [categoryId]);

  const availableColors = Array.from(
    new Set(
      products.flatMap(p => 
        (p.chiTietSanPhams || []).map(d => d.mauSac)
      ).filter(Boolean)
    )
  );

  const availableSizes = Array.from(
    new Set(
      products.flatMap(p => 
        (p.chiTietSanPhams || []).map(d => d.size)
      ).filter(Boolean)
    )
  ).sort();

  const availableBrands = Array.from(
    new Set(products.map(p => p.thuongHieu).filter(Boolean))
  );

  const maxPrice = Math.max(
    ...products.flatMap(p => 
      (p.chiTietSanPhams || []).map(d => d.giaBan)
    ),
    10000000
  );

  const filteredProducts = products
    .filter((product) => {
      const matchesCategory = product.maDanhMuc === parseInt(categoryId || "0");
      
      const matchesSearch = product.tenSanPham
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      
      const productPrice = product.chiTietSanPhams?.[0]?.giaBan || 0;
      const matchesPrice = 
        productPrice >= filters.priceRange[0] && 
        productPrice <= filters.priceRange[1];
      
      const matchesColor = 
        filters.colors.length === 0 ||
        (product.chiTietSanPhams || []).some(d => 
          filters.colors.includes(d.mauSac)
        );
      
      const matchesSize = 
        filters.sizes.length === 0 ||
        (product.chiTietSanPhams || []).some(d => 
          filters.sizes.includes(d.size)
        );
      
      const matchesBrand = 
        filters.brands.length === 0 ||
        filters.brands.includes(product.thuongHieu);
      
      return matchesCategory && matchesSearch && matchesPrice && 
             matchesColor && matchesSize && matchesBrand;
    })
    .sort((a, b) => {
      const priceA = a.chiTietSanPhams?.[0]?.giaBan || 0;
      const priceB = b.chiTietSanPhams?.[0]?.giaBan || 0;
      
      switch (filters.sortBy) {
        case "price-asc":
          return priceA - priceB;
        case "price-desc":
          return priceB - priceA;
        case "name":
          return a.tenSanPham.localeCompare(b.tenSanPham);
        default:
          return 0;
      }
    });

  const handleColorToggle = (color: string) => {
    setFilters(prev => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color],
    }));
  };

  const handleSizeToggle = (size: string) => {
    setFilters(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const handleBrandToggle = (brand: string) => {
    setFilters(prev => ({
      ...prev,
      brands: prev.brands.includes(brand)
        ? prev.brands.filter(b => b !== brand)
        : [...prev.brands, brand],
    }));
  };

  const resetFilters = () => {
    setFilters({
      priceRange: [0, maxPrice],
      colors: [],
      sizes: [],
      brands: [],
      sortBy: "default",
    });
    setSearchTerm("");
  };

  const childCategories = categories.filter(
    cat => cat.maDanhMucCha === parseInt(categoryId || "0") && cat.trangThai !== false
  );

  return (
    <div className="category-page">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <a href="/" onClick={(e) => { e.preventDefault(); navigate("/"); }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          </svg>
          Trang chủ
        </a>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
        <span>{currentCategory?.tenDanhMuc || "Danh mục"}</span>
      </div>

      {/* Header */}
      <div className="category-header">
        <div className="category-info">
          <h1 className="category-title">{currentCategory?.tenDanhMuc || "Danh mục"}</h1>
          {currentCategory?.moTa && (
            <p className="category-description">{currentCategory.moTa}</p>
          )}
        </div>
        <div className="category-stats">
          <span className="product-count">{filteredProducts.length} sản phẩm</span>
        </div>
      </div>

      {/* Child Categories */}
      {childCategories.length > 0 && (
        <div className="child-categories">
          <h3>Danh mục con</h3>
          <div className="child-categories-grid">
            {childCategories.map(cat => (
              <a
                key={cat.maDanhMuc}
                href={`/category/${cat.maDanhMuc}`}
                className="child-category-card"
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`/category/${cat.maDanhMuc}`);
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"/>
                  <rect x="14" y="3" width="7" height="7"/>
                </svg>
                <div>
                  <h4>{cat.tenDanhMuc}</h4>
                  {cat.moTa && <p>{cat.moTa}</p>}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="category-content">
        {/* Sidebar Filters */}
        <aside className={`filters-sidebar ${showMobileFilters ? 'show' : ''}`}>
          <div className="filters-header">
            <h3>Bộ lọc</h3>
            <button className="close-filters-mobile" onClick={() => setShowMobileFilters(false)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Search */}
          <div className="filter-section">
            <label className="filter-label">Tìm kiếm</label>
            <div className="search-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Tìm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Price Range */}
          <div className="filter-section">
            <label className="filter-label">Khoảng giá</label>
            <div className="price-inputs">
              <input
                type="number"
                placeholder="Từ"
                value={filters.priceRange[0]}
                onChange={(e) =>
                  setFilters(prev => ({
                    ...prev,
                    priceRange: [parseInt(e.target.value) || 0, prev.priceRange[1]],
                  }))
                }
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Đến"
                value={filters.priceRange[1]}
                onChange={(e) =>
                  setFilters(prev => ({
                    ...prev,
                    priceRange: [prev.priceRange[0], parseInt(e.target.value) || maxPrice],
                  }))
                }
              />
            </div>
            <div className="price-display">
              {filters.priceRange[0].toLocaleString("vi-VN")}₫ - {filters.priceRange[1].toLocaleString("vi-VN")}₫
            </div>
          </div>

          {/* Colors */}
          {availableColors.length > 0 && (
            <div className="filter-section">
              <label className="filter-label">Màu sắc</label>
              <div className="filter-options">
                {availableColors.map(color => (
                  <button
                    key={color}
                    className={`filter-chip ${filters.colors.includes(color) ? 'active' : ''}`}
                    onClick={() => handleColorToggle(color)}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {availableSizes.length > 0 && (
            <div className="filter-section">
              <label className="filter-label">Kích cỡ</label>
              <div className="filter-options">
                {availableSizes.map(size => (
                  <button
                    key={size}
                    className={`filter-chip ${filters.sizes.includes(size) ? 'active' : ''}`}
                    onClick={() => handleSizeToggle(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Brands */}
          {availableBrands.length > 0 && (
            <div className="filter-section">
              <label className="filter-label">Thương hiệu</label>
              <div className="filter-options-list">
                {availableBrands.map(brand => (
                  <label key={brand} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={filters.brands.includes(brand)}
                      onChange={() => handleBrandToggle(brand)}
                    />
                    <span>{brand}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Reset Button */}
          <button className="reset-filters-btn" onClick={resetFilters}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
              <path d="M21 3v5h-5"/>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
              <path d="M3 21v-5h5"/>
            </svg>
            Xóa bộ lọc
          </button>
        </aside>

        {/* Main Content */}
        <main className="products-main">
          {/* Toolbar */}
          <div className="products-toolbar">
            <button 
              className="mobile-filters-btn"
              onClick={() => setShowMobileFilters(true)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="21" x2="4" y2="14"/>
                <line x1="4" y1="10" x2="4" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12" y2="3"/>
                <line x1="20" y1="21" x2="20" y2="16"/>
                <line x1="20" y1="12" x2="20" y2="3"/>
                <line x1="1" y1="14" x2="7" y2="14"/>
                <line x1="9" y1="8" x2="15" y2="8"/>
                <line x1="17" y1="16" x2="23" y2="16"/>
              </svg>
              Bộ lọc
            </button>

            <div className="sort-select">
              <label>Sắp xếp:</label>
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters(prev => ({ ...prev, sortBy: e.target.value }))
                }
              >
                <option value="default">Mặc định</option>
                <option value="price-asc">Giá thấp đến cao</option>
                <option value="price-desc">Giá cao đến thấp</option>
                <option value="name">Tên A-Z</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Đang tải sản phẩm...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <h3>Lỗi tải dữ liệu</h3>
              <p>{error}</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <h3>Không tìm thấy sản phẩm</h3>
              <p>Thử thay đổi bộ lọc hoặc tìm kiếm khác</p>
              <button className="btn-primary" onClick={resetFilters}>
                Xóa bộ lọc
              </button>
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map((product) => {
                const detail = product.chiTietSanPhams?.[0];
                return (
                  <a
                    key={product.maSanPham}
                    href={`/product/${product.maSanPham}`}
                    className="product-card"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(`/product/${product.maSanPham}`);
                    }}
                  >
                    <div className="product-image">
                      {detail?.hinhAnhChinh ? (
                        <img src={detail.hinhAnhChinh} alt={product.tenSanPham} />
                      ) : (
                        <div className="product-image-placeholder">
                          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <path d="m21 15-5-5L5 21"/>
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

                      <div className="product-meta">
                        {detail?.mauSac && (
                          <span className="meta-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <circle cx="12" cy="12" r="10"/>
                            </svg>
                            {detail.mauSac}
                          </span>
                        )}
                        {detail?.size && (
                          <span className="meta-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 2v20M2 12h20"/>
                            </svg>
                            Size {detail.size}
                          </span>
                        )}
                      </div>

                      <div className="product-footer">
                        <div className="product-price">
                          <span className="price-label">Giá:</span>
                          <span className="price-value">
                            {detail?.giaBan?.toLocaleString("vi-VN")}₫
                          </span>
                        </div>
                        <button
                          className="btn-add-cart"
                          disabled={cartLoading}
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!detail?.maChiTiet) return;
                            await addToCart(detail.maChiTiet, 1);
                          }}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="9" cy="21" r="1"/>
                            <circle cx="20" cy="21" r="1"/>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                          </svg>
                          Thêm
                        </button>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Overlay */}
      {showMobileFilters && (
        <div 
          className="mobile-filters-overlay"
          onClick={() => setShowMobileFilters(false)}
        />
      )}
    </div>
  );
};
