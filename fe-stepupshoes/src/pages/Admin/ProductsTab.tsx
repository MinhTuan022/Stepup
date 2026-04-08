import { useEffect, useState } from "react";
import { useToast } from "../../context/ToastContext";
import { adminService } from "../../services/api";
import "./ProductsTab.css";
// import "../../../../stepupshoes/"

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
// ...existing code...

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
  const [imageFiles, setImageFiles] = useState<(File | null)[]>([]);
  const [removedVariantIds, setRemovedVariantIds] = useState<number[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (showModal && form.chiTietSanPhams && form.chiTietSanPhams[variantIndex]?.hinhAnhs) {
      setImageInputs(form.chiTietSanPhams[variantIndex].hinhAnhs!.map((h) => h.duongDan));
      setImageFiles(form.chiTietSanPhams[variantIndex].hinhAnhs!.map(() => null));
    } else if (showModal) {
      setImageInputs([]);
      setImageFiles([]);
    }
  }, [showModal, form.chiTietSanPhams, variantIndex]);

  const handleAddImageInput = () => {
    setImageInputs((prev) => [...prev, ""]);
    setImageFiles((prev) => [...prev, null]);
  };
  const handleRemoveImageInput = (idx: number) => {
    setImageInputs((prev) => prev.filter((_, i) => i !== idx));
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
  };
  const handleImageInputChange = (idx: number, value: string) =>
    setImageInputs((prev) => prev.map((v, i) => (i === idx ? value : v)));

  const handleFileChange = (idx: number, file: File | null) => {
    // If file is null, just clear selection
    if (!file) {
      setImageFiles((prev) => {
        const arr = [...prev];
        arr[idx] = null;
        return arr;
      });
      return;
    }

    // Immediately upload selected file and set URL into imageInputs
    setImageFiles((prev) => {
      const arr = [...prev];
      arr[idx] = file;
      return arr;
    });

    const fd = new FormData();
    fd.append("file", file);
    (async () => {
      setLoading(true);
      try {
        const url = await adminService.uploadImage(fd);
        setImageInputs((prev) => {
          const arr = [...prev];
          arr[idx] = url;
          return arr;
        });
        setImageFiles((prev) => {
          const arr = [...prev];
          arr[idx] = null;
          return arr;
        });
        showToast("Upload ảnh thành công", "success");
      } catch (err) {
        showToast("Upload ảnh thất bại", "error");
      }
      setLoading(false);
    })();
  };

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
        [name]: type === "checkbox" ? checked : type === "number" ? (value === '' ? undefined : Number(value)) : value,
      };
      return { ...prev, chiTietSanPhams: variants };
    });
  };

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.tenSanPham?.trim()) errs.tenSanPham = "Vui lòng nhập tên sản phẩm";
    if (form.giaCoBan !== undefined && form.giaCoBan < 0) errs.giaCoBan = "Giá cơ bản không được âm";
    if (!form.chiTietSanPhams || form.chiTietSanPhams.length === 0) {
      showToast("Vui lòng thêm ít nhất một biến thể sản phẩm", "warning");
      setFormErrors(errs);
      return false;
    }
    for (let i = 0; i < form.chiTietSanPhams.length; i++) {
      const v = form.chiTietSanPhams[i];
      if (!v.maSKU?.trim()) errs[`variant_${i}_maSKU`] = "Vui lòng nhập SKU";
      if (!v.mauSac?.trim()) errs[`variant_${i}_mauSac`] = "Vui lòng nhập màu sắc";
      if (!v.size?.trim()) errs[`variant_${i}_size`] = "Vui lòng nhập size";
      if (v.giaBan < 0) errs[`variant_${i}_giaBan`] = "Giá bán không được âm";
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmitProduct = async () => {
    // Chỉ được gọi từ nút "Cập nhật" ở bước 2
    if (currentStep !== 2) return;
    
    if (!validateForm()) return;

    // Nếu có file chưa được upload, upload trước
    for (let i = 0; i < imageFiles.length; i++) {
      if (imageFiles[i]) {
        try {
          setLoading(true);
          const fd = new FormData();
          fd.append('file', imageFiles[i] as File);
          const url = await adminService.uploadImage(fd);
          setImageInputs((prev) => {
            const arr = [...prev];
            arr[i] = url;
            return arr;
          });
          handleFileChange(i, null);
        } catch (err) {
          showToast('Upload ảnh thất bại', 'error');
          setLoading(false);
          return;
        }
        setLoading(false);
      }
    }

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
        // First delete any removed variant IDs on the server
        if (removedVariantIds && removedVariantIds.length > 0) {
          await Promise.all(
            removedVariantIds.map(async (id) => {
              try {
                await adminService.deleteChiTietSanPham(id);
              } catch (err) {
                // Ignore errors when the variant is already deleted on server
                console.warn(`Ignore delete variant ${id} error:`, err);
              }
            }),
          );
        }

        await adminService.updateProduct(editId, submitForm);
        showToast("Cập nhật sản phẩm thành công!", "success");
      } else {
        await adminService.createProduct(submitForm);
        showToast("Thêm sản phẩm thành công!", "success");
      }
      // clear removed IDs after successful save
      setRemovedVariantIds([]);
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
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này? "))
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

  const handleToggleStatus = async (product: Product) => {
    if (!product) return;
    const newStatus = !product.trangThai;
    setLoading(true);
    try {
      await adminService.updateProduct(product.maSanPham, { ...product, trangThai: newStatus });
      showToast('Cập nhật trạng thái sản phẩm thành công', 'success');
      fetchProducts();
    } catch (err) {
      console.error('Lỗi khi cập nhật trạng thái sản phẩm:', err);
      showToast('Không thể cập nhật trạng thái sản phẩm', 'error');
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
              noValidate
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
                      onChange={(e) => { handleInputChange(e); setFormErrors(prev => ({ ...prev, tenSanPham: '' })); }}
                      placeholder="Nhập tên sản phẩm"
                      className={formErrors.tenSanPham ? "input-error" : ""}
                    />
                    {formErrors.tenSanPham && <span className="field-error">{formErrors.tenSanPham}</span>}
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
                        value={form.giaCoBan ?? ''}
                        onChange={(e) => { handleInputChange(e); setFormErrors(prev => ({ ...prev, giaCoBan: '' })); }}
                        placeholder="0"
                        min="0"
                        className={formErrors.giaCoBan ? "input-error" : ""}
                      />
                      {formErrors.giaCoBan && <span className="field-error">{formErrors.giaCoBan}</span>}
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
                      {form.chiTietSanPhams?.map((_, idx) => (
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
                          setForm((prev) => {
                            const newVariants = [...(prev.chiTietSanPhams || []), { ...defaultVariant }];
                            const newIndex = newVariants.length - 1;
                            setVariantIndex(newIndex);
                            setImageInputs([]);
                            return { ...prev, chiTietSanPhams: newVariants };
                          });
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
                                const [removed] = variants.splice(variantIndex, 1);
                                if (removed && removed.maChiTiet) {
                                  setRemovedVariantIds((ids) => [...ids, removed.maChiTiet!]);
                                }
                                const newIndex = variants.length > 0 ? Math.min(variantIndex, variants.length - 1) : 0;
                                const newImageInputs = variants[newIndex]?.hinhAnhs
                                  ? variants[newIndex].hinhAnhs.map((h) => h.duongDan)
                                  : [];
                                setVariantIndex(newIndex);
                                setImageInputs(newImageInputs);
                                return { ...prev, chiTietSanPhams: variants };
                              });
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
                          onChange={(e) => { handleDetailChange(e); setFormErrors(prev => ({ ...prev, [`variant_${variantIndex}_maSKU`]: '' })); }}
                          placeholder="VD: SP001-RED-M"
                          className={formErrors[`variant_${variantIndex}_maSKU`] ? "input-error" : ""}
                        />
                        {formErrors[`variant_${variantIndex}_maSKU`] && <span className="field-error">{formErrors[`variant_${variantIndex}_maSKU`]}</span>}
                      </div>
                      <div className="form-group">
                        <label>Màu sắc <span className="required">*</span></label>
                        <input
                          name="mauSac"
                          value={form.chiTietSanPhams?.[variantIndex]?.mauSac || ""}
                          onChange={(e) => { handleDetailChange(e); setFormErrors(prev => ({ ...prev, [`variant_${variantIndex}_mauSac`]: '' })); }}
                          placeholder="VD: Đỏ"
                          className={formErrors[`variant_${variantIndex}_mauSac`] ? "input-error" : ""}
                        />
                        {formErrors[`variant_${variantIndex}_mauSac`] && <span className="field-error">{formErrors[`variant_${variantIndex}_mauSac`]}</span>}
                      </div>
                      <div className="form-group">
                        <label>Size <span className="required">*</span></label>
                        <input
                          name="size"
                          value={form.chiTietSanPhams?.[variantIndex]?.size || ""}
                          onChange={(e) => { handleDetailChange(e); setFormErrors(prev => ({ ...prev, [`variant_${variantIndex}_size`]: '' })); }}
                          placeholder="VD: M, L, XL"
                          className={formErrors[`variant_${variantIndex}_size`] ? "input-error" : ""}
                        />
                        {formErrors[`variant_${variantIndex}_size`] && <span className="field-error">{formErrors[`variant_${variantIndex}_size`]}</span>}
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Giá bán (VNĐ) <span className="required">*</span></label>
                        <input
                          name="giaBan"
                          type="number"
                          value={form.chiTietSanPhams?.[variantIndex]?.giaBan ?? ''}
                          onChange={(e) => { handleDetailChange(e); setFormErrors(prev => ({ ...prev, [`variant_${variantIndex}_giaBan`]: '' })); }}
                          placeholder="0"
                          min="0"
                          className={formErrors[`variant_${variantIndex}_giaBan`] ? "input-error" : ""}
                        />
                        {formErrors[`variant_${variantIndex}_giaBan`] && <span className="field-error">{formErrors[`variant_${variantIndex}_giaBan`]}</span>}
                      </div>
                      <div className="form-group">
                        <label>Số lượng tồn</label>
                        <input
                          name="soLuongTon"
                          type="number"
                          value={form.chiTietSanPhams?.[variantIndex]?.soLuongTon ?? ''}
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
                      <div className="main-image-field">
                        {/* <input
                          name="hinhAnhChinh"
                          value={form.chiTietSanPhams?.[variantIndex]?.hinhAnhChinh || ""}
                          onChange={handleDetailChange}
                          placeholder="https://example.com/image.jpg"
                          style={{ flex: 1 }}
                        /> */}
                        <input
                          className="main-image-url"
                          type="text"
                          readOnly
                          title={
                            form.chiTietSanPhams?.[variantIndex]?.hinhAnhChinh
                              ? `http://localhost:8080${form.chiTietSanPhams[variantIndex]!.hinhAnhChinh}`
                              : ""
                          }
                          value={
                            form.chiTietSanPhams?.[variantIndex]?.hinhAnhChinh
                              ? `${form.chiTietSanPhams[variantIndex]!.hinhAnhChinh}`
                              : ""
                          }
                          placeholder="Chưa có ảnh chính"
                        />
                        <input
                          className="main-image-file-input"
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            setLoading(true);
                            try {
                              const fd = new FormData();
                              fd.append('file', f);
                              const url = await adminService.uploadImage(fd);
                              setForm((prev) => {
                                const variants = prev.chiTietSanPhams ? [...prev.chiTietSanPhams] : [{ ...defaultVariant }];
                                variants[variantIndex] = {
                                  ...variants[variantIndex],
                                  hinhAnhChinh: url,
                                };
                                return { ...prev, chiTietSanPhams: variants };
                              });
                              showToast('Upload ảnh chính thành công', 'success');
                            } catch (err) {
                              showToast('Upload ảnh thất bại', 'error');
                            }
                            setLoading(false);
                          }}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Ảnh phụ (URL, có thể nhiều)</label>
                      {imageInputs.map((url, idx) => (
                        <div key={idx} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: 'center' }}>
                          <input
                            className="main-image-url"
                            type="text"
                            value={url}
                            onChange={(e) => handleImageInputChange(idx, e.target.value)}
                            placeholder={`URL ảnh phụ #${idx + 1}`}
                            style={{ flex: 1 }}
                          />
                          <input
                          className="main-image-file-input"

                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(idx, e.target.files?.[0] ?? null)}
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
                                  src={`http://localhost:8080${form.chiTietSanPhams[variantIndex]?.hinhAnhChinh}`}
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
                                        src={`http://localhost:8080${url}`}
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
                        src={`http://localhost:8080${p.chiTietSanPhams[0].hinhAnhChinh}`}
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
                      <div className="variant-list">
                        {p.chiTietSanPhams.map((v, idx) => {
                          const thumb = v.hinhAnhChinh ? `http://localhost:8080${v.hinhAnhChinh}` : ''
                          return (
                            <div className="variant-chip" key={idx}>
                              <div className="variant-thumb">
                                {thumb ? (
                                  <img
                                    src={thumb}
                                    alt={v.maSKU}
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                                  />
                                ) : (
                                  <div className="no-thumb">—</div>
                                )}
                              </div>
                              <div className="variant-info">
                                <div className="variant-top">
                                  <span className="sku-badge">{v.maSKU}</span>
                                  <span className="variant-price">{(v.giaBan || 0).toLocaleString('vi-VN')} ₫</span>
                                </div>
                                <div className="variant-bottom">
                                  <span
                                    className="variant-swatch"
                                    title={v.mauSac}
                                    style={{ backgroundColor: v.mauSac || 'transparent' }}
                                  />
                                  <span className="variant-size">{v.size}</span>
                                  <span className={`variant-stock ${v.soLuongTon > 0 ? 'in' : 'out'}`}>{v.soLuongTon} tồn</span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${p.trangThai ? "badge-success" : "badge-danger"}`}>
                      {p.trangThai ? "Kinh doanh" : "Ngừng"}
                    </span>
                  </td>
                  <td className="action-view">
                    <button className="btn-edit" onClick={() => handleEdit(p)} title="Chỉnh sửa">
                      Sửa
                    </button>
                    <button
                      className={`btn-toggle ${p.trangThai ? 'active' : 'inactive'}`}
                      onClick={() => handleToggleStatus(p)}
                      title={p.trangThai ? 'Ngừng kinh doanh' : 'Bán lại'}
                    >
                      {p.trangThai ? 'Ngừng' : 'Kinh doanh'}
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