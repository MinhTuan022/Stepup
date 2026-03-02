package stepup.shoes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO cho yêu cầu tạo đơn hàng online từ khách hàng
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderRequestDTO {
    
    private Integer maNguoiDung;
    
    private String nguoiNhan;
    
    private String soDienThoaiNhan;
    
    private String diaChiGiaoHang;
    
    private String ghiChu;
    
    private String maVoucher; // Mã voucher nếu có
    
    private List<OrderItemDTO> items; // Danh sách sản phẩm trong đơn hàng
    
    /**
     * DTO cho từng item trong đơn hàng
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemDTO {
        private Integer maChiTiet; // Mã chi tiết sản phẩm
        private Integer soLuong; // Số lượng
    }
}
