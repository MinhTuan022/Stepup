import { useState, forwardRef, useImperativeHandle } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import "./Cart.css";

export interface CartRef {
  open: () => void;
  close: () => void;
}

const Cart = forwardRef<CartRef>((_props, ref) => {
  const { cart, loading, error, updateCartItem, removeCartItem, clearCart } = useCart();
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const navigate = useNavigate();

  useImperativeHandle(ref, () => ({
    open: () => setOpen(true),
    close: () => setOpen(false),
  }));
  const handleChangeQuantity = async (maChiTiet: number, value: number) => {
    if (value > 0) {
      await updateCartItem(maChiTiet, value);
      setToast("Cập nhật số lượng thành công");
    }
  };

  const handleRemove = async (maChiTiet: number) => {
    await removeCartItem(maChiTiet);
    setToast("Đã xóa sản phẩm khỏi giỏ hàng");
  };

  const handleClear = async () => {
    if (window.confirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng?")) {
      await clearCart();
      setToast("Đã xóa toàn bộ giỏ hàng");
    }
  };

  const handleCheckout = () => {
    setOpen(false);
    navigate("/checkout");
  };

  const incrementQuantity = (maChiTiet: number, currentQty: number, maxQty: number) => {
    if (currentQty < maxQty) {
      handleChangeQuantity(maChiTiet, currentQty + 1);
    }
  };

  const decrementQuantity = (maChiTiet: number, currentQty: number) => {
    if (currentQty > 1) {
      handleChangeQuantity(maChiTiet, currentQty - 1);
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.chiTietSanPham?.giaBan || 0) * item.soLuong, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.soLuong, 0);

  return (
    <>
      {open && (
        <div className="modern-cart-overlay" onClick={() => setOpen(false)} />
      )}

      <div className={`modern-cart-sidebar ${open ? "open" : ""}`}>
        <div className="modern-cart-header">
          <div className="cart-header-content">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <div>
              <h2>Giỏ hàng</h2>
              <span className="cart-item-count">{itemCount} sản phẩm</span>
            </div>
          </div>
          <button className="modern-cart-close" onClick={() => setOpen(false)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="modern-cart-body">
          {loading ? (
            <div className="cart-state-message">
              <div className="cart-spinner"></div>
              <p>Đang tải giỏ hàng...</p>
            </div>
          ) : error ? (
            <div className="cart-state-message cart-error-message">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p>{error}</p>
            </div>
          ) : cart.length === 0 ? (
            <div className="cart-state-message cart-empty-message">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              <h3>Giỏ hàng trống</h3>
              <p>Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
              <button className="btn-continue-shopping" onClick={() => setOpen(false)}>
                Tiếp tục mua sắm
              </button>
            </div>
          ) : (
            <div className="modern-cart-list">
              {cart.map((item) => (
                <div key={item.maChiTiet} className="modern-cart-item">
                  <div className="cart-item-image">
                    {item.chiTietSanPham?.hinhAnhChinh ? (
                      <img src={item.chiTietSanPham.hinhAnhChinh} alt={item.chiTietSanPham?.tenSanPham} />
                    ) : (
                      <div className="cart-image-placeholder">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <path d="m21 15-5-5L5 21"/>
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="cart-item-details">
                    <h4 className="cart-item-name">{item.chiTietSanPham?.tenSanPham || `Sản phẩm ${item.maChiTiet}`}</h4>
                    <div className="cart-item-variants">
                      <span className="variant-badge">{item.chiTietSanPham?.mauSac}</span>
                      <span className="variant-badge">{item.chiTietSanPham?.size}</span>
                    </div>
                    <div className="cart-item-price-row">
                      <span className="cart-item-price">{item.chiTietSanPham?.giaBan?.toLocaleString("vi-VN")}₫</span>
                      <span className="cart-item-total">
                        {((item.chiTietSanPham?.giaBan || 0) * item.soLuong).toLocaleString("vi-VN")}₫
                      </span>
                    </div>

                    <div className="cart-item-controls">
                      <div className="quantity-control">
                        <button 
                          className="qty-btn"
                          onClick={() => decrementQuantity(item.maChiTiet, item.soLuong)}
                          disabled={item.soLuong <= 1}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <line x1="5" y1="12" x2="19" y2="12"/>
                          </svg>
                        </button>
                        <span className="qty-value">{item.soLuong}</span>
                        <button 
                          className="qty-btn"
                          onClick={() => incrementQuantity(item.maChiTiet, item.soLuong, item.chiTietSanPham?.soLuongTon || 999)}
                          disabled={item.soLuong >= (item.chiTietSanPham?.soLuongTon || 0)}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <line x1="12" y1="5" x2="12" y2="19"/>
                            <line x1="5" y1="12" x2="19" y2="12"/>
                          </svg>
                        </button>
                      </div>
                      <button 
                        className="remove-btn"
                        onClick={() => handleRemove(item.maChiTiet)}
                        title="Xóa sản phẩm"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          <line x1="10" y1="11" x2="10" y2="17"/>
                          <line x1="14" y1="11" x2="14" y2="17"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="modern-cart-footer">
            <div className="cart-summary">
              <div className="summary-row">
                <span>Tạm tính</span>
                <span>{total.toLocaleString("vi-VN")}₫</span>
              </div>
              <div className="summary-row shipping">
                <span>Phí vận chuyển</span>
                <span className="free-badge">Miễn phí</span>
              </div>
              <div className="summary-divider" />
              <div className="summary-row total-row">
                <span>Tổng cộng</span>
                <span className="total-value">{total.toLocaleString("vi-VN")}₫</span>
              </div>
            </div>

            <button className="btn-checkout-modern" onClick={handleCheckout}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
              Thanh toán ngay
            </button>

            <button className="btn-clear-cart" onClick={handleClear}>
              Xóa toàn bộ giỏ hàng
            </button>
          </div>
        )}
      </div>

      {toast && (
        <div className="modern-cart-toast" onAnimationEnd={() => setToast(null)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          {toast}
        </div>
      )}
    </>
  );
});

Cart.displayName = "Cart";

export default Cart;
