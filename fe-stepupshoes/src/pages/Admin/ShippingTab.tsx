import { useEffect, useState } from "react";
import { userService } from "../../services/api";
import "./ShippingTab.css";
import { useToast } from "../../context/ToastContext";

type Region = {
  maTinh: string;
  tenTinh: string;
  phi?: number;
  loai?: string;
  moTa?: string | null;
};

const ShippingTab = () => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRegion, setEditingRegion] = useState<Region | null>(null);
  const [formData, setFormData] = useState<Partial<Region>>({
    maTinh: "",
    tenTinh: "",
    phi: 0,
  });

  const { showToast } = useToast();

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getShippingRegions();
      setRegions(data || []);
    } catch (e: any) {
      setError(e.message || "Lỗi tải vùng giao hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreateForm = () => {
    setEditingRegion(null);
    setFormData({ maTinh: "", tenTinh: "", phi: 0, loai: "Tỉnh/Thành", moTa: "" });
    setShowForm(true);
  };

  const startEdit = (r: Region) => {
    setEditingRegion(r);
    setFormData({ ...r });
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingRegion(null);
    setFormData({ maTinh: "", tenTinh: "", phi: 0 });
    setError(null);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.maTinh || !formData.tenTinh) {
      setError("Vui lòng nhập mã và tên tỉnh");
      return;
    }
    setError(null);
    try {
      if (editingRegion) {
        await userService.updateShippingRegion(editingRegion.maTinh, {
          tenTinh: formData.tenTinh,
          phi: formData.phi,
          loai: formData.loai,
          moTa: formData.moTa || "",
        });
        showToast("Cập nhật vùng thành công", "success");
      } else {
        await userService.createShippingRegion({
          maTinh: formData.maTinh!,
          tenTinh: formData.tenTinh!,
          phi: formData.phi || 0,
          loai: formData.loai || "Tỉnh/Thành",
          moTa: formData.moTa || "",
        });
        showToast("Tạo vùng thành công", "success");
      }
      setShowForm(false);
      setEditingRegion(null);
      setFormData({ maTinh: "", tenTinh: "", phi: 0 });
      await load();
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : "Lỗi khi lưu vùng";
      setError(msg);
      showToast(msg, "error");
    }
  };

  const handleDelete = async (maTinh: string) => {
    if (!confirm(`Xác nhận xóa vùng ${maTinh}?`)) return;
    try {
      await userService.deleteShippingRegion(maTinh);
      showToast("Xóa vùng thành công", "success");
      await load();
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : "Lỗi khi xóa vùng";
      setError(msg);
      showToast(msg, "error");
    }
  };

  return (
    <div className="shipping-tab">
      <div className="tab-header">
        <h2>Quản lý phí ship</h2>
        <button className="btn-add" onClick={openCreateForm}>Thêm vùng mới</button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="vouchers-table-container">
        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : (
          <table className="vouchers-table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Tên</th>
                <th>Phí</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {regions.map((r) => (
                <tr key={r.maTinh}>
                  <td><span className="voucher-code">{r.maTinh}</span></td>
                  <td>{r.tenTinh}</td>
                  <td className="quantity">{r.phi ?? 0} ₫</td>
                  <td className="actions">
                    <button className="btn-edit" onClick={() => startEdit(r)}>Sửa</button>
                    <button className="btn-delete" onClick={() => handleDelete(r.maTinh)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={cancelForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingRegion ? "Chỉnh sửa vùng" : "Tạo vùng mới"}</h3>
              <button className="close-btn" onClick={cancelForm}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Mã tỉnh (maTinh):</label>
                  <input
                    type="text"
                    required
                    value={formData.maTinh || ""}
                    onChange={(e) => setFormData({ ...formData, maTinh: e.target.value })}
                    disabled={!!editingRegion}
                  />
                </div>
                <div className="form-group">
                  <label>Tên tỉnh (tenTinh):</label>
                  <input
                    type="text"
                    required
                    value={formData.tenTinh || ""}
                    onChange={(e) => setFormData({ ...formData, tenTinh: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Phí (phi):</label>
                  <input
                    type="number"
                    value={formData.phi || 0}
                    onChange={(e) => setFormData({ ...formData, phi: Number(e.target.value) })}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Loại:</label>
                    <input
                      type="text"
                      value={formData.loai || "Tỉnh/Thành"}
                      onChange={(e) => setFormData({ ...formData, loai: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Mô tả (moTa):</label>
                  <input
                    type="text"
                    value={formData.moTa || ""}
                    onChange={(e) => setFormData({ ...formData, moTa: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={cancelForm}>Hủy</button>
                <button type="submit" className="btn-save">
                  {editingRegion ? "Cập nhật" : "Tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShippingTab;