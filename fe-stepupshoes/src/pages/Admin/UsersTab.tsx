import { useState, useEffect } from "react";
import { adminService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import "./UsersTab.css";

interface User {
  maNguoiDung: number;
  tenDangNhap: string;
  hoTen: string;
  email: string;
  soDienThoai: string;
  diaChi: string;
  vaiTro: string;
  matKhau: string;
  trangThai: boolean;
}

const UsersTab = () => {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState<Partial<User>>({
    tenDangNhap: "",
    hoTen: "",
    email: "",
    soDienThoai: "",
    diaChi: "",
    vaiTro: "khach_hang",
    matKhau: "",
  });

  useEffect(() => {
    fetchUsers();
  }, [page, pageSize]);

  useEffect(() => {
    let result = [...users];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (u) =>
          u.tenDangNhap.toLowerCase().includes(term) ||
          u.hoTen.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term)
      );
    }
    if (filterRole) {
      result = result.filter((u) => u.vaiTro === filterRole);
    }
    if (filterStatus) {
      result = result.filter((u) =>
        filterStatus === "active" ? u.trangThai : !u.trangThai
      );
    }
    setFilteredUsers(result);
  }, [users, searchTerm, filterRole, filterStatus]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getAllUsers(page, pageSize);
      setUsers(data.users || []);
      setTotalPages(data.totalPages || 0);
      setTotalUsers(data.totalUsers || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    try {
      await adminService.updateUser(editingUser.maNguoiDung, editingUser);
      showToast("Cập nhật người dùng thành công", "success");
      setShowEditModal(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Lỗi khi cập nhật";
      setError(message);
      showToast(message, "error");
    }
  };

  const handleLockUser = async (id: number) => {
    if (!confirm("Bạn có chắc muốn khóa tài khoản này?")) return;
    try {
      await adminService.lockUser(id);
      showToast("Khóa tài khoản thành công", "success");
      fetchUsers();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Lỗi khi khóa tài khoản";
      setError(message);
      showToast(message, "error");
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (
      !confirm(
        "Bạn có chắc muốn xóa tài khoản này? ",
      )
    )
      return;
    try {
      await adminService.deleteUser(id);
      showToast("Xóa tài khoản thành công", "success");
      fetchUsers();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Lỗi khi xóa tài khoản";
      setError(message);
      showToast(message, "error");
    }
  };

  const handleAddUser = async () => {
    if (
      !newUser.tenDangNhap ||
      !newUser.hoTen ||
      !newUser.email ||
      !newUser.matKhau
    ) {
      showToast("Vui lòng điền đầy đủ thông tin", "warning");
      return;
    }
    try {
      await adminService.createUser(newUser as User);
      showToast("Tạo tài khoản thành công", "success");
      setShowAddModal(false);
      setNewUser({
        tenDangNhap: "",
        hoTen: "",
        email: "",
        soDienThoai: "",
        diaChi: "",
        vaiTro: "khach_hang",
        matKhau: "",
      });
      fetchUsers();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Lỗi khi tạo tài khoản";
      setError(message);
      showToast(message, "error");
    }
  };


  if (loading) return <div className="loading">Đang tải dữ liệu...</div>;
  if (error) return <div className="error">Lỗi: {error}</div>;


  return (
    <div className="users-tab">
      <div className="tab-header">
        <div>
          <h2>Quản lý người dùng</h2>
          <p>Tổng số người dùng: {totalUsers}</p>
        </div>
        {currentUser?.vaiTro === "quan_tri" && (
          <button
            className="btn-add-user"
            onClick={() => setShowAddModal(true)}
          >
            Thêm người dùng
          </button>
        )}
      </div>

      {/* Bộ lọc và tìm kiếm */}
      <div className="users-filters">
        <input
          className="users-search-input"
          type="text"
          placeholder="Tìm kiếm tên đăng nhập, họ tên, email..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select
          className="users-role-select"
          value={filterRole}
          onChange={e => setFilterRole(e.target.value)}
        >
          <option value="">Tất cả vai trò</option>
          <option value="khach_hang">Khách hàng</option>
          <option value="nhan_vien">Nhân viên</option>
          <option value="quan_tri">Quản trị viên</option>
        </select>
        <select
          className="users-status-select"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Bị khóa</option>
        </select>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên đăng nhập</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Điện thoại</th>
              <th>Vai trò</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.maNguoiDung}>
                <td>{user.maNguoiDung}</td>
                <td>{user.tenDangNhap}</td>
                <td>{user.hoTen}</td>
                <td>{user.email}</td>
                <td>{user.soDienThoai}</td>
                <td>
                  <span className={`role-badge role-${user.vaiTro}`}>
                    {user.vaiTro === "quan_tri"
                      ? "Quản trị viên"
                      : user.vaiTro === "khach_hang"
                        ? "Khách hàng"
                        : user.vaiTro === "nhan_vien"
                          ? "Nhân viên"
                          : ""}
                  </span>
                </td>
                <td className="actions">
                  <button className="btn-edit" onClick={() => handleEdit(user)}>
                    Sửa
                  </button>
                  {user.maNguoiDung !== currentUser?.maNguoiDung && (
                    <>
                      <button
                        className="btn-lock"
                        onClick={() => handleLockUser(user.maNguoiDung)}
                      >
                        {user.trangThai ? "Khóa" : "Mở khóa"}
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteUser(user.maNguoiDung)}
                      >
                        Xóa
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button
          onClick={() => setPage(Math.max(0, page - 1))}
          disabled={page === 0}
        >
          ← Trước
        </button>
        <span>
          Trang {page + 1} / {totalPages}
        </span>
        <button
          onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
          disabled={page >= totalPages - 1}
        >
          Sau →
        </button>
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Thêm người dùng mới</h3>
              <button
                className="close-btn"
                onClick={() => setShowAddModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Tên đăng nhập:</label>
                <input
                  type="text"
                  value={newUser.tenDangNhap || ""}
                  onChange={(e) =>
                    setNewUser({ ...newUser, tenDangNhap: e.target.value })
                  }
                  placeholder="Nhập tên đăng nhập"
                />
              </div>
              <div className="form-group">
                <label>Mật khẩu:</label>
                <input
                  type="password"
                  value={newUser.matKhau || ""}
                  onChange={(e) =>
                    setNewUser({ ...newUser, matKhau: e.target.value })
                  }
                  placeholder="Nhập mật khẩu"
                />
              </div>
              <div className="form-group">
                <label>Họ tên:</label>
                <input
                  type="text"
                  value={newUser.hoTen || ""}
                  onChange={(e) =>
                    setNewUser({ ...newUser, hoTen: e.target.value })
                  }
                  placeholder="Nhập họ tên"
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  value={newUser.email || ""}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  placeholder="Nhập email"
                />
              </div>
              <div className="form-group">
                <label>Điện thoại:</label>
                <input
                  type="text"
                  value={newUser.soDienThoai || ""}
                  onChange={(e) =>
                    setNewUser({ ...newUser, soDienThoai: e.target.value })
                  }
                  placeholder="Nhập số điện thoại"
                />
              </div>
              <div className="form-group">
                <label>Địa chỉ:</label>
                <input
                  type="text"
                  value={newUser.diaChi || ""}
                  onChange={(e) =>
                    setNewUser({ ...newUser, diaChi: e.target.value })
                  }
                  placeholder="Nhập địa chỉ"
                />
              </div>

              <div className="form-group">
                <label>Vai trò:</label>
                <select
                  value={newUser.vaiTro || "khach_hang"}
                  onChange={(e) =>
                    setNewUser({ ...newUser, vaiTro: e.target.value })
                  }
                >
                  <option value="khach_hang">Khách hàng</option>
                  <option value="nhan_vien">Nhân viên</option>
                  <option value="quan_tri">Quản trị viên</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowAddModal(false)}
              >
                Hủy
              </button>
              <button className="btn-save" onClick={handleAddUser}>
                Thêm người dùng
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingUser && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chỉnh sửa người dùng</h3>
              <button
                className="close-btn"
                onClick={() => setShowEditModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Họ tên:</label>
                <input
                  type="text"
                  value={editingUser.hoTen}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, hoTen: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, email: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Điện thoại:</label>
                <input
                  type="text"
                  value={editingUser.soDienThoai}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      soDienThoai: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Địa chỉ:</label>
                <input
                  type="text"
                  value={editingUser.diaChi}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, diaChi: e.target.value })
                  }
                />
              </div>

              {editingUser.maNguoiDung !== currentUser?.maNguoiDung && (
                <div className="form-group">
                  <label>Vai trò:</label>
                  <select
                    value={editingUser.vaiTro}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, vaiTro: e.target.value })
                    }
                  >
                    <option value="khach_hang">Khách hàng</option>
                    <option value="nhan_vien">Nhân viên</option>
                    <option value="quan_tri">Quản trị viên</option>
                  </select>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowEditModal(false)}
              >
                Hủy
              </button>
              <button className="btn-save" onClick={handleSaveEdit}>
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersTab;
