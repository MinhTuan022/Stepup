import { useEffect, useState } from "react";
import { useToast } from "../../context/ToastContext";
import { adminService } from "../../services/api";
import "./ProductsTab.css";

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
  chiTietSanPhams: ProductDetail[];
}

const defaultVariant: ProductDetail = {
  maSKU: "",
  mauSac: "",
  size: "",
  giaBan: 0,
  soLuongTon: 0,
  trangThai: true,
  hinhAnhChinh: "",
  hinhAnhs: [],
};

const defaultForm: Partial<Product> = {
  tenSanPham: "",
  moTa: "",
  thuongHieu: "",
  maDanhMuc: 1,
  giaCoBan: 0,
  trangThai: true,
  chiTietSanPhams: [{ ...defaultVariant }],
};

const ProductsTab = () => {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<
    { maDanhMuc: number; tenDanhMuc: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Partial<Product>>(defaultForm);
  const [variantIndex, setVariantIndex] = useState(0);
  const [editId, setEditId] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<number | "">("");
  const [filterStatus, setFilterStatus] = useState<boolean | "">("");
  const [imageInputs, setImageInputs] = useState<string[]>([]);

  useEffect(() => {
    if (showModal && form.chiTietSanPhams && form.chiTietSanPhams[variantIndex]?.hinhAnhs) {
      setImageInputs(form.chiTietSanPhams[variantIndex].hinhAnhs!.map((h) => h.duongDan));
    } else if (showModal) {
      setImageInputs([]);
    }
  }, [showModal, form.chiTietSanPhams, variantIndex]);

  const handleAddImageInput = () => setImageInputs((prev) => [...prev, ""]);
  const handleRemoveImageInput = (idx: number) =>
    setImageInputs((prev) => prev.filter((_, i) => i !== idx));
  const handleImageInputChange = (idx: number, value: string) =>
    setImageInputs((prev) => prev.map((v, i) => (i === idx ? value : v)));

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await adminService.getProducts();
      setProducts(data || []);
      setFilteredProducts(data || []);
    } catch {
      showToast("Không thể tải danh sách sản phẩm", "error");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
    adminService.getAllCategories().then((data) => {
      setCategories(data || []);
    });
  }, []);

  useEffect(() => {
    let result = [...products];

    if (searchTerm) {
      result = result.filter(
        (p) =>
          p.tenSanPham.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.thuongHieu?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (filterCategory !== "") {
      result = result.filter((p) => p.maDanhMuc === Number(filterCategory));
    }

    if (filterStatus !== "") {
      result = result.filter((p) => p.trangThai === filterStatus);
    }

    setFilteredProducts(result);
  }, [searchTerm, filterCategory, filterStatus, products]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleDetailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) => {
      const variants = prev.chiTietSanPhams ? [...prev.chiTietSanPhams] : [{ ...defaultVariant }];
      variants[variantIndex] = {
        ...variants[variantIndex],
        [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value,
      };
      return { ...prev, chiTietSanPhams: variants };
    });
  };

  const validateForm = (): boolean => {
    if (!form.tenSanPham?.trim()) {
      showToast("Vui lòng nhập tên sản phẩm", "warning");
      return false;
    }
    if (!form.chiTietSanPhams || form.chiTietSanPhams.length === 0) {
      showToast("Vui lòng thêm ít nhất một biến thể sản phẩm", "warning");
      return false;
    }
    for (const v of form.chiTietSanPhams) {
      if (!v.maSKU?.trim()) {
        showToast("Vui lòng nhập SKU cho tất cả biến thể", "warning");
        return false;
      }
      if (!v.mauSac?.trim() || !v.size?.trim()) {
        showToast("Vui lòng nhập đầy đủ màu sắc và size cho tất cả biến thể", "warning");
        return false;
      }
    }
    return true;
  };

  const handleSubmitProduct = async () => {
    // Chỉ được gọi từ nút "Cập nhật" ở bước 2
    if (currentStep !== 2) return;
    
    if (!validateForm()) return;

    const variants = form.chiTietSanPhams!.map((v, idx) =>
      idx === variantIndex
        ? {
            ...v,
            hinhAnhs: imageInputs
              .filter((url) => url.trim() !== "")
              .map((url, i) => ({ duongDan: url, thuTu: i + 1, laAnhChinh: false })),
          }
        : v,
    );
    const submitForm = { ...form, chiTietSanPhams: variants };

    setLoading(true);
    try {
      if (editId) {
        await adminService.updateProduct(editId, submitForm);
        showToast("Cập nhật sản phẩm thành công!", "success");
      } else {
        await adminService.createProduct(submitForm);
        showToast("Thêm sản phẩm thành công!", "success");
      }
      closeModal();
      fetchProducts();
    } catch {
      showToast("Có lỗi xảy ra. Vui lòng thử lại!", "error");
    }
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ngăn form submit, chỉ cho phép gọi API qua nút "Cập nhật"
  };

  const handleEdit = (product: Product) => {
    setForm({
      ...product,
      chiTietSanPhams:
        product.chiTietSanPhams && product.chiTietSanPhams.length > 0
          ? product.chiTietSanPhams
          : [{ ...defaultVariant }],
    });
    setEditId(product.maSanPham);
    setCurrentStep(1);
    setShowModal(true);
    setVariantIndex(0);
    setImageInputs(
      product.chiTietSanPhams?.[0]?.hinhAnhs
        ? product.chiTietSanPhams[0].hinhAnhs.map((h) => h.duongDan)
        : [],
    );
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này? Hành động này không thể hoàn tác."))
      return;
    setLoading(true);
    try {
      await adminService.deleteProduct(id);
      showToast("Xóa sản phẩm thành công!", "success");
      fetchProducts();
    } catch {
      showToast("Không thể xóa sản phẩm. Vui lòng thử lại!", "error");
    }
    setLoading(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(defaultForm);
    setEditId(null);
    setCurrentStep(1);
    setImageInputs([]);
  };

  const getCategoryName = (id: number) => {
    return categories.find((c) => c.maDanhMuc === id)?.tenDanhMuc || "N/A";
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (!form.tenSanPham?.trim() || !form.maDanhMuc) {
        alert("Vui lòng điền đầy đủ thông tin cơ bản");
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 2));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  return (
    <div className="products-tab-improved">
      {/* Page Header */}
      <div className="page-header">
        <h2>Quản lý sản phẩm</h2>
        <button
          className="btn-primary"
          onClick={() => {
            setShowModal(true);
            setForm(defaultForm);
            setEditId(null);
          }}
        >
          Thêm sản phẩm
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm, thương hiệu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={filterCategory}
          onChange={(e) =>
            setFilterCategory(e.target.value === "" ? "" : Number(e.target.value))
          }
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((cat) => (
            <option key={cat.maDanhMuc} value={cat.maDanhMuc}>
              {cat.tenDanhMuc}
            </option>
          ))}
        </select>

        <select
          className="filter-select"
          value={filterStatus === "" ? "" : filterStatus.toString()}
          onChange={(e) =>
            setFilterStatus(e.target.value === "" ? "" : e.target.value === "true")
          }
        >
          <option value="">Tất cả trạng thái</option>
          <option value="true">Đang kinh doanh</option>
          <option value="false">Ngừng kinh doanh</option>
        </select>
      </div>

      <div className="results-info">
        Hiển thị <strong>{filteredProducts.length}</strong> / {products.length} sản phẩm
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content-improved">
            <div className="modal-header">
              <h3>{editId ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</h3>
              <button className="close-btn" onClick={closeModal}>✕</button>
            </div>

            {/* Step Indicator */}
            <div className="step-indicator">
              <div className={`step ${currentStep >= 1 ? "active" : ""}`}>
                <div className="step-number">1</div>
                <div className="step-label">Thông tin cơ bản</div>
              </div>
              <div className="step-line"></div>
              <div className={`step ${currentStep >= 2 ? "active" : ""}`}>
                <div className="step-number">2</div>
                <div className="step-label">Chi tiết sản phẩm</div>
              </div>
            </div>

            <form
              className="product-form-improved"
              onSubmit={handleSubmit}
              onKeyDown={(e) => {
                if (e.key === "Enter" && currentStep < 2) e.preventDefault();
              }}
            >
              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <div className="form-step">
                  <div className="form-group">
                    <label>Tên sản phẩm <span className="required">*</span></label>
                    <input
                      name="tenSanPham"
                      value={form.tenSanPham || ""}
                      onChange={handleInputChange}
                      placeholder="Nhập tên sản phẩm"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Mô tả</label>
                    <textarea
                      name="moTa"
                      value={form.moTa || ""}
                      onChange={handleInputChange}
                      placeholder="Nhập mô tả sản phẩm"
                      rows={3}
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Thương hiệu</label>
                      <input
                        name="thuongHieu"
                        value={form.thuongHieu || ""}
                        onChange={handleInputChange}
                        placeholder="VD: Nike, Adidas..."
                      />
                    </div>
                    <div className="form-group">
                      <label>Danh mục <span className="required">*</span></label>
                      <select
                        name="maDanhMuc"
                        value={form.maDanhMuc || ""}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Chọn danh mục</option>
                        {categories.map((cat) => (
                          <option key={cat.maDanhMuc} value={cat.maDanhMuc}>
                            {cat.tenDanhMuc}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Giá cơ bản (VNĐ)</label>
                      <input
                        name="giaCoBan"
                        type="number"
                        value={form.giaCoBan || 0}
                        onChange={handleInputChange}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    <div className="form-group">
                      <label className="checkbox-label">
                        <input
                          name="trangThai"
                          type="checkbox"
                          checked={form.trangThai ?? true}
                          onChange={handleInputChange}
                        />
                        <span>Đang kinh doanh</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Variants */}
              {currentStep === 2 && (
                <div className="form-step">
                  {/* Variant Tabs */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span>Biến thể:</span>
                      {form.chiTietSanPhams?.map((v, idx) => (
                        <button
                          key={idx}
                          type="button"
                          style={{
                            padding: "2px 8px",
                            borderRadius: 4,
                            border: idx === variantIndex ? "2px solid #007bff" : "1px solid #ccc",
                            background: idx === variantIndex ? "#eaf4ff" : "#fff",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            setForm((prev) => {
                              const variants = prev.chiTietSanPhams ? [...prev.chiTietSanPhams] : [];
                              variants[variantIndex] = {
                                ...variants[variantIndex],
                                hinhAnhs: imageInputs
                                  .filter((url) => url.trim() !== "")
                                  .map((url, i) => ({ duongDan: url, thuTu: i + 1, laAnhChinh: false })),
                              };
                              return { ...prev, chiTietSanPhams: variants };
                            });
                            setVariantIndex(idx);
                          }}
                        >
                          #{idx + 1}
                        </button>
                      ))}
                      <button
                        type="button"
                        style={{
                          marginLeft: 8,
                          padding: "2px 8px",
                          borderRadius: 4,
                          border: "1px solid #28a745",
                          background: "#eaffea",
                          color: "#28a745",
                        }}
                        onClick={() => {
                          setForm((prev) => ({
                            ...prev,
                            chiTietSanPhams: [...(prev.chiTietSanPhams || []), { ...defaultVariant }],
                          }));
                          setVariantIndex(form.chiTietSanPhams ? form.chiTietSanPhams.length : 0);
                          setImageInputs([]);
                        }}
                      >
                        + Thêm biến thể
                      </button>
                      {form.chiTietSanPhams && form.chiTietSanPhams.length > 1 && (
                        <button
                          type="button"
                          style={{
                            marginLeft: 8,
                            padding: "2px 8px",
                            borderRadius: 4,
                            border: "1px solid #dc3545",
                            background: "#ffeaea",
                            color: "#dc3545",
                          }}
                          onClick={() => {
                            if (window.confirm("Xóa biến thể này?")) {
                              setForm((prev) => {
                                const variants = prev.chiTietSanPhams ? [...prev.chiTietSanPhams] : [];
                                variants.splice(variantIndex, 1);
                                return { ...prev, chiTietSanPhams: variants };
                              });
                              setVariantIndex(0);
                              setImageInputs(
                                form.chiTietSanPhams?.[0]?.hinhAnhs
                                  ? form.chiTietSanPhams[0].hinhAnhs.map((h) => h.duongDan)
                                  : [],
                              );
                            }
                          }}
                        >
                          Xóa biến thể
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Variant Fields */}
                  <div className="detail-form-single">
                    <div className="form-row">
                      <div className="form-group">
                        <label>SKU <span className="required">*</span></label>
                        <input
                          name="maSKU"
                          value={form.chiTietSanPhams?.[variantIndex]?.maSKU || ""}
                          onChange={handleDetailChange}
                          placeholder="VD: SP001-RED-M"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Màu sắc <span className="required">*</span></label>
                        <input
                          name="mauSac"
                          value={form.chiTietSanPhams?.[variantIndex]?.mauSac || ""}
                          onChange={handleDetailChange}
                          placeholder="VD: Đỏ"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Size <span className="required">*</span></label>
                        <input
                          name="size"
                          value={form.chiTietSanPhams?.[variantIndex]?.size || ""}
                          onChange={handleDetailChange}
                          placeholder="VD: M, L, XL"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Giá bán (VNĐ) <span className="required">*</span></label>
                        <input
                          name="giaBan"
                          type="number"
                          value={form.chiTietSanPhams?.[variantIndex]?.giaBan || 0}
                          onChange={handleDetailChange}
                          placeholder="0"
                          min="0"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Số lượng tồn</label>
                        <input
                          name="soLuongTon"
                          type="number"
                          value={form.chiTietSanPhams?.[variantIndex]?.soLuongTon || 0}
                          onChange={handleDetailChange}
                          placeholder="0"
                          min="0"
                        />
                      </div>
                      <div className="form-group">
                        <label className="checkbox-label">
                          <input
                            name="trangThai"
                            type="checkbox"
                            checked={form.chiTietSanPhams?.[variantIndex]?.trangThai ?? true}
                            onChange={handleDetailChange}
                          />
                          <span>Còn hàng</span>
                        </label>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>URL hình ảnh chính</label>
                      <input
                        name="hinhAnhChinh"
                        value={form.chiTietSanPhams?.[variantIndex]?.hinhAnhChinh || ""}
                        onChange={handleDetailChange}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>

                    <div className="form-group">
                      <label>Ảnh phụ (URL, có thể nhiều)</label>
                      {imageInputs.map((url, idx) => (
                        <div key={idx} style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                          <input
                            type="text"
                            value={url}
                            onChange={(e) => handleImageInputChange(idx, e.target.value)}
                            placeholder={`URL ảnh phụ #${idx + 1}`}
                          />
                          <button
                            type="button"
                            className="remove-image-btn"
                            onClick={() => handleRemoveImageInput(idx)}
                          >
                            Xóa
                          </button>
                        </div>
                      ))}
                      <button type="button" className="add-image-btn" onClick={handleAddImageInput}>
                        + Thêm ảnh phụ
                      </button>
                    </div>

                    {/* Preview */}
                    {form.chiTietSanPhams && (
                      <div className="detail-preview">
                        <h5>Xem trước chi tiết biến thể</h5>
                        <div className="preview-card">
                          <div className="preview-header">
                            <span className="preview-sku">
                              {form.chiTietSanPhams[variantIndex]?.maSKU || "SKU chưa có"}
                            </span>
                            <span
                              className={`preview-status ${
                                form.chiTietSanPhams[variantIndex]?.trangThai ? "active" : "inactive"
                              }`}
                            >
                              {form.chiTietSanPhams[variantIndex]?.trangThai ? "● Còn hàng" : "○ Hết hàng"}
                            </span>
                          </div>
                          <div className="preview-details-grid">
                            <div className="preview-item">
                              <span className="preview-label">Màu sắc:</span>
                              <strong>{form.chiTietSanPhams[variantIndex]?.mauSac || "-"}</strong>
                            </div>
                            <div className="preview-item">
                              <span className="preview-label">Size:</span>
                              <strong>{form.chiTietSanPhams[variantIndex]?.size || "-"}</strong>
                            </div>
                            <div className="preview-item">
                              <span className="preview-label">Giá bán:</span>
                              <strong>
                                {form.chiTietSanPhams[variantIndex]?.giaBan?.toLocaleString() || 0} đ
                              </strong>
                            </div>
                            <div className="preview-item">
                              <span className="preview-label">Tồn kho:</span>
                              <strong>{form.chiTietSanPhams[variantIndex]?.soLuongTon || 0}</strong>
                            </div>
                          </div>
                          <div className="preview-images-flex">
                            {form.chiTietSanPhams[variantIndex]?.hinhAnhChinh && (
                              <div className="preview-image">
                                <img
                                  src={form.chiTietSanPhams[variantIndex]?.hinhAnhChinh}
                                  alt="Preview"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = "none";
                                  }}
                                />
                              </div>
                            )}
                            {imageInputs.length > 0 && (
                              <div className="preview-sub-images">
                                <div>Ảnh phụ:</div>
                                <div className="preview-sub-images-list">
                                  {imageInputs.map((url, idx) =>
                                    url ? (
                                      <img
                                        key={idx}
                                        src={url}
                                        alt={`Ảnh phụ #${idx + 1}`}
                                        className="preview-sub-image"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).style.display = "none";
                                        }}
                                      />
                                    ) : null,
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="form-actions">
                {currentStep > 1 && (
                  <button type="button" className="btn-secondary" onClick={prevStep}>
                    ← Quay lại
                  </button>
                )}
                {currentStep < 2 ? (
                  <button type="button" className="btn-primary" onClick={nextStep}>
                    Tiếp theo →
                  </button>
                ) : (
                  <button type="button" className="btn-primary" onClick={handleSubmitProduct} disabled={loading}>
                    {loading ? "Đang lưu..." : editId ? "Cập nhật" : "Thêm sản phẩm"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="products-table-container">
        {loading && filteredProducts.length === 0 ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state">
            <p>Không tìm thấy sản phẩm nào</p>
          </div>
        ) : (
          <table className="products-table">
            <thead>
              <tr>
                <th>Ảnh</th>
                <th>Tên sản phẩm</th>
                <th>Thương hiệu</th>
                <th>Danh mục</th>
                <th>Biến thể</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p.maSanPham}>
                  <td>
                    {p.chiTietSanPhams?.[0]?.hinhAnhChinh ? (
                      <img
                        src={p.chiTietSanPhams[0].hinhAnhChinh}
                        alt={p.tenSanPham}
                        style={{
                          width: 48,
                          height: 48,
                          objectFit: "cover",
                          borderRadius: 4,
                          border: "1px solid #eee",
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <span style={{ color: "#bbb" }}>Không có ảnh</span>
                    )}
                  </td>
                  <td>
                    <div className="product-name-cell">
                      <strong>{p.tenSanPham}</strong>
                    </div>
                  </td>
                  <td>{p.thuongHieu || "-"}</td>
                  <td>{getCategoryName(p.maDanhMuc)}</td>
                  <td>
                    {p.chiTietSanPhams && p.chiTietSanPhams.length > 0 ? (
                      <ul style={{ paddingLeft: 16, margin: 0 }}>
                        {p.chiTietSanPhams.map((v, idx) => (
                          <li key={idx} style={{ marginBottom: 4 }}>
                            <span className="sku-badge">{v.maSKU}</span> |{" "}
                            <span>{v.mauSac}</span> |{" "}
                            <span>{v.size}</span> |{" "}
                            <span>{v.giaBan?.toLocaleString()} đ</span> |{" "}
                            <span>{v.soLuongTon} tồn</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${p.trangThai ? "badge-success" : "badge-danger"}`}>
                      {p.trangThai ? "Kinh doanh" : "Ngừng"}
                    </span>
                  </td>
                  <td className="actions">
                    <button className="btn-edit" onClick={() => handleEdit(p)} title="Chỉnh sửa">
                      Sửa
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(p.maSanPham)}
                      title="Xóa"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ProductsTab;