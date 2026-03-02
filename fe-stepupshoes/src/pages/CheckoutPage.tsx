import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/CheckoutPage.css";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { userService, cartService } from "../services/api";


const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [voucher, setVoucher] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [voucherInfo, setVoucherInfo] = useState<any>(null);
  const [checkingVoucher, setCheckingVoucher] = useState(false);

  const total = cart.reduce((sum, item) => sum + (item.chiTietSanPham?.giaBan || 0) * item.soLuong, 0);
  const discount = voucherInfo?.valid ? voucherInfo.soTienGiam : 0;
  const finalTotal = total - discount;

  const handleCheckVoucher = async () => {
    if (!voucher.trim()) {
      showToast("Vui lòng nhập mã voucher", "error");
      return;
    }

    setCheckingVoucher(true);
    try {
      const result = await userService.validateVoucher(voucher.trim(), total);
      if (result.valid) {
        setVoucherInfo(result);
        showToast(result.message, "success");
      } else {
        setVoucherInfo(null);
        showToast(result.message, "error");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Lỗi khi kiểm tra voucher";
      showToast(message, "error");
      setVoucherInfo(null);
    } finally {
      setCheckingVoucher(false);
    }
  };

  const handleVoucherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVoucher(e.target.value);
    if (voucherInfo) {
      setVoucherInfo(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      showToast("Vui lòng đăng nhập để đặt hàng", "error");
      navigate("/login");
      return;
    }

    if (cart.length === 0) {
      showToast("Giỏ hàng trống", "error");
      return;
    }

    if (!name.trim() || !address.trim() || !phone.trim()) {
      showToast("Vui lòng điền đầy đủ thông tin giao hàng", "error");
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        nguoiNhan: name.trim(),
        soDienThoaiNhan: phone.trim(),
        diaChiGiaoHang: address.trim(),
        ghiChu: note.trim() || undefined,
        maVoucher: voucher.trim() || undefined,
        items: cart.map(item => ({
          maChiTiet: item.maChiTiet,
          soLuong: item.soLuong,
        })),
      };

      await userService.createOrder(user.maNguoiDung, orderData);
      
      try {
        await cartService.clearCart(user.maNguoiDung);
        clearCart();
      } catch (err) {
        console.error("Failed to clear cart:", err);
      }

      showToast("Đặt hàng thành công!", "success");
      
      setTimeout(() => {
        navigate(`/user/profile`);
      }, 1500);
      
    } catch (error) {
      const message = error instanceof Error ? error.message : "Lỗi khi đặt hàng";
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-container">
      <h2 className="checkout-title">Thanh toán đơn hàng</h2>
      <div className="checkout-content">
        <div className="checkout-cart-section">
          <h3 className="checkout-subtitle">Giỏ hàng của bạn</h3>
          <ul className="checkout-cart-list">
            {cart.map((item) => (
              <li key={item.maChiTiet} className="checkout-cart-item">
                <div className="checkout-cart-img">
                  {item.chiTietSanPham?.hinhAnhChinh ? (
                    <img src={item.chiTietSanPham.hinhAnhChinh} alt={item.chiTietSanPham?.tenSanPham} />
                  ) : (
                    <div className="checkout-cart-img-placeholder" />
                  )}
                </div>
                <div className="checkout-cart-info">
                  <div className="checkout-cart-name">{item.chiTietSanPham?.tenSanPham || item.maChiTiet}</div>
                  <div className="checkout-cart-meta">
                    <span>Màu: {item.chiTietSanPham?.mauSac}</span>
                    <span>Size: {item.chiTietSanPham?.size}</span>
                  </div>
                  <div className="checkout-cart-price">{item.chiTietSanPham?.giaBan?.toLocaleString("vi-VN")}₫</div>
                  <div className="checkout-cart-qty">x{item.soLuong}</div>
                </div>
              </li>
            ))}
          </ul>
          <div className="checkout-cart-summary">
            <div className="checkout-cart-row">
              <span>Tạm tính:</span>
              <span>{total.toLocaleString("vi-VN")}₫</span>
            </div>
            {voucherInfo?.valid && (
              <div className="checkout-cart-row checkout-discount">
                <span>Giảm giá ({voucher}):</span>
                <span className="discount-value">-{discount.toLocaleString("vi-VN")}₫</span>
              </div>
            )}
            <div className="checkout-cart-total">
              <span>Tổng cộng:</span>
              <span className="checkout-cart-total-value">{finalTotal.toLocaleString("vi-VN")}₫</span>
            </div>
          </div>
        </div>
        <form className="checkout-form" onSubmit={handleSubmit}>
          <h3 className="checkout-subtitle">Thông tin nhận hàng</h3>
          <div className="form-group">
            <label>Họ tên</label>
            <input value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Địa chỉ nhận hàng</label>
            <input value={address} onChange={e => setAddress(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Số điện thoại</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Mã voucher (nếu có)</label>
            <div className="voucher-input-group">
              <input 
                type="text"
                placeholder="Nhập mã voucher để được giảm giá"
                value={voucher} 
                onChange={handleVoucherChange}
              />
              <button 
                type="button" 
                className="btn-check-voucher"
                onClick={handleCheckVoucher}
                disabled={checkingVoucher || !voucher.trim()}
              >
                {checkingVoucher ? "Đang kiểm tra..." : "Kiểm tra"}
              </button>
            </div>
            {voucherInfo?.valid && (
              <div className="voucher-info success">
                <div className="voucher-details">
                  <div className="voucher-message">{voucherInfo.message}</div>
                  {voucherInfo.moTa && (
                    <div className="voucher-desc">{voucherInfo.moTa}</div>
                  )}
                  <div className="voucher-discount">
                    Giảm giá: <strong>{voucherInfo.soTienGiam.toLocaleString("vi-VN")}₫</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="form-group">
            <label>Ghi chú (nếu có)</label>
            <textarea 
              placeholder="Ghi chú cho đơn hàng (màu sắc, size, yêu cầu đặc biệt...)"
              value={note} 
              onChange={e => setNote(e.target.value)}
              rows={3}
              style={{ resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>
          <div className="form-group">
            <label>Phương thức thanh toán</label>
            <div className="payment-method-info">
              <input type="text" value="Thanh toán khi nhận hàng (COD)" disabled />
              <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>
                Bạn sẽ thanh toán bằng tiền mặt khi nhận hàng
              </small>
            </div>
          </div>
          <button type="submit" className="btn-checkout" disabled={loading || cart.length === 0}>
            {loading ? "Đang xử lý..." : "Xác nhận đặt hàng"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
