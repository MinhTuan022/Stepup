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

interface FormErrors {
  tenDangNhap?: string;
  matKhau?: string;
  hoTen?: string;
  email?: string;
  soDienThoai?: string;
  diaChi?: string;
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
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    const trimmed = {
      tenDangNhap: form.tenDangNhap.trim(),
      matKhau: form.matKhau,
      hoTen: form.hoTen.trim(),
      email: form.email.trim(),
      soDienThoai: form.soDienThoai.trim(),
      diaChi: form.diaChi.trim(),
    };

    if (!trimmed.tenDangNhap) {
      errs.tenDangNhap = "Vui lòng nhập tên đăng nhập";
    } else if (trimmed.tenDangNhap.length < 3) {
      errs.tenDangNhap = "Tên đăng nhập tối thiểu 3 ký tự";
    }

    if (!trimmed.matKhau) {
      errs.matKhau = "Vui lòng nhập mật khẩu";
    } else if (trimmed.matKhau.length < 6) {
      errs.matKhau = "Mật khẩu tối thiểu 6 ký tự";
    }

    if (!trimmed.hoTen) {
      errs.hoTen = "Vui lòng nhập họ tên";
    }

    if (!trimmed.email) {
      errs.email = "Vui lòng nhập email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed.email)) {
      errs.email = "Email không hợp lệ";
    }

    if (!trimmed.soDienThoai) {
      errs.soDienThoai = "Vui lòng nhập số điện thoại";
    } else if (!/^(0[0-9]{9})$/.test(trimmed.soDienThoai)) {
      errs.soDienThoai = "Số điện thoại phải gồm 10 chữ số, bắt đầu bằng 0";
    }

    if (!trimmed.diaChi) {
      errs.diaChi = "Vui lòng nhập địa chỉ";
    }

    return errs;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name as keyof FormErrors]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

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
      <form className="register-form" onSubmit={handleSubmit} noValidate>
        <div className="form-field">
          <input
            type="text"
            name="tenDangNhap"
            placeholder="Tên đăng nhập"
            value={form.tenDangNhap}
            onChange={handleChange}
            className={errors.tenDangNhap ? "input-error" : ""}
          />
          {errors.tenDangNhap && <span className="field-error">{errors.tenDangNhap}</span>}
        </div>
        <div className="form-field">
          <input
            type="password"
            name="matKhau"
            placeholder="Mật khẩu"
            value={form.matKhau}
            onChange={handleChange}
            className={errors.matKhau ? "input-error" : ""}
          />
          {errors.matKhau && <span className="field-error">{errors.matKhau}</span>}
        </div>
        <div className="form-field">
          <input
            type="text"
            name="hoTen"
            placeholder="Họ tên"
            value={form.hoTen}
            onChange={handleChange}
            className={errors.hoTen ? "input-error" : ""}
          />
          {errors.hoTen && <span className="field-error">{errors.hoTen}</span>}
        </div>
        <div className="form-field">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className={errors.email ? "input-error" : ""}
          />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>
        <div className="form-field">
          <input
            type="text"
            name="soDienThoai"
            placeholder="Số điện thoại"
            value={form.soDienThoai}
            onChange={handleChange}
            className={errors.soDienThoai ? "input-error" : ""}
          />
          {errors.soDienThoai && <span className="field-error">{errors.soDienThoai}</span>}
        </div>
        <div className="form-field">
          <input
            type="text"
            name="diaChi"
            placeholder="Địa chỉ"
            value={form.diaChi}
            onChange={handleChange}
            className={errors.diaChi ? "input-error" : ""}
          />
          {errors.diaChi && <span className="field-error">{errors.diaChi}</span>}
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Đang đăng ký..." : "Đăng ký"}
        </button>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
      </form>
    </div>
  );
};
