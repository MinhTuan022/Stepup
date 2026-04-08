import { useState, useEffect } from "react";
import { adminService } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import "./DanhMucTab.css";

interface DanhMuc {
  maDanhMuc: number;
  tenDanhMuc: string;
  moTa: string;
  maDanhMucCha?: number | null;
  trangThai?: boolean;
}

interface DanhMucNode extends DanhMuc {
  children: DanhMucNode[];
  level: number;
}

const DanhMucTab = () => {
  const { showToast } = useToast();
  const [danhMucs, setDanhMucs] = useState<DanhMuc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingDanhMuc, setEditingDanhMuc] = useState<DanhMuc | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());
  const [formData, setFormData] = useState<Partial<DanhMuc>>({
    tenDanhMuc: "",
    moTa: "",
    maDanhMucCha: null,
    trangThai: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchDanhMucs();
  }, []);

  const fetchDanhMucs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getAllCategories();
      setDanhMucs(data || []);
      // Mở tất cả nodes mặc định
      const allIds: Set<number> = new Set<number>(
        (data || []).map((dm: DanhMuc) => dm.maDanhMuc),
      );
      setExpandedNodes(allIds);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Lỗi khi tải danh mục";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  // Chuyển danh sách phẳng thành cây
  const buildTree = (items: DanhMuc[]): DanhMucNode[] => {
    const map = new Map<number, DanhMucNode>();
    const roots: DanhMucNode[] = [];

    // Tạo nodes
    items.forEach((item) => {
      map.set(item.maDanhMuc, { ...item, children: [], level: 0 });
    });

    items.forEach((item) => {
      const node = map.get(item.maDanhMuc)!;
      if (item.maDanhMucCha && map.has(item.maDanhMucCha)) {
        const parent = map.get(item.maDanhMucCha)!;
        node.level = parent.level + 1;
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  const flattenTree = (nodes: DanhMucNode[]): DanhMucNode[] => {
    const result: DanhMucNode[] = [];
    const traverse = (nodeList: DanhMucNode[]) => {
      nodeList.forEach((node) => {
        result.push(node);
        if (expandedNodes.has(node.maDanhMuc) && node.children.length > 0) {
          traverse(node.children);
        }
      });
    };
    traverse(nodes);
    return result;
  };

  const toggleExpand = (maDanhMuc: number) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(maDanhMuc)) {
        newSet.delete(maDanhMuc);
      } else {
        newSet.add(maDanhMuc);
      }
      return newSet;
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    let fieldValue: any = value;
    if (type === "checkbox" && "checked" in e.target) {
      fieldValue = (e.target as HTMLInputElement).checked;
    } else if (name === "maDanhMucCha") {
      fieldValue = value === "" ? null : Number(value);
    }
    setFormData((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errs: Record<string, string> = {};
    if (!formData.tenDanhMuc?.trim()) errs.tenDanhMuc = "Vui lòng nhập tên danh mục";
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      if (editingDanhMuc) {
        await adminService.updateCategory(editingDanhMuc.maDanhMuc, formData);
        showToast("Cập nhật danh mục thành công", "success");
      } else {
        await adminService.createCategory(formData);
        showToast("Thêm danh mục thành công", "success");
      }
      setShowForm(false);
      setEditingDanhMuc(null);
      setFormData({ tenDanhMuc: "", moTa: "", trangThai: true });
      fetchDanhMucs();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Lỗi khi lưu danh mục";
      setError(msg);
      showToast(msg, "error");
    }
  };

  const handleEdit = (danhMuc: DanhMuc) => {
    setEditingDanhMuc(danhMuc);
    setFormData({
      tenDanhMuc: danhMuc.tenDanhMuc,
      moTa: danhMuc.moTa,
      maDanhMucCha: danhMuc.maDanhMucCha ?? null,
      trangThai: danhMuc.trangThai,
    });
    setShowForm(true);
  };

  const handleDelete = async (maDanhMuc: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa danh mục này?")) return;
    try {
      await adminService.deleteCategory(maDanhMuc);
      showToast("Xóa danh mục thành công", "success");
      fetchDanhMucs();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Lỗi khi xóa danh mục";
      setError(msg);
      showToast(msg, "error");
    }
  };

  const tree = buildTree(danhMucs);
  const flatList = flattenTree(tree);

  return (
    <div className="danhmuc-tab">
      <div className="tab-header">
        <h2>Quản lý danh mục</h2>
        <button
          className="btn-add"
          onClick={() => {
            setShowForm(true);
            setEditingDanhMuc(null);
            setFormData({ tenDanhMuc: "", moTa: "", trangThai: true });
          }}
        >
          Thêm danh mục
        </button>
      </div>

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="danhmuc-tree-container">
          <table className="danhmuc-table">
            <thead>
              <tr>
                <th style={{ width: "40%" }}>Tên danh mục</th>
                <th style={{ width: "30%" }}>Mô tả</th>
                <th style={{ width: "10%", textAlign: "center" }}>
                  Trạng thái
                </th>
                <th style={{ width: "20%", textAlign: "center" }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {flatList.map((node) => {
                const hasChildren = node.children.length > 0;
                const isExpanded = expandedNodes.has(node.maDanhMuc);
                const indent = node.level * 32;

                return (
                  <tr
                    key={node.maDanhMuc}
                    className={`tree-row level-${node.level}`}
                  >
                    <td>
                      <div
                        className="tree-cell"
                        style={{ paddingLeft: `${indent}px` }}
                      >
                        {hasChildren && (
                          <button
                            className="expand-btn"
                            onClick={() => toggleExpand(node.maDanhMuc)}
                            title={isExpanded ? "Thu gọn" : "Mở rộng"}
                          >
                            {isExpanded ? "▼" : "▶"}
                          </button>
                        )}
                        {!hasChildren && <span className="no-expand"></span>}
                        <span className="category-icon"></span>
                        <span className="category-name">{node.tenDanhMuc}</span>
                        <span className="category-id">#{node.maDanhMuc}</span>
                      </div>
                    </td>
                    <td>
                      <div className="category-desc">{node.moTa}</div>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <span
                        className={`status-badge ${node.trangThai ? "active" : "inactive"}`}
                      >
                        {node.trangThai ? "Hoạt động" : "Ẩn"}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-edit"
                          onClick={() => handleEdit(node)}
                          title="Sửa"
                        >
                          Sửa
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(node.maDanhMuc)}
                          title="Xóa"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="modal">
          <div
            className="modal-overlay"
            onClick={() => setShowForm(false)}
          ></div>
          <form className="danhmuc-form" onSubmit={handleSubmit} noValidate>
            <h3>
              {editingDanhMuc ? "Cập nhật danh mục" : "Thêm danh mục"}
            </h3>

            <div className="form-group">
              <label htmlFor="tenDanhMuc">
                Tên danh mục <span className="required">*</span>
              </label>
              <input
                id="tenDanhMuc"
                name="tenDanhMuc"
                value={formData.tenDanhMuc || ""}
                onChange={(e) => { handleInputChange(e); setFormErrors(prev => ({ ...prev, tenDanhMuc: '' })); }}
                placeholder="Nhập tên danh mục"
                className={formErrors.tenDanhMuc ? "input-error" : ""}
              />
              {formErrors.tenDanhMuc && <span className="field-error">{formErrors.tenDanhMuc}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="moTa">Mô tả</label>
              <textarea
                id="moTa"
                name="moTa"
                value={formData.moTa || ""}
                onChange={handleInputChange}
                placeholder="Nhập mô tả cho danh mục"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="maDanhMucCha">Danh mục cha</label>
              <select
                id="maDanhMucCha"
                name="maDanhMucCha"
                value={formData.maDanhMucCha ?? ""}
                onChange={handleInputChange}
              >
                <option value="">-- Không có (Danh mục gốc) --</option>
                {danhMucs
                  .filter(
                    (dm) =>
                      !editingDanhMuc ||
                      dm.maDanhMuc !== editingDanhMuc.maDanhMuc,
                  )
                  .map((dm) => {
                    const parent = dm.maDanhMucCha
                      ? danhMucs.find((d) => d.maDanhMuc === dm.maDanhMucCha)
                      : null;
                    const prefix = parent ? `└─ ` : "";
                    return (
                      <option key={dm.maDanhMuc} value={dm.maDanhMuc}>
                        {prefix}
                        {dm.tenDanhMuc}
                      </option>
                    );
                  })}
              </select>
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="trangThai"
                  checked={!!formData.trangThai}
                  onChange={handleInputChange}
                />
                <span>Kích hoạt danh mục</span>
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-submit">
                 Lưu
              </button>
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setShowForm(false)}
              >
                 Hủy
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default DanhMucTab;
