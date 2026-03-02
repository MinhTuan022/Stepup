package stepup.shoes.service;

import stepup.shoes.dto.GioHangDTO;
import stepup.shoes.entity.GioHang;
import java.util.List;

public interface GioHangService {
    List<GioHangDTO> getCartByUser(Integer maNguoiDung);
    GioHangDTO addToCart(Integer maNguoiDung, Integer maChiTiet, Integer soLuong);
    GioHangDTO updateCartItem(Integer maNguoiDung, Integer maChiTiet, Integer soLuong);
    void removeCartItem(Integer maNguoiDung, Integer maChiTiet);
    void clearCart(Integer maNguoiDung);
}
