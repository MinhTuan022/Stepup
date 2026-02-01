import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import type { LoginRequest } from "../types";
import { Link, useNavigate } from "react-router-dom";
import "./LoginPage.css";

export const LoginPage = () => {
  const { login, isLoading, error, user } = useAuth();
  const navigate = useNavigate();
  // Điều hướng sang trang chủ nếu đã đăng nhập
  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);
  const [formData, setFormData] = useState<LoginRequest>({
    tenDangNhap: "",
    matKhau: "",
  });
  const [localError, setLocalError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setLocalError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.tenDangNhap.trim()) {
      setLocalError("Vui lòng nhập tên đăng nhập");
      return;
    }
    if (!formData.matKhau) {
      setLocalError("Vui lòng nhập mật khẩu");
      return;
    }

    try {
      await login(formData);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Đăng nhập thất bại");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>StepUp Shoes</h1>
          <p>Đăng nhập tài khoản</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {(error || localError) && (
            <div className="error-message">{error || localError}</div>
          )}

          <div className="form-group">
            <label htmlFor="tenDangNhap">Tên đăng nhập</label>
            <input
              type="text"
              id="tenDangNhap"
              name="tenDangNhap"
              value={formData.tenDangNhap}
              onChange={handleChange}
              placeholder="Nhập tên đăng nhập"
              disabled={isLoading}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="matKhau">Mật khẩu</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="matKhau"
                name="matKhau"
                value={formData.matKhau}
                onChange={handleChange}
                placeholder="Nhập mật khẩu"
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 12 }}>
          <span>Bạn chưa có tài khoản? </span>
          <Link to="/register">Đăng ký</Link>
        </div>

        
      </div>
    </div>
  );
};
