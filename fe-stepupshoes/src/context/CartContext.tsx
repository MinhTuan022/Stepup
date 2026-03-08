import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";
import { cartService } from "../services/api";

export interface CartItem {
  maGioHang: number;
  maNguoiDung: number;
  maChiTiet: number;
  soLuong: number;
  chiTietSanPham?: any;
}

interface CartContextType {
  cart: CartItem[];
  loading: boolean;
  error: string | null;
  fetchCart: () => void;
  addToCart: (maChiTiet: number, soLuong: number) => Promise<void>;
  updateCartItem: (maChiTiet: number, soLuong: number) => Promise<void>;
  removeCartItem: (maChiTiet: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await cartService.getCart(user.maNguoiDung);
      setCart(data);
    } catch (err) {
      setError("Lỗi khi tải giỏ hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (maChiTiet: number, soLuong: number) => {
    if (!user) return;
    setLoading(true);
    try {
      await cartService.addToCart(user.maNguoiDung, maChiTiet, soLuong);
      await fetchCart();
      showToast && showToast('Thêm vào giỏ hàng thành công', 'success');
    } catch (err) {
      setError("Lỗi khi thêm vào giỏ hàng");
      showToast && showToast('Thêm vào giỏ hàng thất bại', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (maChiTiet: number, soLuong: number) => {
    if (!user) return;
    setLoading(true);
    try {
      await cartService.updateCartItem(user.maNguoiDung, maChiTiet, soLuong);
      await fetchCart();
    } catch (err) {
      setError("Lỗi khi cập nhật giỏ hàng");
    } finally {
      setLoading(false);
    }
  };

  const removeCartItem = async (maChiTiet: number) => {
    if (!user) return;
    setLoading(true);
    try {
      await cartService.removeCartItem(user.maNguoiDung, maChiTiet);
      await fetchCart();
    } catch (err) {
      setError("Lỗi khi xóa sản phẩm khỏi giỏ hàng");
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await cartService.clearCart(user.maNguoiDung);
      await fetchCart();
    } catch (err) {
      setError("Lỗi khi xóa toàn bộ giỏ hàng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider value={{ cart, loading, error, fetchCart, addToCart, updateCartItem, removeCartItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
