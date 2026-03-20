import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./CheckoutPage.css";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { userService, cartService } from "../services/api";
import { BASE_IMAGE_URL } from "../constants";


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
  const [availableVouchers, setAvailableVouchers] = useState<any[]>([]);
  const [loadingVouchers, setLoadingVouchers] = useState(false);
  const [showVoucherDropdown, setShowVoucherDropdown] = useState(false);
  const [debouncedVoucher, setDebouncedVoucher] = useState("");
  const voucherRef = useRef<HTMLDivElement | null>(null);

  const location = useLocation();

  React.useEffect(() => {
    let mounted = true
    const loadProfile = async () => {
      if (!user) return
      try {
        const profile = await userService.getUserProfile(user.maNguoiDung)
        if (!mounted) return
        setName(profile?.hoTen || profile?.tenDangNhap || "")
        setAddress(profile?.diaChi || "")
        setPhone(profile?.soDienThoai || "")
      } catch (err) {
        console.error('Failed to load user profile for checkout:', err)
      }
    }
    loadProfile()
    return () => { mounted = false }
  }, [user])

  const selectedFromState: Array<{ maChiTiet: number; soLuong: number }> | undefined = (location.state as any)?.selectedItems;

  const itemsToCheckout = selectedFromState && selectedFromState.length > 0
    ? cart.filter(c => selectedFromState.some(s => s.maChiTiet === c.maChiTiet)).map(c => {
        const s = selectedFromState.find(s => s.maChiTiet === c.maChiTiet)!;
        return { ...c, soLuong: s.soLuong };
      })
    : cart;

  const total = itemsToCheckout.reduce((sum, item) => sum + (item.chiTietSanPham?.giaBan || 0) * item.soLuong, 0);
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

  React.useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoadingVouchers(true)
      try {
        if (!user) return
        const list = await (await import('../services/api')).userService.getApplicableVouchers(user.maNguoiDung, total)
        if (!mounted || !list) return
        setAvailableVouchers(list)
      } catch (err) {
        console.debug('Could not load vouchers list:', err)
      } finally {
        if (mounted) setLoadingVouchers(false)
      }
    }

    load()
    return () => { mounted = false }
  }, [total, user])

  const handleSelectVoucher = (v: any) => {
    const code = v.code || ''
    setVoucher(code)
    setVoucherInfo(v || null)
    showToast(`Đã chọn voucher ${code}`, 'success')
    setShowVoucherDropdown(false)
  }

  const handleRemoveVoucher = () => {
    setVoucher('')
    setVoucherInfo(null)
  }

  const handleVoucherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVoucher(e.target.value);
    if (voucherInfo) {
      setVoucherInfo(null);
    }
    setShowVoucherDropdown(true)
  };

  // Debounce voucher input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedVoucher(voucher.trim()), 300)
    return () => clearTimeout(t)
  }, [voucher])

  // Close dropdown on outside click
  useEffect(() => {
    const onDocClick = (ev: MouseEvent) => {
      if (!voucherRef.current) return
      if (!(ev.target instanceof Node)) return
      if (!voucherRef.current.contains(ev.target)) {
        setShowVoucherDropdown(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const filteredVouchers = availableVouchers.filter((v: any) => {
    const code = (v.code || '').toString().toLowerCase()
    const desc = (v.moTa || '').toString().toLowerCase()
    const q = debouncedVoucher.toLowerCase()
    return !q || code.includes(q) || desc.includes(q)
  }).slice(0, 10)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      showToast("Vui lòng đăng nhập để đặt hàng", "error");
      navigate("/login");
      return;
    }

    if (itemsToCheckout.length === 0) {
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
        items: itemsToCheckout.map(item => ({
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
        navigate(`/profile`, { state: { tab: 'orders' } });
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
            {itemsToCheckout.map((item) => (
              <li key={item.maChiTiet} className="checkout-cart-item">
                <div className="checkout-cart-img">
                  {item.chiTietSanPham?.hinhAnhChinh ? (
                    <img src={`${BASE_IMAGE_URL}${item.chiTietSanPham.hinhAnhChinh}`} alt={item.chiTietSanPham?.tenSanPham} />
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

          {/* ─── VOUCHER SECTION ─── */}
          <div className="form-group voucher-section" ref={voucherRef}>
            <label>Mã voucher (nếu có)</label>

            {voucherInfo?.valid ? (
              <div className="voucher-applied-badge">
                <div className="voucher-applied-info">
                  <span className="voucher-applied-code">{voucher}</span>
                  {voucherInfo.moTa && <span className="voucher-applied-desc">{voucherInfo.moTa}</span>}
                  <span className="voucher-applied-discount">Giảm {voucherInfo.soTienGiam.toLocaleString("vi-VN")}₫</span>
                </div>
                <button type="button" className="btn-remove-voucher" onClick={handleRemoveVoucher} title="Xóa voucher">✕</button>
              </div>
            ) : (
              <>
                <div className="voucher-input-row">
                  <div className="voucher-input-wrapper">
                    <input
                      type="text"
                      placeholder="Nhập hoặc chọn mã voucher..."
                      value={voucher}
                      onChange={handleVoucherChange}
                      onFocus={() => setShowVoucherDropdown(true)}
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      className={`btn-voucher-toggle ${showVoucherDropdown ? 'open' : ''}`}
                      onClick={() => setShowVoucherDropdown(v => !v)}
                      tabIndex={-1}
                      title="Xem danh sách voucher"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                  <button
                    type="button"
                    className="btn-check-voucher"
                    onClick={handleCheckVoucher}
                    disabled={checkingVoucher || !voucher.trim()}
                  >
                    {checkingVoucher ? "Đang kiểm tra..." : "Áp dụng"}
                  </button>
                </div>

                {/* Dropdown list */}
                {showVoucherDropdown && (
                  <div className="voucher-dropdown">
                    {loadingVouchers ? (
                      <div className="voucher-dropdown-empty">
                        <span className="voucher-loading-spinner" />
                        Đang tải danh sách voucher...
                      </div>
                    ) : filteredVouchers.length === 0 ? (
                      <div className="voucher-dropdown-empty">
                        {debouncedVoucher ? `Không tìm thấy voucher "${debouncedVoucher}"` : "Không có voucher khả dụng"}
                      </div>
                    ) : (
                      <>
                        <div className="voucher-dropdown-header">
                          {debouncedVoucher ? `Kết quả cho "${debouncedVoucher}"` : "Voucher có thể dùng"}
                        </div>
                        {filteredVouchers.map((v: any) => (
                          <div
                            key={v.code || v.maVoucher || v.id}
                            className={`voucher-item ${v.valid ? 'valid' : 'invalid'}`}
                            onClick={() => v.valid && handleSelectVoucher(v)}
                          >
                            <div className="voucher-item-left">
                              <div className="voucher-item-info">
                                <span className="voucher-item-code">{v.code}</span>
                                {v.moTa && <span className="voucher-item-desc">{v.moTa}</span>}
                              </div>
                            </div>
                            <div className="voucher-item-right">
                              <span className="voucher-item-amount">-{(v.soTienGiam || 0).toLocaleString('vi-VN')}₫</span>
                              {v.valid
                                ? <span className="voucher-item-btn">Chọn</span>
                                : <span className="voucher-item-invalid">Không hợp lệ</span>
                              }
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </>
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