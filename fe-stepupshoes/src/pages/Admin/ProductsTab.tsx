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
  chiTietSanPham: ProductDetail;
}

const defaultForm: Partial<Product> = {
  tenSanPham: "",
  moTa: "",
  thuongHieu: "",
  maDanhMuc: 1,
  giaCoBan: 0,
  trangThai: true,
  chiTietSanPham: {
    maSKU: "",
    mauSac: "",
    size: "",
    giaBan: 0,
    soLuongTon: 0,
    trangThai: true,
    hinhAnhChinh: "",
    hinhAnhs: [],
  },
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
  const [editId, setEditId] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<number | "">("");
  const [filterStatus, setFilterStatus] = useState<boolean | "">("");
  const [imageInputs, setImageInputs] = useState<string[]>([]);
  useEffect(() => {
    if (showModal && form.chiTietSanPham?.hinhAnhs) {
      setImageInputs(form.chiTietSanPham.hinhAnhs.map((h) => h.duongDan));
    } else if (showModal) {
      setImageInputs([]);
    }
  }, [showModal, form.chiTietSanPham]);
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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
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
    setForm((prev) => ({
      ...prev,
      chiTietSanPham: {
        ...(prev.chiTietSanPham || defaultForm.chiTietSanPham!),
        [name]:
          type === "checkbox"
            ? checked
            : type === "number"
              ? Number(value)
              : value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 2) {
      return;
    }
    if (!form.tenSanPham?.trim()) {
      showToast("Vui lòng nhập tên sản phẩm", "warning");
      return;
    }
    if (!form.chiTietSanPham?.maSKU?.trim()) {
      showToast("Vui lòng nhập SKU cho sản phẩm", "warning");
      return;
    }
    if (
      !form.chiTietSanPham?.mauSac?.trim() ||
      !form.chiTietSanPham?.size?.trim()
    ) {
      showToast("Vui lòng nhập đầy đủ màu sắc và size", "warning");
      return;
    }
    const hinhAnhs: HinhAnhChiTietDTO[] = imageInputs
      .filter((url) => url.trim() !== "")
      .map((url, idx) => ({
        duongDan: url,
        thuTu: idx + 1,
        laAnhChinh: false,
      }));
    const submitForm = {
      ...form,
      chiTietSanPham: {
        ...(form.chiTietSanPham || {}),
        hinhAnhs,
      },
    };
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
    } catch (error) {
      showToast("Có lỗi xảy ra. Vui lòng thử lại!", "error");
    }
    setLoading(false);
  };

  const handleEdit = (product: Product) => {
    setForm({
      ...product,
      chiTietSanPham: product.chiTietSanPham || defaultForm.chiTietSanPham!,
    });
    setEditId(product.maSanPham);
    setCurrentStep(1);
    setShowModal(true);
    setImageInputs(
      product.chiTietSanPham?.hinhAnhs?.map((h) => h.duongDan) || [],
    );
  };

  const handleDelete = async (id: number) => {
    if (
      !window.confirm(
        "Bạn có chắc muốn xóa sản phẩm này? Hành động này không thể hoàn tác.",
      )
    )
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
            setFilterCategory(
              e.target.value === "" ? "" : Number(e.target.value),
            )
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
            setFilterStatus(
              e.target.value === "" ? "" : e.target.value === "true",
            )
          }
        >
          <option value="">Tất cả trạng thái</option>
          <option value="true">Đang kinh doanh</option>
          <option value="false">Ngừng kinh doanh</option>
        </select>
      </div>

      <div className="results-info">
        Hiển thị <strong>{filteredProducts.length}</strong> / {products.length}{" "}
        sản phẩm
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal-content-improved"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>{editId ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</h3>
              <button className="close-btn" onClick={closeModal}>
                ✕
              </button>
            </div>

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
                if (e.key === "Enter" && currentStep < 2) {
                  e.preventDefault();
                }
              }}
            >
              {currentStep === 1 && (
                <div className="form-step">
                  <div className="form-group">
                    <label>
                      Tên sản phẩm <span className="required">*</span>
                    </label>
                    <input
                      name="tenSanPham"
                      value={form.tenSanPham || ""}
                      onChange={handleInputChange}
                      placeholder="Nhập tên sản phẩm"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Thương hiệu</label>
                      <input
                        name="thuongHieu"
                        value={form.thuongHieu || ""}
                        onChange={handleInputChange}
                        placeholder="Nhập thương hiệu"
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        Danh mục <span className="required">*</span>
                      </label>
                      <select
                        name="maDanhMuc"
                        value={form.maDanhMuc || ""}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">-- Chọn danh mục --</option>
                        {categories.map((cat) => (
                          <option key={cat.maDanhMuc} value={cat.maDanhMuc}>
                            {cat.tenDanhMuc}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Mô tả sản phẩm</label>
                    <textarea
                      name="moTa"
                      value={form.moTa || ""}
                      onChange={handleInputChange}
                      placeholder="Nhập mô tả chi tiết về sản phẩm"
                      rows={4}
                    />
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

              {currentStep === 2 && (
                <div className="form-step">
                  <h4>Chi tiết sản phẩm</h4>

                  <div className="detail-form-single">
                    <div className="form-row">
                      <div className="form-group">
                        <label>
                          SKU <span className="required">*</span>
                        </label>
                        <input
                          name="maSKU"
                          value={form.chiTietSanPham?.maSKU || ""}
                          onChange={handleDetailChange}
                          placeholder="VD: SP001-RED-M"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>
                          Màu sắc <span className="required">*</span>
                        </label>
                        <input
                          name="mauSac"
                          value={form.chiTietSanPham?.mauSac || ""}
                          onChange={handleDetailChange}
                          placeholder="VD: Đỏ"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>
                          Size <span className="required">*</span>
                        </label>
                        <input
                          name="size"
                          value={form.chiTietSanPham?.size || ""}
                          onChange={handleDetailChange}
                          placeholder="VD: M, L, XL"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>
                          Giá bán (VNĐ) <span className="required">*</span>
                        </label>
                        <input
                          name="giaBan"
                          type="number"
                          value={form.chiTietSanPham?.giaBan || 0}
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
                          value={form.chiTietSanPham?.soLuongTon || 0}
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
                            checked={form.chiTietSanPham?.trangThai ?? true}
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
                        value={form.chiTietSanPham?.hinhAnhChinh || ""}
                        onChange={handleDetailChange}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <div className="form-group">
                      <label>Ảnh phụ (URL, có thể nhiều)</label>
                      {imageInputs.map((url, idx) => (
                        <div
                          key={idx}
                          style={{ display: "flex", gap: 8, marginBottom: 4 }}
                        >
                          <input
                            type="text"
                            value={url}
                            onChange={(e) =>
                              handleImageInputChange(idx, e.target.value)
                            }
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
                      <button
                        type="button"
                        className="add-image-btn"
                        onClick={handleAddImageInput}
                      >
                        + Thêm ảnh phụ
                      </button>
                    </div>

                    {/* Preview */}
                    {form.chiTietSanPham && (
                      <div className="detail-preview">
                        <h5>Xem trước chi tiết sản phẩm</h5>
                        <div className="preview-card">
                          <div className="preview-header">
                            <span className="preview-sku">
                              {form.chiTietSanPham.maSKU || "SKU chưa có"}
                            </span>
                            <span
                              className={`preview-status ${form.chiTietSanPham.trangThai ? "active" : "inactive"}`}
                            >
                              {form.chiTietSanPham.trangThai
                                ? "● Còn hàng"
                                : "○ Hết hàng"}
                            </span>
                          </div>
                          <div className="preview-details">
                            <div className="preview-item">
                              <span className="preview-label">Màu sắc:</span>
                              <strong>
                                {form.chiTietSanPham.mauSac || "-"}
                              </strong>
                            </div>
                            <div className="preview-item">
                              <span className="preview-label">Size:</span>
                              <strong>{form.chiTietSanPham.size || "-"}</strong>
                            </div>
                            <div className="preview-item">
                              <span className="preview-label">Giá bán:</span>
                              <strong>
                                {form.chiTietSanPham.giaBan?.toLocaleString() ||
                                  0}{" "}
                                đ
                              </strong>
                            </div>
                            <div className="preview-item">
                              <span className="preview-label">Tồn kho:</span>
                              <strong>
                                {form.chiTietSanPham.soLuongTon || 0}
                              </strong>
                            </div>
                          </div>
                          {form.chiTietSanPham.hinhAnhChinh && (
                            <div className="preview-image">
                              <img
                                src={form.chiTietSanPham.hinhAnhChinh}
                                alt="Preview"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display =
                                    "none";
                                }}
                              />
                            </div>
                          )}
                          {imageInputs.length > 0 && (
                            <div style={{ marginTop: 8 }}>
                              <div>Ảnh phụ:</div>
                              <div
                                style={{
                                  display: "flex",
                                  gap: 8,
                                  flexWrap: "wrap",
                                }}
                              >
                                {imageInputs.map((url, idx) =>
                                  url ? (
                                    <img
                                      key={idx}
                                      src={url}
                                      alt={`Ảnh phụ #${idx + 1}`}
                                      style={{
                                        width: 60,
                                        height: 60,
                                        objectFit: "cover",
                                        borderRadius: 4,
                                        border: "1px solid #eee",
                                      }}
                                      onError={(e) => {
                                        (
                                          e.target as HTMLImageElement
                                        ).style.display = "none";
                                      }}
                                    />
                                  ) : null,
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Form actions */}
              <div className="form-actions">
                {currentStep > 1 && (
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={prevStep}
                  >
                    ← Quay lại
                  </button>
                )}
                {currentStep < 2 ? (
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={(e) => {
                      e.preventDefault();
                      nextStep();
                    }}
                  >
                    Tiếp theo →
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                  >
                    {loading
                      ? "Đang xử lý..."
                      : editId
                        ? "Cập nhật sản phẩm"
                        : "Tạo sản phẩm"}
                  </button>
                )}
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={closeModal}
                >
                  Hủy
                </button>
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
                <th>SKU</th>
                <th>Màu</th>
                <th>Size</th>

                <th>Giá bán</th>
                <th>Tồn kho</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p.maSanPham}>
                  <td>
                    {p.chiTietSanPham?.hinhAnhChinh ? (
                      <img
                        src={p.chiTietSanPham.hinhAnhChinh}
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
                    <span className="sku-badge">
                      {p.chiTietSanPham?.maSKU || "-"}
                    </span>
                  </td>
                  <td>
                    <div className="variant-info-cell">
                      <span>{p.chiTietSanPham?.mauSac || "-"}</span>
                    </div>
                  </td>
                  <td>
                    <div className="variant-info-cell">
                      <span>{p.chiTietSanPham?.size || "-"}</span>
                    </div>
                  </td>
                  <td className="price-cell">
                    {p.chiTietSanPham?.giaBan?.toLocaleString() || 0} đ
                  </td>
                  <td>
                    <span
                      className={`stock-badge ${(p.chiTietSanPham?.soLuongTon || 0) > 0 ? "in-stock" : "out-of-stock"}`}
                    >
                      {p.chiTietSanPham?.soLuongTon || 0}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${p.trangThai ? "badge-success" : "badge-danger"}`}
                    >
                      {p.trangThai ? "Kinh doanh" : "Ngừng"}
                    </span>
                  </td>
                  <td className="actions">
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(p)}
                      title="Chỉnh sửa"
                    >
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
