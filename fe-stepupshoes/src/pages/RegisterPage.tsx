import { useState } from "react";
import { authService } from "../services/api";
import "./RegisterPage.css";

interface RegisterForm {
  tenDangNhap: string;
  matKhau: string;
  hoTen: string;
  email: string;
  soDienThoai: string;
  diaChi: string;
}

export const RegisterPage = () => {
  const [form, setForm] = useState<RegisterForm>({
    tenDangNhap: "",
    matKhau: "",
    hoTen: "",
    email: "",
    soDienThoai: "",
    diaChi: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await authService.register(form);
      setSuccess("Đăng ký thành công! Bạn có thể đăng nhập.");
      setForm({
        tenDangNhap: "",
        matKhau: "",
        hoTen: "",
        email: "",
        soDienThoai: "",
        diaChi: "",
      });

      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h2>Đăng ký tài khoản</h2>
      <form className="register-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="tenDangNhap"
          placeholder="Tên đăng nhập"
          value={form.tenDangNhap}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="matKhau"
          placeholder="Mật khẩu"
          value={form.matKhau}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="hoTen"
          placeholder="Họ tên"
          value={form.hoTen}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="soDienThoai"
          placeholder="Số điện thoại"
          value={form.soDienThoai}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="diaChi"
          placeholder="Địa chỉ"
          value={form.diaChi}
          onChange={handleChange}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Đang đăng ký..." : "Đăng ký"}
        </button>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
      </form>
    </div>
  );
};
